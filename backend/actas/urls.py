from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ActaViewSet, DocumentoViewSet, search_agon_users, fetch_agon_courses, acta_comments

router = DefaultRouter()
router.register(r'registros', ActaViewSet, basename='actas')
router.register(r'documentos', DocumentoViewSet, basename='documentos')

urlpatterns = [
    path('usuarios/buscar/', search_agon_users, name='actas-search-agon'),
    path('clases-agon/', fetch_agon_courses, name='actas-fetch-courses'),
    path('comentarios/<int:acta_id>/', acta_comments, name='actas-comments'),
    path('', include(router.urls)),
]

