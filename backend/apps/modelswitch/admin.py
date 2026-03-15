from django.contrib import admin

from apps.modelswitch.models import ActiveModel


@admin.register(ActiveModel)
class ActiveModelAdmin(admin.ModelAdmin):
    list_display = ('model_name', 'model_type', 'hardware_requirement', 'is_active')
    list_filter = ('model_type', 'is_active')
    search_fields = ('model_name', 'identifier')
