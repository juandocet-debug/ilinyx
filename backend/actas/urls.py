from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ActaViewSet, DocumentoViewSet

router = DefaultRouter()
router.register(r'registros', ActaViewSet, basename='actas')
router.register(r'documentos', DocumentoViewSet, basename='documentos')

urlpatterns = [
    path('', include(router.urls)),
]
