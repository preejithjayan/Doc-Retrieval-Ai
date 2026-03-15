from rest_framework.response import Response
from rest_framework.views import APIView

from apps.modelswitch.serializers import ActiveModelSerializer, SwitchModelSerializer
from core.permissions import IsAdmin, IsViewerOrAbove
from services.model_router import ModelRouterService


class CurrentModelView(APIView):
    permission_classes = [IsViewerOrAbove]

    def get(self, request):
        service = ModelRouterService()
        current = service.get_current_model()
        return Response(
            {
                'success': True,
                'current': ActiveModelSerializer(current).data if current else None,
                'catalog': ActiveModelSerializer(service.get_catalog(), many=True).data,
            }
        )


class SwitchModelView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = SwitchModelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        model = ModelRouterService().switch_model(serializer.validated_data['model_name'])
        return Response({'success': True, 'current': ActiveModelSerializer(model).data})
