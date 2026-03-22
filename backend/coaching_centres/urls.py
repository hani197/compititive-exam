from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CoachingCentreViewSet, CoachingCentreStaffViewSet

router = DefaultRouter()
router.register(r'centres', CoachingCentreViewSet)
router.register(r'staff', CoachingCentreStaffViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
