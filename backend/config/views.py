"""
config/views.py
Vistas utilitarias del proyecto — /api/auth/me/ y similares.
Separado de agon_auth.py para evitar importaciones circulares con DRF settings.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """Devuelve los datos del usuario autenticado desde el JWT (sin re-llamar a AGON)."""
    u = request.user
    return Response({
        'id':         getattr(u, 'id', None),
        'pk':         getattr(u, 'pk', None),
        'username':   getattr(u, 'username', ''),
        'email':      getattr(u, 'email', ''),
        'first_name': getattr(u, 'first_name', ''),
        'last_name':  getattr(u, 'last_name', ''),
        'role':       getattr(u, 'role', ''),
        'is_staff':   getattr(u, 'is_staff', False),
    })
