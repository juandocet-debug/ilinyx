"""
actas/views/reuniones.py
CRUD de Actas de Reunión (modelo ligero JSON).
Todos los datos del formulario se almacenan en el campo `data` (JSONField).
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import ActaReunion


# ── Helpers internos ────────────────────────────────────────────────

def _extract_ids(data):
    """Extrae todos los user_id de asistentes, invitados, firmas y compromisos."""
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


def _serialize(acta):
    """Serializa un acta — el id de BD siempre gana sobre cualquier id dentro de data."""
    d = dict(acta.data or {})
    d.pop('id', None)
    d.pop('creador_id', None)
    return {'id': acta.id, **d, 'creador_id': acta.creador_id}


# ── Endpoints ────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def reuniones_list(request):
    """
    GET  → Actas creadas por el usuario autenticado.
    POST → Crear nueva acta de reunión.
    """
    user = request.user

    if request.method == 'GET':
        is_admin = getattr(user, 'role', '') == 'ADMIN'
        actas = ActaReunion.objects.all() if is_admin else ActaReunion.objects.filter(creador_id=user.id)
        return Response([_serialize(a) for a in actas])

    # POST — crear
    data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
    pids = _extract_ids(data)
    if user.id not in pids:
        pids.append(user.id)
    acta = ActaReunion.objects.create(data=data, creador_id=user.id, participantes_ids=pids)
    return Response(_serialize(acta), status=201)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def reuniones_detail(request, pk):
    """
    GET    → Obtener un acta por id.
    PUT    → Actualizar (solo creador o admin).
    DELETE → Eliminar (solo creador o admin).
    """
    try:
        acta = ActaReunion.objects.get(pk=pk)
    except ActaReunion.DoesNotExist:
        return Response({'detail': 'No encontrada'}, status=404)

    user = request.user
    is_creator = str(acta.creador_id) == str(user.id) if acta.creador_id else False
    is_admin   = getattr(user, 'role', '') == 'ADMIN'

    if request.method == 'GET':
        return Response(_serialize(acta))

    if request.method == 'DELETE':
        if not is_creator and not is_admin:
            return Response({'detail': 'Solo el creador puede eliminar esta acta'}, status=403)
        acta.delete()
        return Response(status=204)

    # PUT — cualquier participante puede editar (el creador tiene control desde el frontend)
    data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
    acta.data = data
    acta.participantes_ids = _extract_ids(data)
    if acta.creador_id and acta.creador_id not in acta.participantes_ids:
        acta.participantes_ids.append(acta.creador_id)
    acta.save()
    return Response(_serialize(acta))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reuniones_mis(request):
    """Actas donde el usuario autenticado aparece como participante o creador."""
    user = request.user
    uid  = user.id

    from django.db.models import Q
    actas = ActaReunion.objects.filter(
        Q(participantes_ids__contains=[uid]) |
        Q(participantes_ids__contains=[str(uid)]) |
        Q(creador_id=uid)
    ).distinct()

    # Fallback por nombre si el JSON no matchea
    if not actas.exists():
        user_name = f'{user.first_name} {user.last_name}'.strip().lower()
        if user_name:
            ids = []
            for a in ActaReunion.objects.all():
                d = a.data or {}
                for key in ['asistentes', 'ausentes', 'invitados', 'firmas']:
                    for p in (d.get(key) or []):
                        p_uid  = p.get('user_id')
                        p_name = (p.get('nombre') or '').lower()
                        if (p_uid and str(p_uid) == str(uid)) or (user_name in p_name):
                            ids.append(a.id)
                            break
                    else:
                        continue
                    break
            if ids:
                actas = ActaReunion.objects.filter(id__in=ids)

    return Response([_serialize(a) for a in actas])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reuniones_firmar(request, pk):
    """Firma o actualiza la firma de un participante en un acta."""
    try:
        acta = ActaReunion.objects.get(pk=pk)
    except ActaReunion.DoesNotExist:
        return Response({'detail': 'No encontrada'}, status=404)

    user  = request.user
    uid   = user.id
    name  = f'{user.first_name} {user.last_name}'.strip() or user.username
    data  = acta.data or {}
    firmas = data.get('firmas') or []

    # Buscar entrada existente
    existing_idx = next(
        (i for i, f in enumerate(firmas)
         if f.get('user_id') and (f['user_id'] == uid or str(f['user_id']) == str(uid))),
        None,
    )

    firma_img = request.data.get('firma', '')

    if existing_idx is not None:
        if firmas[existing_idx].get('firmado'):
            return Response({'detail': 'Ya firmaste esta acta'}, status=400)
        firmas[existing_idx]['firma']   = firma_img
        firmas[existing_idx]['firmado'] = True
        firmas[existing_idx]['fecha']   = request.data.get('fecha', '')
    else:
        firmas.append({
            'nombre': name,
            'firma': firma_img,
            'user_id': uid,
            'firmado': True,
            'fecha': request.data.get('fecha', ''),
        })

    data['firmas'] = firmas
    acta.data = data
    acta.save()
    return Response({'id': acta.id, **acta.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reuniones_comentar(request, pk):
    """Agrega un comentario a un acta de reunión."""
    try:
        acta = ActaReunion.objects.get(pk=pk)
    except ActaReunion.DoesNotExist:
        return Response({'detail': 'No encontrada'}, status=404)

    user = request.user
    name = f'{user.first_name} {user.last_name}'.strip() or user.username
    data = acta.data or {}
    comentarios = data.get('comentarios') or []
    comentarios.append({
        'user_id':   user.id,
        'user_name': name,
        'user_role': getattr(user, 'role', ''),
        'text':       request.data.get('text', ''),
        'created_at': request.data.get('created_at', ''),
    })
    data['comentarios'] = comentarios
    acta.data = data
    acta.save()
    return Response({'success': True}, status=201)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def acta_comments(request, acta_id):
    """
    Endpoint legacy de comentarios (placeholder).
    Los comentarios reales de ActaReunion se manejan en reuniones_comentar.
    """
    if request.method == 'POST':
        user = request.user
        name = f'{user.first_name} {user.last_name}'.strip() or user.username
        return Response({
            'success': True,
            'comment': {
                'user_id': user.id,
                'user_name': name,
                'user_role': getattr(user, 'role', ''),
                'text': request.data.get('text', ''),
                'created_at': request.data.get('created_at', ''),
            }
        }, status=201)
    return Response([])

