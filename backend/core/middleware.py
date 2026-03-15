import uuid

from django.http import JsonResponse

PUBLIC_PREFIXES = (
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/refresh',
    '/api/auth/password-reset',
    '/api/schema/',
    '/api/docs/',
    '/api/redoc/',
    '/admin/',
    '/media/',
)


class ProtectedAPIMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == 'OPTIONS':
            return self.get_response(request)

        if request.path.startswith('/api/') and not request.path.startswith(PUBLIC_PREFIXES):
            auth_header = request.headers.get('Authorization', '')
            if not auth_header.startswith('Bearer '):
                return JsonResponse(
                    {
                        'success': False,
                        'errors': {'detail': 'Authentication credentials were not provided.'},
                        'status_code': 401,
                    },
                    status=401,
                )
        return self.get_response(request)


class RequestIDMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.request_id = request.headers.get('X-Request-ID', str(uuid.uuid4()))
        response = self.get_response(request)
        response['X-Request-ID'] = request.request_id
        return response
