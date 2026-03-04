"""
actas/views/registros.py
ViewSets para el modelo Acta (estudiantil) y Documento.
Lógica de Recreeo: Acta ligada a Documento base + Cohorte + Docente Asesor de AGON.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Acta, Documento
from ..serializers import ActaSerializer, DocumentoSerializer


class DocumentoViewSet(viewsets.ModelViewSet):
    queryset          = Documento.objects.all().order_by('-date')
    serializer_class  = DocumentoSerializer
    permission_classes = [IsAuthenticated]


class ActaViewSet(viewsets.ModelViewSet):
    queryset          = Acta.objects.select_related('linked_doc', 'group').all()
    serializer_class  = ActaSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """
        Crea un acta estudiantil.
        Guarda advisor_name en caché para no depender de AGON en lecturas.
        """
        serializer = self.get_serializer(data=request.data.copy())
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Devuelve todos los datos de un acta para la vista previa."""
        acta = self.get_object()
        serializer = self.get_serializer(acta)
        data = serializer.data
        if acta.linked_doc:
            data['linked_doc_purpose'] = acta.linked_doc.purpose
        return Response(data)
