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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_agon_courses(request):
    """
    Proxy seguro: obtiene la lista de clases de AGON con sus estudiantes.
    Permite a ILINYX importar una clase completa como asistentes de un acta.
    """
    agon_url = getattr(settings, 'AGON_API_URL', None)
    api_key = getattr(settings, 'ILINYX_API_KEY', None)

    if not agon_url or not api_key:
        return Response(
            {'detail': 'Configuración de AGON no encontrada en el servidor.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    target_url = f'{agon_url}/users/courses-for-ilinyx/'

    try:
        resp = http_requests.get(
            target_url,
            headers={'X-Ilinyx-Api-Key': api_key},
            timeout=15
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


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def acta_comments(request, acta_id):
    """
    GET  → Lista comentarios de un acta.
    POST → Agrega un nuevo comentario (cualquier rol puede comentar).
    Los comentarios se almacenan como JSON en el campo 'comentarios' del acta localStorage.
    NOTA: Como las actas actuales se guardan en localStorage del frontend,
    este endpoint se integra a nivel frontend. Se expone por compatibilidad futura
    cuando se migre a BD real.
    """
    # Placeholder para cuando se migre a BD real
    if request.method == 'POST':
        # Por ahora solo valida que el usuario esté autenticado
        return Response({
            'success': True,
            'comment': {
                'user_id': request.user.id,
                'user_name': f'{request.user.first_name} {request.user.last_name}'.strip() or request.user.username,
                'user_role': request.user.role,
                'text': request.data.get('text', ''),
                'created_at': request.data.get('created_at', ''),
            }
        }, status=status.HTTP_201_CREATED)

    return Response([])


# ════════════════════════════════════════════════════════════════
# ACTAS DE REUNIÓN — BD compartida (modelo ligero)
# ════════════════════════════════════════════════════════════════
from .models import ActaReunion


def _extract_ids(data):
    """Extrae todos los user_id de asistentes, invitados, firmas, compromisos."""
    ids = set()
    for key in ['asistentes', 'ausentes', 'invitados', 'firmas']:
        for p in (data.get(key) or []):
            uid = p.get('user_id')
            if uid:
                try:
                    ids.add(int(uid))
                except (ValueError, TypeError):
                    pass
    for c in (data.get('compromisos') or []):
        uid = c.get('responsable_id')
        if uid:
            try:
                ids.add(int(uid))
            except (ValueError, TypeError):
                pass
    return list(ids)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def reuniones_list(request):
    user = request.user
    if request.method == 'GET':
        actas = ActaReunion.objects.filter(creador_id=user.id)
        return Response([{'id': a.id, **a.data, 'creador_id': a.creador_id} for a in actas])

    # POST — crear
    data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
    creador_id = user.id
    pids = _extract_ids(data)
    if creador_id not in pids:
        pids.append(creador_id)
    acta = ActaReunion.objects.create(data=data, creador_id=creador_id, participantes_ids=pids)
    return Response({'id': acta.id, **acta.data, 'creador_id': acta.creador_id}, status=201)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def reuniones_detail(request, pk):
    try:
        acta = ActaReunion.objects.get(pk=pk)
    except ActaReunion.DoesNotExist:
        return Response({'detail': 'No encontrada'}, status=404)

    user = request.user

    if request.method == 'GET':
        return Response({'id': acta.id, **acta.data, 'creador_id': acta.creador_id})

    if request.method == 'DELETE':
        if acta.creador_id != user.id:
            return Response({'detail': 'Solo el creador puede eliminar'}, status=403)
        acta.delete()
        return Response(status=204)

    # PUT
    data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
    acta.data = data
    acta.participantes_ids = _extract_ids(data)
    if acta.creador_id and acta.creador_id not in acta.participantes_ids:
        acta.participantes_ids.append(acta.creador_id)
    acta.save()
    return Response({'id': acta.id, **acta.data, 'creador_id': acta.creador_id})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reuniones_mis(request):
    """Actas donde yo aparezco como participante."""
    user = request.user
    uid = user.id
    user_name = f'{user.first_name} {user.last_name}'.strip().lower()

    from django.db.models import Q
    actas = ActaReunion.objects.filter(
        Q(participantes_ids__contains=[uid]) |
        Q(participantes_ids__contains=[str(uid)]) |
        Q(creador_id=uid)
    ).distinct()

    # Fallback: búsqueda por nombre si JSON no matchea
    if not actas.exists() and user_name:
        all_actas = ActaReunion.objects.all()
        ids = []
        for a in all_actas:
            d = a.data or {}
            for key in ['asistentes', 'ausentes', 'invitados', 'firmas']:
                for p in (d.get(key) or []):
                    p_uid = p.get('user_id')
                    p_name = (p.get('nombre') or '').lower()
                    if (p_uid and str(p_uid) == str(uid)) or (user_name and user_name in p_name):
                        ids.append(a.id)
                        break
                else:
                    continue
                break
        if ids:
            actas = ActaReunion.objects.filter(id__in=ids)

    return Response([{'id': a.id, **a.data, 'creador_id': a.creador_id} for a in actas])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reuniones_firmar(request, pk):
    try:
        acta = ActaReunion.objects.get(pk=pk)
    except ActaReunion.DoesNotExist:
        return Response({'detail': 'No encontrada'}, status=404)

    user = request.user
    name = f'{user.first_name} {user.last_name}'.strip() or user.username
    data = acta.data or {}
    firmas = data.get('firmas') or []

    if any(f.get('user_id') == user.id for f in firmas):
        return Response({'detail': 'Ya firmaste'}, status=400)

    firmas.append({
        'nombre': name,
        'firma': request.data.get('firma', name),
        'user_id': user.id,
        'fecha': request.data.get('fecha', ''),
    })
    data['firmas'] = firmas
    acta.data = data
    acta.save()
    return Response({'id': acta.id, **acta.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reuniones_comentar(request, pk):
    try:
        acta = ActaReunion.objects.get(pk=pk)
    except ActaReunion.DoesNotExist:
        return Response({'detail': 'No encontrada'}, status=404)

    user = request.user
    name = f'{user.first_name} {user.last_name}'.strip() or user.username
    data = acta.data or {}
    comentarios = data.get('comentarios') or []
    comentarios.append({
        'user_id': user.id, 'user_name': name,
        'user_role': getattr(user, 'role', ''),
        'text': request.data.get('text', ''),
        'created_at': request.data.get('created_at', ''),
    })
    data['comentarios'] = comentarios
    acta.data = data
    acta.save()
    return Response({'success': True}, status=201)
