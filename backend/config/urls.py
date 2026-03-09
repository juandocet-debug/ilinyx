from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.http import JsonResponse
import traceback

# === DEBUG TEMPORAL - ELIMINAR DESPUÉS ===
def debug_test(request):
    """Endpoint temporal para diagnosticar errores 500."""
    results = {}
    # Test 1: Database
    try:
        from grupos.models import Grupo
        results['grupos_count'] = Grupo.objects.count()
        results['db_ok'] = True
    except Exception as e:
        results['db_error'] = f'{type(e).__name__}: {e}'
        results['db_traceback'] = traceback.format_exc()

    # Test 2: Actas
    try:
        from actas.models import Acta, Documento
        results['actas_count'] = Acta.objects.count()
        results['documentos_count'] = Documento.objects.count()
        results['actas_ok'] = True
    except Exception as e:
        results['actas_error'] = f'{type(e).__name__}: {e}'
        results['actas_traceback'] = traceback.format_exc()

    # Test 3: Auth check
    results['auth_header'] = request.headers.get('Authorization', 'NONE')[:20] + '...'
    results['agon_url'] = getattr(settings, 'AGON_API_URL', 'NOT SET')
    results['ilinyx_key_set'] = bool(getattr(settings, 'ILINYX_API_KEY', ''))
    results['database_engine'] = settings.DATABASES['default']['ENGINE']
    results['database_host'] = settings.DATABASES['default'].get('HOST', 'default')
    results['database_name'] = settings.DATABASES['default'].get('NAME', 'default')
    try:
        from actas.models import ActaReunion
        results['reuniones_count'] = ActaReunion.objects.count()
    except Exception as e:
        results['reuniones_error'] = str(e)

    return JsonResponse(results)
# === FIN DEBUG ===

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/debug/test/', debug_test),  # TEMPORAL
    path('api/actas/', include('actas.urls')),
    path('api/grupos/', include('grupos.urls')),
    path('api/evaluaciones/', include('evaluaciones.urls')),

    # Sirve el frontend React en cualquier otra ruta
    path('', TemplateView.as_view(template_name='index.html')),
    path('<path:path>', TemplateView.as_view(template_name='index.html')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
