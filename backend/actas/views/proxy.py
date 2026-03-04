"""
actas/views/proxy.py
Endpoints proxy que llaman a AGON server-to-server con API key.
El frontend nunca llama a AGON directamente — siempre a través de aquí.
"""
import requests as http_requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_agon_users(request):
    """
    Proxy seguro: busca usuarios en AGON con la API key del servidor.
    Query param: ?q=<texto> (mínimo 2 caracteres)
    """
    q = request.query_params.get('q', '').strip()
    if len(q) < 2:
        return Response([])

    agon_url = getattr(settings, 'AGON_API_URL', None)
    api_key  = getattr(settings, 'ILINYX_API_KEY', None)

    if not agon_url or not api_key:
        return Response(
            {'detail': 'Configuración de AGON no encontrada en el servidor.',
             'agon_url_set': bool(agon_url), 'api_key_set': bool(api_key)},
            status=503,
        )

    target_url = f'{agon_url}/users/search/'
    try:
        resp = http_requests.get(
            target_url,
            params={'q': q},
            headers={'X-Ilinyx-Api-Key': api_key},
            timeout=10,
        )
        if resp.status_code != 200:
            return Response({
                'debug_error': True,
                'agon_status': resp.status_code,
                'agon_response': resp.text[:500],
                'target_url': target_url,
            })
        return Response(resp.json())
    except http_requests.exceptions.ConnectionError as e:
        return Response({'debug_error': True, 'type': 'ConnectionError', 'detail': str(e)[:500]})
    except http_requests.exceptions.Timeout:
        return Response({'debug_error': True, 'type': 'Timeout', 'target_url': target_url})
    except Exception as e:
        return Response({'debug_error': True, 'type': type(e).__name__, 'detail': str(e)[:500]})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_agon_courses(request):
    """
    Proxy seguro: obtiene la lista de clases de AGON con sus estudiantes.
    Permite a ILINYX importar una clase completa como asistentes de un acta.
    """
    agon_url = getattr(settings, 'AGON_API_URL', None)
    api_key  = getattr(settings, 'ILINYX_API_KEY', None)

    if not agon_url or not api_key:
        return Response({'detail': 'Configuración de AGON no encontrada.'}, status=503)

    target_url = f'{agon_url}/users/courses-for-ilinyx/'
    try:
        resp = http_requests.get(
            target_url,
            headers={'X-Ilinyx-Api-Key': api_key},
            timeout=15,
        )
        if resp.status_code != 200:
            return Response({
                'debug_error': True,
                'agon_status': resp.status_code,
                'agon_response': resp.text[:500],
            })
        return Response(resp.json())
    except http_requests.exceptions.ConnectionError as e:
        return Response({'detail': f'No se pudo conectar a AGON: {str(e)[:200]}'}, status=502)
    except http_requests.exceptions.Timeout:
        return Response({'detail': 'Timeout al conectar con AGON'}, status=504)
    except Exception as e:
        return Response({'detail': str(e)[:300]}, status=500)
