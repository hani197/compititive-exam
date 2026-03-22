from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'coaching_centre', 'is_active']
    list_filter = ['role', 'coaching_centre', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Info', {'fields': ('role', 'phone', 'date_of_birth', 'profile_picture', 'coaching_centre')}),
    )
