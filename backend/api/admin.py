from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Skill, StudentProfile, EmployerProfile, Project, VerifiedWorkRecord, Opportunity, Application

# Extend UserAdmin to handle roles
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['email', 'username', 'role', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'email')}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(Skill)
admin.site.register(StudentProfile)
admin.site.register(EmployerProfile)
admin.site.register(Project)
admin.site.register(VerifiedWorkRecord)
admin.site.register(Opportunity)
admin.site.register(Application)
