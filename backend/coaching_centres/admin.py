from django.contrib import admin
from .models import CoachingCentre, CoachingCentreStaff


@admin.register(CoachingCentre)
class CoachingCentreAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'city', 'contact_person', 'status', 'created_at']
    list_filter = ['status', 'city', 'state', 'created_at']
    search_fields = ['name', 'code', 'email', 'phone', 'contact_person']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'status')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone', 'contact_person', 'contact_person_phone')
        }),
        ('Address', {
            'fields': ('address', 'city', 'state', 'pincode')
        }),
        ('Management', {
            'fields': ('director',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(CoachingCentreStaff)
class CoachingCentreStaffAdmin(admin.ModelAdmin):
    list_display = ['user', 'coaching_centre', 'role', 'joined_at']
    list_filter = ['coaching_centre', 'role', 'joined_at']
    search_fields = ['user__username', 'coaching_centre__name']
