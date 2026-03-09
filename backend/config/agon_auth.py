"""
Autenticación custom para ILINYX.
Valida el JWT del usuario contra el backend de AGON y construye
un objeto de usuario temporal con los datos del token.
"""
import requests as http_requests
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import AnonymousUser


class AgonUser:
    """
    Objeto que imita un User de Django pero con datos de AGON.
    No toca la base de datos de ILINYX.
    """
    def __init__(self, data):
        self.id = data.get('id')
        self.pk = self.id
        self.username = data.get('username', '')
        self.email = data.get('email', '')
        self.first_name = data.get('first_name', '')
        self.last_name = data.get('last_name', '')
        self.role = data.get('role', '')
        self.is_authenticated = True
        self.is_active = True
        self.is_anonymous = False
        self.is_staff = data.get('is_staff', False)

    def __str__(self):
        return f'{self.first_name} {self.last_name} ({self.username})'


class AgonJWTAuthentication(BaseAuthentication):
    """
    Recibe el header Authorization: Bearer <token_agon>
    y lo valida llamando a AGON /api/users/me/.
    Si AGON responde 200, el usuario está autenticado.
    """

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None  # No hay token → dejar pasar a otro authenticator

        token = auth_header.split(' ', 1)[1]
        agon_url = getattr(settings, 'AGON_API_URL', 'http://localhost:8000/api')

        try:
            resp = http_requests.get(
                f'{agon_url}/users/me/',
                headers={'Authorization': f'Bearer {token}'},
                timeout=5,  # Máximo 5s — no bloquear la app si AGON es lento
            )
        except http_requests.RequestException as e:
            raise AuthenticationFailed(f'AGON no disponible: {type(e).__name__}')

        if resp.status_code != 200:
            raise AuthenticationFailed('Token inválido o expirado en AGON.')

        user_data = resp.json()
        return (AgonUser(user_data), token)
