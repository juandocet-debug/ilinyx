from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ActaViewSet, DocumentoViewSet,
    search_agon_users, fetch_agon_courses,
    actas_reunion_list, actas_reunion_detail,
    mis_actas_reunion, firmar_acta_reunion, comentar_acta_reunion,
    debug_actas,
)

router = DefaultRouter()
router.register(r'registros', ActaViewSet, basename='actas')
router.register(r'documentos', DocumentoViewSet, basename='documentos')

urlpatterns = [
    # Proxy AGON
    path('usuarios/buscar/', search_agon_users, name='actas-search-agon'),
    path('clases-agon/', fetch_agon_courses, name='actas-fetch-courses'),

    # Actas de Reunión — CRUD
    path('reuniones/', actas_reunion_list, name='reuniones-list'),
    path('reuniones/mis/', mis_actas_reunion, name='reuniones-mis'),
    path('reuniones/debug/', debug_actas, name='reuniones-debug'),
    path('reuniones/<int:pk>/', actas_reunion_detail, name='reuniones-detail'),
    path('reuniones/<int:pk>/firmar/', firmar_acta_reunion, name='reuniones-firmar'),
    path('reuniones/<int:pk>/comentar/', comentar_acta_reunion, name='reuniones-comentar'),

    # Legacy routers
    path('', include(router.urls)),
]
