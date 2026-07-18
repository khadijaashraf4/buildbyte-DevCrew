from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, ProfileView, SkillViewSet, ProjectViewSet, 
    VerifiedWorkRecordViewSet, OpportunityViewSet, ApplicationViewSet
)

router = DefaultRouter()
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'work-records', VerifiedWorkRecordViewSet, basename='work-record')
router.register(r'opportunities', OpportunityViewSet, basename='opportunity')
router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = [
    # Router endpoints
    path('', include(router.urls)),

    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', ProfileView.as_view(), name='auth_profile'),
]
