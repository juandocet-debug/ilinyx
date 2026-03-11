from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

from config.views import me_view


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/me/', me_view),
    path('api/actas/', include('actas.urls')),
    path('api/grupos/', include('grupos.urls')),
    path('api/evaluaciones/', include('evaluaciones.urls')),

    # Sirve el frontend React en cualquier otra ruta
    path('', TemplateView.as_view(template_name='index.html')),
    path('<path:path>', TemplateView.as_view(template_name='index.html')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
