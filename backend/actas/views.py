from rest_framework import viewsets, status, serializers
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Acta, Documento, ActaReunion
from .serializers import ActaSerializer, DocumentoSerializer
import requests as http_requests
from django.conf import settings


# ════════════════════════════════════════════════════════════════
# SERIALIZERS inline para ActaReunion
# ════════════════════════════════════════════════════════════════
class ActaReunionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActaReunion
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'participantes_ids']


# ════════════════════════════════════════════════════════════════
# DOCUMENTO / ACTA (legacy)
# ════════════════════════════════════════════════════════════════
class DocumentoViewSet(viewsets.ModelViewSet):
    queryset = Documento.objects.all().order_by('-date')
    serializer_class = DocumentoSerializer
    permission_classes = [IsAuthenticated]


class ActaViewSet(viewsets.ModelViewSet):
    queryset = Acta.objects.select_related('linked_doc', 'group').all()
    serializer_class = ActaSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        acta = self.get_object()
        serializer = self.get_serializer(acta)
        data = serializer.data
        if acta.linked_doc:
            data['linked_doc_purpose'] = acta.linked_doc.purpose
        return Response(data)


# ════════════════════════════════════════════════════════════════
# ACTA DE REUNIÓN — CRUD completo + endpoint "mis actas"
# ════════════════════════════════════════════════════════════════
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def actas_reunion_list(request):
    """
    GET  → Lista todas las actas creadas por el usuario actual.
    POST → Crea una nueva acta de reunión.
    """
    user = request.user

    if request.method == 'GET':
        actas = ActaReunion.objects.filter(creador_id=user.id)
        serializer = ActaReunionSerializer(actas, many=True)
        return Response(serializer.data)

    # POST
    data = request.data.copy()
    data['creador_id'] = user.id
    data['creador_name'] = f'{user.first_name} {user.last_name}'.strip() or user.username
    serializer = ActaReunionSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    acta = serializer.save()
    acta.actualizar_participantes()
    acta.save(update_fields=['participantes_ids'])
    return Response(ActaReunionSerializer(acta).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def actas_reunion_detail(request, pk):
    """
    GET    → Detalle de un acta.
    PUT    → Actualizar acta (solo el creador o admin).
    DELETE → Eliminar acta (solo el creador o admin).
    """
    try:
        acta = ActaReunion.objects.get(pk=pk)
    except ActaReunion.DoesNotExist:
        return Response({'detail': 'Acta no encontrada'}, status=404)

    user = request.user

    if request.method == 'GET':
        return Response(ActaReunionSerializer(acta).data)

    # PUT / DELETE — solo el creador o admin
    if request.method == 'DELETE':
        if acta.creador_id != user.id and getattr(user, 'role', '') != 'ADMIN':
            return Response({'detail': 'Solo el creador o admin puede eliminar esta acta'}, status=403)
        acta.delete()
        return Response(status=204)

    if request.method == 'PUT':
        serializer = ActaReunionSerializer(acta, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        acta = serializer.save()
        acta.actualizar_participantes()
        acta.save(update_fields=['participantes_ids'])
        return Response(ActaReunionSerializer(acta).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mis_actas_reunion(request):
    """
    Devuelve actas donde el usuario actual aparece como participante
    (asistente, invitado, firmante, responsable de compromiso).
    """
    user = request.user
    # Buscar actas donde participantes_ids contiene el user.id
    actas = ActaReunion.objects.filter(participantes_ids__contains=[user.id])
    serializer = ActaReunionSerializer(actas, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def firmar_acta_reunion(request, pk):
    """
    Permite a un usuario participante firmar un acta.
    Solo puede firmar si está en participantes_ids y no ha firmado ya.
    """
    try:
        acta = ActaReunion.objects.get(pk=pk)
    except ActaReunion.DoesNotExist:
        return Response({'detail': 'Acta no encontrada'}, status=404)

    user = request.user
    user_id = user.id
    name = f'{user.first_name} {user.last_name}'.strip() or user.username

    # Verificar que es participante
    if user_id not in (acta.participantes_ids or []):
        return Response({'detail': 'No eres participante de esta acta'}, status=403)

    # Verificar que no ha firmado ya
    firmas = acta.firmas or []
    if any(f.get('user_id') == user_id for f in firmas):
        return Response({'detail': 'Ya firmaste esta acta'}, status=400)

    # Agregar firma
    firma_data = request.data.get('firma', name)
    firmas.append({
        'nombre': name,
        'firma': firma_data,
        'user_id': user_id,
        'fecha': request.data.get('fecha', ''),
    })
    acta.firmas = firmas
    acta.save(update_fields=['firmas'])

    return Response(ActaReunionSerializer(acta).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def comentar_acta_reunion(request, pk):
    """
    Permite a un participante agregar un comentario al acta.
    """
    try:
        acta = ActaReunion.objects.get(pk=pk)
    except ActaReunion.DoesNotExist:
        return Response({'detail': 'Acta no encontrada'}, status=404)

    user = request.user
    name = f'{user.first_name} {user.last_name}'.strip() or user.username

    comentarios = acta.comentarios or []
    comentarios.append({
        'id': int(request.data.get('id', 0)) or len(comentarios) + 1,
        'user_id': user.id,
        'user_name': name,
        'user_role': getattr(user, 'role', ''),
        'user_foto': getattr(user, 'photo', '') or '',
        'text': request.data.get('text', ''),
        'created_at': request.data.get('created_at', ''),
    })
    acta.comentarios = comentarios
    acta.save(update_fields=['comentarios'])

    return Response({'success': True, 'comment': comentarios[-1]}, status=201)


# ════════════════════════════════════════════════════════════════
# PROXY AGON — búsqueda de usuarios y clases
# ════════════════════════════════════════════════════════════════
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
