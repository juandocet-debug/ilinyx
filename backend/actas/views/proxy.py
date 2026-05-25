"""
actas/views/proxy.py
Endpoints proxy que llaman a AGON server-to-server con API key.
El frontend nunca llama a AGON directamente — siempre a través de aquí.
"""
import logging
import requests as http_requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

logger = logging.getLogger(__name__)


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
        return Response({'detail': 'Servicio de búsqueda no disponible.'}, status=503)

    target_url = f'{agon_url}/users/search/'
    try:
        resp = http_requests.get(
            target_url,
            params={'q': q},
            headers={'X-Ilinyx-Api-Key': api_key},
            timeout=10,
        )
        if resp.status_code != 200:
            logger.warning('AGON search status=%d url=%s', resp.status_code, target_url)
            return Response({'detail': 'No se pudo consultar el directorio.'}, status=502)
        return Response(resp.json())
    except http_requests.exceptions.ConnectionError:
        logger.error('Connection error to AGON: %s', target_url)
        return Response({'detail': 'No se pudo conectar al directorio.'}, status=502)
    except http_requests.exceptions.Timeout:
        logger.error('Timeout connecting to AGON: %s', target_url)
        return Response({'detail': 'Tiempo de espera agotado.'}, status=504)
    except Exception as e:
        logger.exception('Unexpected error in search_agon_users')
        return Response({'detail': 'Error interno.'}, status=500)


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
        return Response({'detail': 'Servicio no disponible.'}, status=503)

    target_url = f'{agon_url}/users/courses-for-ilinyx/'
    try:
        resp = http_requests.get(
            target_url,
            headers={'X-Ilinyx-Api-Key': api_key},
            timeout=15,
        )
        if resp.status_code != 200:
            logger.warning('AGON courses status=%d', resp.status_code)
            return Response({'detail': 'No se pudo consultar las clases.', 'agon_status': resp.status_code, 'agon_body': resp.text[:300]}, status=502)

        all_courses = resp.json()
        teacher_id = getattr(request.user, 'id', None)
        # DEBUG: devolver todos sin filtrar para diagnosticar
        return Response({
            '__debug': True,
            'teacher_id_en_ilinyx': teacher_id,
            'teacher_ids_en_agon': list({str(c.get('teacher_id')) for c in all_courses}),
            'total_cursos': len(all_courses),
            'cursos': all_courses,
        })
    except http_requests.exceptions.ConnectionError:
        logger.error('Connection error to AGON courses')
        return Response({'detail': 'No se pudo conectar al directorio.'}, status=502)
    except http_requests.exceptions.Timeout:
        return Response({'detail': 'Tiempo de espera agotado.'}, status=504)
    except Exception:
        logger.exception('Unexpected error in fetch_agon_courses')
        return Response({'detail': 'Error interno.'}, status=500)
