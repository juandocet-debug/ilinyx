from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ActaViewSet, DocumentoViewSet, search_agon_users

router = DefaultRouter()
router.register(r'registros', ActaViewSet, basename='actas')
router.register(r'documentos', DocumentoViewSet, basename='documentos')

urlpatterns = [
    path('usuarios/buscar/', search_agon_users, name='actas-search-agon'),
    path('', include(router.urls)),
]
