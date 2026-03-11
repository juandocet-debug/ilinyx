"""
entornos/views.py
CRUD de Entornos, Cortes y Entregables.
Incluye acción especial para activar un Entregable (crea EvaluacionGrupo por cada grupo).
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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
