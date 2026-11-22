from django.urls import path
from .views import (
    CalendarEventDetailView,
    CalendarEventListCreateView,
    TodoDetailView,
    TodoListCreateView,
)

urlpatterns = [
    path("events/", CalendarEventListCreateView.as_view(), name="calendar-event-list-create"),
    path("events/<int:event_id>/", CalendarEventDetailView.as_view(), name="calendar-event-detail"),
    path("todos/", TodoListCreateView.as_view(), name="todo-list-create"),
    path("todos/<int:todo_id>/", TodoDetailView.as_view(), name="todo-detail"),
]
