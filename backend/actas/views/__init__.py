"""
actas/views/__init__.py
Re-exporta todo para que urls.py y el resto del proyecto no cambien sus imports.
"""
from .registros import ActaViewSet, DocumentoViewSet
from .proxy     import search_agon_users, fetch_agon_courses
from .reuniones import (
    reuniones_list,
    reuniones_detail,
    reuniones_mis,
    reuniones_firmar,
    reuniones_comentar,
)
from .firma import firma_usuario_view

# Compatibilidad hacia atrás — comentarios de actas antiguas (legacy placeholder)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def acta_comments(request, acta_id):
    """
    Endpoint legacy de comentarios (placeholder).
    Los comentarios reales de ActaReunion se manejan en reuniones_comentar.
    """
    if request.method == 'POST':
        return Response({
            'success': True,
            'comment': {
                'user_id':   request.user.id,
                'user_name': f'{request.user.first_name} {request.user.last_name}'.strip() or request.user.username,
                'user_role': request.user.role,
                'text':       request.data.get('text', ''),
                'created_at': request.data.get('created_at', ''),
            }
        }, status=201)
    return Response([])


__all__ = [
    'ActaViewSet', 'DocumentoViewSet',
    'search_agon_users', 'fetch_agon_courses',
    'acta_comments',
    'reuniones_list', 'reuniones_detail', 'reuniones_mis',
    'reuniones_firmar', 'reuniones_comentar',
    'firma_usuario_view',
]
