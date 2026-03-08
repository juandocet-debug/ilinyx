from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Rubrica, Criterio, EvaluacionGrupo, Calificacion
from .serializers import RubricaSerializer, EvaluacionGrupoSerializer, CalificacionSerializer

class RubricaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = RubricaSerializer

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') == 'TEACHER':
            return Rubrica.objects.filter(creador_id=user.id)
        return Rubrica.objects.all()

    def create(self, request, *args, **kwargs):
        criterios_data = request.data.pop('criterios', [])
        data = dict(request.data)
        data['creador_id'] = request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        rubrica = serializer.save()

        for idx, crit in enumerate(criterios_data):
            # crit can be a dict or a string depending on frontend sent data
            nombre = crit.get('nombre') if isinstance(crit, dict) else crit
            if nombre:
                Criterio.objects.create(rubrica=rubrica, nombre=nombre, orden=idx)
        
        return Response(self.get_serializer(rubrica).data, status=status.HTTP_201_CREATED)

class EvaluacionGrupoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EvaluacionGrupoSerializer
    
    def get_queryset(self):
        grupo_id = self.request.query_params.get('grupo_id')
        if grupo_id:
            return EvaluacionGrupo.objects.filter(grupo_id=grupo_id)
        return EvaluacionGrupo.objects.all()

class CalificacionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CalificacionSerializer

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') == 'STUDENT':
            return Calificacion.objects.filter(estudiante_id=user.id)
        
        evaluacion_id = self.request.query_params.get('evaluacion_id')
        if evaluacion_id:
            return Calificacion.objects.filter(evaluacion_grupo_id=evaluacion_id)
        return Calificacion.objects.all()

    @action(detail=False, methods=['post'])
    def guardar_batch(self, request):
        """
        Recibe {"evaluacion_grupo": 1, "estudiante_id": 45, "puntajes": {"1": 4, "2": 3}}
        Promedia puntajes automáticamente.
        """
        data = request.data
        evaluacion_id = data.get('evaluacion_grupo')
        estudiante_id = data.get('estudiante_id')
        puntajes = data.get('puntajes', {})
        comentarios = data.get('comentarios', '')

        # Calcular nota final promediando de 1 a 5
        vals = [float(v) for v in puntajes.values() if v]
        nota_final = sum(vals) / len(vals) if vals else 0.0

        calif, created = Calificacion.objects.update_or_create(
            evaluacion_grupo_id=evaluacion_id,
            evaluador_id=request.user.id,
            estudiante_id=estudiante_id,
            defaults={
                'puntajes': puntajes,
                'nota_final': nota_final,
                'comentarios': comentarios
            }
        )
        return Response(self.get_serializer(calif).data)
