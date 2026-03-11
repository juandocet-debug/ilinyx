from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EntornoViewSet, CorteViewSet, EntregableViewSet

router = DefaultRouter()
router.register(r'entornos',    EntornoViewSet,    basename='entornos')
router.register(r'cortes',      CorteViewSet,      basename='cortes')
router.register(r'entregables', EntregableViewSet, basename='entregables')

urlpatterns = [
    path('', include(router.urls)),
]
