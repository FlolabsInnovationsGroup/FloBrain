from django.urls import path
from .views import MemoryGraphView, MemoryNodeDetailView  

urlpatterns = [
    path('graph/', MemoryGraphView.as_view(), name='memory-graph'),      
    path('nodes/<str:pk>/', MemoryNodeDetailView.as_view(), name='memory-node-detail'),  
]
