from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExamSessionViewSet

router = DefaultRouter()
router.register('', ExamSessionViewSet, basename='session')

urlpatterns = [path('', include(router.urls))]
