from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Rubrica, Criterio, NivelCriterio, EvaluacionGrupo, Calificacion
from .serializers import (
    RubricaSerializer, RubricaCreateSerializer,
    EvaluacionGrupoSerializer, CalificacionSerializer
)


class RubricaViewSet(viewsets.ModelViewSet):
    serializer_class = RubricaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'ADMIN':
            return Rubrica.objects.prefetch_related('criterios__niveles').all()
        return Rubrica.objects.prefetch_related('criterios__niveles').filter(creador_id=user.id)

    def create(self, request, *args, **kwargs):
        ser = RubricaCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        rubrica = ser.create(user_id=request.user.id)
        return Response(RubricaSerializer(rubrica).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Actualiza una rúbrica existente (PUT/PATCH). Reemplaza criterios y niveles."""
        partial = kwargs.pop('partial', False)
        rubrica = self.get_object()

        ser = RubricaCreateSerializer(data=request.data, partial=partial)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        # Actualizar campos básicos
        rubrica.titulo = data.get('titulo', rubrica.titulo)
        rubrica.descripcion = data.get('descripcion', rubrica.descripcion)
        rubrica.cant_evaluadores = data.get('cant_evaluadores', rubrica.cant_evaluadores)
        rubrica.save()

        # Reemplazar criterios solo si se enviaron
        if 'criterios' in data:
            rubrica.criterios.all().delete()  # elimina en cascada los niveles
            for i, c in enumerate(data['criterios']):
                criterio = Criterio.objects.create(
                    rubrica=rubrica, nombre=c['nombre'], orden=i
                )
                for n in c.get('niveles', []):
                    NivelCriterio.objects.create(
                        criterio=criterio,
                        valor=n['valor'],
                        descripcion=n.get('descripcion', ''),
                    )

        return Response(RubricaSerializer(rubrica).data)


class EvaluacionGrupoViewSet(viewsets.ModelViewSet):
    serializer_class = EvaluacionGrupoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = EvaluacionGrupo.objects.select_related('rubrica__criterios').prefetch_related('rubrica__criterios__niveles')
        grupo_id = self.request.query_params.get('grupo_agon_id')
        if grupo_id:
            qs = qs.filter(grupo_agon_id=grupo_id)
        return qs

    def create(self, request, *args, **kwargs):
        """Crea solo si no existe ya esa rúbrica asignada a ese grupo."""
        rubrica_id = request.data.get('rubrica')
        grupo_id   = request.data.get('grupo_agon_id')
        existing   = EvaluacionGrupo.objects.filter(rubrica_id=rubrica_id, grupo_agon_id=grupo_id).first()
        if existing:
            return Response(EvaluacionGrupoSerializer(existing).data, status=status.HTTP_200_OK)
        grupo_nombre = request.data.get('grupo_nombre', '')
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(grupo_nombre=grupo_nombre)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CalificacionViewSet(viewsets.ModelViewSet):
    serializer_class = CalificacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Calificacion.objects.all()
        eval_id = self.request.query_params.get('evaluacion_id')
        user_id = self.request.query_params.get('usuario_agon_id')
        if eval_id:
            qs = qs.filter(evaluacion_grupo_id=eval_id)
        if user_id:
            qs = qs.filter(usuario_agon_id=user_id)
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'STUDENT':
            qs = qs.filter(usuario_agon_id=user.id)
        return qs

    @action(detail=False, methods=['post'], url_path='guardar_batch')
    def guardar_batch(self, request):
        """
        Crea o actualiza la calificación de un estudiante.
        Acepta: { evaluacion_grupo: id, usuario_agon_id: id, puntajes: {}, nota_final: 0.0 }
        """
        evaluacion_grupo_id = request.data.get('evaluacion_grupo')
        usuario_agon_id     = request.data.get('usuario_agon_id')
        puntajes            = request.data.get('puntajes', {})
        nota_final          = request.data.get('nota_final', 0)

        if not evaluacion_grupo_id or not usuario_agon_id:
            return Response(
                {'error': 'Se requieren evaluacion_grupo y usuario_agon_id'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            nota_final = float(nota_final)
        except (TypeError, ValueError):
            nota_final = 0.0

        obj, created = Calificacion.objects.update_or_create(
            evaluacion_grupo_id=evaluacion_grupo_id,
            usuario_agon_id=usuario_agon_id,
            defaults={
                'puntajes': puntajes,
                'nota_final': nota_final,
            }
        )
        code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(CalificacionSerializer(obj).data, status=code)
