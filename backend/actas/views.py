from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Acta, Documento
from .serializers import ActaSerializer, DocumentoSerializer
import requests as http_requests
from django.conf import settings


class DocumentoViewSet(viewsets.ModelViewSet):
    queryset = Documento.objects.all().order_by('-date')
    serializer_class = DocumentoSerializer
    permission_classes = [IsAuthenticated]


class ActaViewSet(viewsets.ModelViewSet):
    queryset = Acta.objects.select_related('linked_doc', 'group').all()
    serializer_class = ActaSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """
        Crea un acta.
        Guarda advisor_name en cache para no depender de Agon en lecturas.
        """
        data = request.data.copy()
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    from rest_framework.decorators import action
    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """
        Devuelve todos los datos de un acta para la vista previa.
        """
        acta = self.get_object()
        serializer = self.get_serializer(acta)
        data = serializer.data
        if acta.linked_doc:
            data['linked_doc_purpose'] = acta.linked_doc.purpose
        return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_agon_users(request):
    """
    Proxy seguro: el frontend llama a este endpoint con su JWT,
    y este servidor llama a AGON internamente usando la API key secreta.
    """
    q = request.query_params.get('q', '').strip()
    if len(q) < 2:
        return Response([])

    agon_url = getattr(settings, 'AGON_API_URL', None)
    api_key = getattr(settings, 'ILINYX_API_KEY', None)

    if not agon_url or not api_key:
        return Response(
            {'detail': 'Configuración de AGON no encontrada en el servidor.',
             'agon_url_set': bool(agon_url), 'api_key_set': bool(api_key)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    target_url = f'{agon_url}/users/search/'

    try:
        resp = http_requests.get(
            target_url,
            params={'q': q},
            headers={'X-Ilinyx-Api-Key': api_key},
            timeout=10
        )
        # DEBUG: si AGON no retorna 200, mostrar el error
        if resp.status_code != 200:
            return Response({
                'debug_error': True,
                'agon_status': resp.status_code,
                'agon_response': resp.text[:500],
                'target_url': target_url,
                'q': q,
            })
        return Response(resp.json())
    except http_requests.exceptions.ConnectionError as e:
        return Response({'debug_error': True, 'type': 'ConnectionError', 'detail': str(e)[:500], 'target_url': target_url})
    except http_requests.exceptions.Timeout:
        return Response({'debug_error': True, 'type': 'Timeout', 'target_url': target_url})
    except Exception as e:
        return Response({'debug_error': True, 'type': type(e).__name__, 'detail': str(e)[:500], 'target_url': target_url})

