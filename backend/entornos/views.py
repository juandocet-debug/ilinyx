"""
entornos/views.py
CRUD de Entornos, Cortes y Entregables.
Incluye acción especial para activar un Entregable (crea EvaluacionGrupo por cada grupo).
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import requests as http_requests
from django.conf import settings

from .models import Entorno, Corte, Entregable
from .serializers import (
    EntornoSerializer, EntornoCreateSerializer,
    CorteSerializer, CorteCreateSerializer,
    EntregableSerializer, EntregableCreateSerializer,
)


class EntornoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return EntornoCreateSerializer
        return EntornoSerializer

    def get_queryset(self):
        user     = self.request.user
        is_admin = getattr(user, 'role', '') == 'ADMIN'
        qs = Entorno.objects.prefetch_related('cortes__entregables')
        return qs if is_admin else qs.filter(profesor_id=user.id)

    def perform_create(self, serializer):
        serializer.save(profesor_id=self.request.user.id)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return Response(EntornoSerializer(instance).data)

    @action(detail=True, methods=['get'], url_path='seguimiento')
    def seguimiento(self, request, pk=None):
        """
        Dashboard Agregado: Combina estudiantes de los grupos de AGON
        con las calificaciones de las rúbricas (EvaluacionGrupo) de este entorno.
        Calcula notas por entregable, corte y nota final del entorno.
        """
        entorno = self.get_object()
        agon_url = getattr(settings, 'AGON_API_URL', None)
        api_key  = getattr(settings, 'ILINYX_API_KEY', None)

        if not agon_url or not api_key:
            return Response({'detail': 'Servicio AGON no configurado.'}, status=503)

        # 1. Traer datos de AGON para extraer estudiantes de estos grupos
        target_url = f'{agon_url}/users/courses-for-ilinyx/'
        all_courses = []
        try:
            resp = http_requests.get(target_url, headers={'X-Ilinyx-Api-Key': api_key}, timeout=15)
            if resp.status_code == 200:
                all_courses = resp.json()
        except Exception as e:
            return Response({'detail': 'No se pudo conectar a AGON.'}, status=502)

        estudiantes_dict = {}
        for c in all_courses:
            if c.get('id') in (entorno.grupos_agon_ids or []):
                for s in c.get('students', []):
                    uid = s.get('id')
                    if uid not in estudiantes_dict:
                        estudiantes_dict[uid] = {
                            'id': uid,
                            'nombre': f"{s.get('first_name', '')} {s.get('last_name', '')}".strip(),
                            'nombres': s.get('first_name', ''),
                            'apellidos': s.get('last_name', ''),
                            'grupo_nombre': c.get('name'),
                            'cortes': {},
                            'nota_final': 0.0
                        }

        # 2. Obtener estructura de cortes y entregables
        from evaluaciones.models import Calificacion, EvaluacionGrupo
        cortes = entorno.cortes.all()
        estructura_cortes = []
        
        # Mapeo: rubrica_id -> [entregable_ref]
        entregables_por_rubrica = {}
        
        for c in cortes:
            corte_info = {
                'id': c.id,
                'nombre': c.nombre,
                'porcentaje': float(c.porcentaje),
                'entregables': []
            }
            # Solo entregables activos
            for e in c.entregables.filter(activo=True):
                ent = {
                    'id': e.id,
                    'nombre': e.nombre,
                    'tipo': e.tipo,
                    'peso': float(e.peso),
                    'rubrica_id': e.rubrica_id
                }
                corte_info['entregables'].append(ent)
                if e.tipo == Entregable.TIPO_RUBRICA and e.rubrica_id:
                    if e.rubrica_id not in entregables_por_rubrica:
                        entregables_por_rubrica[e.rubrica_id] = []
                    entregables_por_rubrica[e.rubrica_id].append({
                        'corte_id': c.id,
                        'entregable_id': e.id
                    })
            estructura_cortes.append(corte_info)

        # 3. Traer Calificaciones (solo de las rúbricas activas en los grupos del entorno)
        # Notas: Una rubrica podría estar asignada a varios grupos.
        calificaciones = Calificacion.objects.filter(
            evaluacion_grupo__rubrica_id__in=entregables_por_rubrica.keys(),
            evaluacion_grupo__grupo_agon_id__in=(entorno.grupos_agon_ids or [])
        ).select_related('evaluacion_grupo')

        # 4. Asignar notas a los estudiantes
        for calif in calificaciones:
            uid = calif.usuario_agon_id
            if uid in estudiantes_dict:
                rubrica_id = calif.evaluacion_grupo.rubrica_id
                refs = entregables_por_rubrica.get(rubrica_id, [])
                for ref in refs:
                    corte_id = ref['corte_id']
                    ent_id = ref['entregable_id']
                    if corte_id not in estudiantes_dict[uid]['cortes']:
                        estudiantes_dict[uid]['cortes'][corte_id] = {'entregables': {}, 'nota_corte': 0.0}
                    
                    # Guardamos la nota
                    estudiantes_dict[uid]['cortes'][corte_id]['entregables'][ent_id] = float(calif.nota_final)

        # 5. Calcular promedios
        estudiantes_lista = list(estudiantes_dict.values())
        for est in estudiantes_lista:
            nota_final_entorno = 0.0
            
            # Reestructurar cortes para la vista plana y cálculo
            vista_cortes = []
            for c in estructura_cortes:
                corte_id = c['id']
                peso_corte = c['porcentaje'] / 100.0
                
                nota_corte = 0.0
                vista_entregables = []
                suma_pesos_entregables = sum(e['peso'] for e in c['entregables'])
                
                est_corte_data = est['cortes'].get(corte_id, {'entregables': {}})
                
                for e in c['entregables']:
                    ent_id = e['id']
                    nota = est_corte_data['entregables'].get(ent_id, 0.0)
                    peso_relativo = (e['peso'] / suma_pesos_entregables) if suma_pesos_entregables > 0 else 0
                    
                    nota_corte += nota * peso_relativo
                    vista_entregables.append({
                        'id': ent_id,
                        'nota': nota
                    })
                
                nota_final_entorno += nota_corte * peso_corte
                vista_cortes.append({
                    'id': corte_id,
                    'nota_corte': round(nota_corte, 2),
                    'entregables': vista_entregables
                })
            
            est['cortes'] = vista_cortes
            est['nota_final'] = round(nota_final_entorno, 2)
            
        # Ordenar estudiantes por apellido y luego nombre
        estudiantes_lista.sort(key=lambda x: (x['apellidos'].lower(), x['nombres'].lower()))

        return Response({
            'estructura': estructura_cortes,
            'estudiantes': estudiantes_lista
        })


class CorteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return CorteCreateSerializer
        return CorteSerializer

    def get_queryset(self):
        entorno_id = self.request.query_params.get('entorno_id')
        qs = Corte.objects.prefetch_related('entregables')
        if entorno_id:
            qs = qs.filter(entorno_id=entorno_id)
        return qs

    def perform_create(self, serializer):
        entorno_id = self.request.data.get('entorno')
        serializer.save(entorno_id=entorno_id)


class EntregableViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return EntregableCreateSerializer
        return EntregableSerializer

    def get_queryset(self):
        corte_id = self.request.query_params.get('corte_id')
        qs = Entregable.objects.select_related('rubrica')
        return qs.filter(corte_id=corte_id) if corte_id else qs

    def perform_create(self, serializer):
        corte_id = self.request.data.get('corte')
        serializer.save(corte_id=corte_id)

    @action(detail=True, methods=['post'], url_path='activar')
    def activar(self, request, pk=None):
        """
        Activa el entregable y crea EvaluacionGrupo por cada grupo del Entorno.
        Si ya existe EvaluacionGrupo para ese grupo y rúbrica, no duplica.
        """
        entregable = self.get_object()

        if entregable.tipo != Entregable.TIPO_RUBRICA or not entregable.rubrica_id:
            entregable.activo = True
            entregable.save(update_fields=['activo'])
            return Response(EntregableSerializer(entregable).data)

        from evaluaciones.models import EvaluacionGrupo

        entorno = entregable.corte.entorno
        creados = 0
        for grupo_id in (entorno.grupos_agon_ids or []):
            _, created = EvaluacionGrupo.objects.get_or_create(
                rubrica_id=entregable.rubrica_id,
                grupo_agon_id=grupo_id,
                defaults={'grupo_nombre': f'Grupo {grupo_id}'},
            )
            if created:
                creados += 1

        entregable.activo = True
        entregable.save(update_fields=['activo'])

        return Response({
            **EntregableSerializer(entregable).data,
            'evaluaciones_creadas': creados,
        })

    @action(detail=True, methods=['post'], url_path='desactivar')
    def desactivar(self, request, pk=None):
        entregable = self.get_object()
        entregable.activo = False
        entregable.save(update_fields=['activo'])
        return Response(EntregableSerializer(entregable).data)
