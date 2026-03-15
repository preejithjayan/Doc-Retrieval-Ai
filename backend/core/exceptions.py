from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler



def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        response.data = {
            'success': False,
            'errors': response.data,
            'status_code': response.status_code,
        }
        return response

    return Response(
        {
            'success': False,
            'errors': {'detail': 'An unexpected error occurred.'},
            'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
