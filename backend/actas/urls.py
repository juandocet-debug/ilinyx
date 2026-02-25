from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ActaViewSet, DocumentoViewSet, search_agon_users, fetch_agon_courses, acta_comments,
    reuniones_list, reuniones_detail, reuniones_mis, reuniones_firmar, reuniones_comentar,
    firma_usuario_view,
)

router = DefaultRouter()
router.register(r'registros', ActaViewSet, basename='actas')
router.register(r'documentos', DocumentoViewSet, basename='documentos')

urlpatterns = [
    path('usuarios/buscar/', search_agon_users, name='actas-search-agon'),
    path('clases-agon/', fetch_agon_courses, name='actas-fetch-courses'),
    path('comentarios/<int:acta_id>/', acta_comments, name='actas-comments'),

    # Firma personal
    path('firma-usuario/', firma_usuario_view, name='firma-usuario'),

    # Actas de Reunión — BD compartida
    path('reuniones/', reuniones_list, name='reuniones-list'),
    path('reuniones/mis/', reuniones_mis, name='reuniones-mis'),
    path('reuniones/<int:pk>/', reuniones_detail, name='reuniones-detail'),
    path('reuniones/<int:pk>/firmar/', reuniones_firmar, name='reuniones-firmar'),
    path('reuniones/<int:pk>/comentar/', reuniones_comentar, name='reuniones-comentar'),

    path('', include(router.urls)),
]
