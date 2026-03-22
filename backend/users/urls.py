from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (RegisterView, ProfileView, StudentListView, StudentDetailView,
                    RegistrationRequestCreateView, RegistrationRequestListView,
                    approve_request, reject_request, StudentInstructorAssignmentViewSet)

router = DefaultRouter()
router.register(r'assignments', StudentInstructorAssignmentViewSet, basename='assignments')

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    # Public
    path('request-access/', RegistrationRequestCreateView.as_view(), name='request-access'),
    # Admin only
    path('requests/', RegistrationRequestListView.as_view(), name='request-list'),
    path('requests/<int:pk>/approve/', approve_request, name='approve-request'),
    path('requests/<int:pk>/reject/', reject_request, name='reject-request'),
    path('students/register/', RegisterView.as_view(), name='register'),
    path('students/', StudentListView.as_view(), name='student-list'),
    path('students/<int:pk>/', StudentDetailView.as_view(), name='student-detail'),
    
    # Assignments
    path('', include(router.urls)),
]
