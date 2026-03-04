"""
actas/views/firma.py
Gestión de la firma personal de cada usuario (base64 almacenada en BD).
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import FirmaUsuario


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def firma_usuario_view(request):
    """
    GET  → Obtener la firma personal del usuario autenticado.
    POST → Guardar o actualizar la firma personal.
    """
    user = request.user

    if request.method == 'GET':
        try:
            fu = FirmaUsuario.objects.get(user_id=user.id)
            return Response({'firma_data': fu.firma_data, 'updated_at': fu.updated_at})
        except FirmaUsuario.DoesNotExist:
            return Response({'firma_data': None})

    # POST — guardar / actualizar
    firma_data = request.data.get('firma_data', '')
    if not firma_data:
        return Response({'detail': 'firma_data es requerido'}, status=400)

    fu, created = FirmaUsuario.objects.update_or_create(
        user_id=user.id,
        defaults={'firma_data': firma_data},
    )
    return Response(
        {'firma_data': fu.firma_data, 'updated_at': fu.updated_at},
        status=201 if created else 200,
    )
