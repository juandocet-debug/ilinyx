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
    acta_comments,
)
from .firma import firma_usuario_view


__all__ = [
    'ActaViewSet', 'DocumentoViewSet',
    'search_agon_users', 'fetch_agon_courses',
    'acta_comments',
    'reuniones_list', 'reuniones_detail', 'reuniones_mis',
    'reuniones_firmar', 'reuniones_comentar',
    'firma_usuario_view',
]
