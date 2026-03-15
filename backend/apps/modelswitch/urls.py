from django.urls import path

from apps.modelswitch.views import CurrentModelView, SwitchModelView

urlpatterns = [
    path('current', CurrentModelView.as_view(), name='model-current'),
    path('switch', SwitchModelView.as_view(), name='model-switch'),
]
