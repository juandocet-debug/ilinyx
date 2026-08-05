import os


def _allowed_origin(request):
    origins = [
        origin.strip()
        for origin in os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')
        if origin.strip()
    ]
    request_origin = request.headers.get('Origin')
    if request_origin and request_origin in origins:
        return request_origin
    if os.environ.get('DEBUG', 'True') == 'True':
        return '*'
    return None


class ForceCORSMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        origin = _allowed_origin(request)
        # Handle preflight OPTIONS requests
        if request.method == 'OPTIONS':
            from django.http import HttpResponse
            response = HttpResponse()
            if origin:
                response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with'
            response['Access-Control-Max-Age'] = '86400'
            return response

        response = self.get_response(request)
        if origin:
            response['Access-Control-Allow-Origin'] = origin
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with'
        return response
