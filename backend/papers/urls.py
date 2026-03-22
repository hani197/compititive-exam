from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaperViewSet, AssignedPaperViewSet, PreviousYearPaperViewSet

router = DefaultRouter()
router.register('assignments', AssignedPaperViewSet, basename='assignment')
router.register('old-papers', PreviousYearPaperViewSet, basename='old-paper')
router.register('', PaperViewSet, basename='paper')

urlpatterns = [path('', include(router.urls))]
