from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Rubrica, EvaluacionGrupo, Calificacion
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
            return Rubrica.objects.prefetch_related('criterios').all()
        return Rubrica.objects.prefetch_related('criterios').filter(creador_id=user.id)

    def create(self, request, *args, **kwargs):
        ser = RubricaCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        rubrica = ser.create(user_id=request.user.id)
        return Response(RubricaSerializer(rubrica).data, status=status.HTTP_201_CREATED)


class EvaluacionGrupoViewSet(viewsets.ModelViewSet):
    serializer_class = EvaluacionGrupoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = EvaluacionGrupo.objects.select_related('rubrica').all()
        grupo_id = self.request.query_params.get('grupo_agon_id')
        if grupo_id:
            qs = qs.filter(grupo_agon_id=grupo_id)
        return qs

    def perform_create(self, serializer):
        # Guardar nombre del grupo si viene en el request
        grupo_nombre = self.request.data.get('grupo_nombre', '')
        serializer.save(grupo_nombre=grupo_nombre)


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
        # Estudiante solo ve las suyas
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'STUDENT':
            qs = qs.filter(usuario_agon_id=user.id)
        return qs

    @action(detail=False, methods=['post'], url_path='guardar_batch')
    def guardar_batch(self, request):
        """Crea o actualiza la calificación de un estudiante."""
        ser = CalificacionSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        obj, created = Calificacion.objects.update_or_create(
            evaluacion_grupo_id=ser.validated_data['evaluacion_grupo'].id,
            usuario_agon_id=ser.validated_data['usuario_agon_id'],
            defaults={
                'puntajes': ser.validated_data.get('puntajes', {}),
                'nota_final': ser.validated_data.get('nota_final', 0),
                'comentarios': ser.validated_data.get('comentarios', ''),
            }
        )
        code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(CalificacionSerializer(obj).data, status=code)
