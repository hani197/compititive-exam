from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudyMaterialViewSet

router = DefaultRouter()
router.register('', StudyMaterialViewSet, basename='material')

urlpatterns = [path('', include(router.urls))]
