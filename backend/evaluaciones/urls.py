from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RubricaViewSet, EvaluacionGrupoViewSet, CalificacionViewSet

router = DefaultRouter()
router.register(r'rubricas', RubricaViewSet, basename='rubricas')
router.register(r'grupos', EvaluacionGrupoViewSet, basename='evaluaciones-grupos')
router.register(r'calificaciones', CalificacionViewSet, basename='calificaciones')

urlpatterns = [
    path('', include(router.urls)),
]
