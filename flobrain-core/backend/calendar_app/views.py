from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from users.views import get_user_from_request

from .models import CalendarEvent, Todo
from .serializers import (
    CalendarEventCreateSerializer,
    CalendarEventSerializer,
    CalendarEventUpdateSerializer,
    TodoCreateSerializer,
    TodoSerializer,
    TodoUpdateSerializer,
)


class CalendarEventListCreateView(APIView):
    """
    GET  /api/calendar/events/           — list user's events
         ?date=YYYY-MM-DD                  filter to a specific date
         ?month=YYYY-MM                    filter to a full month
    POST /api/calendar/events/           — create an event
    """

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        events = CalendarEvent.objects.filter(owner=user)

        date_param = request.query_params.get("date")
        month_param = request.query_params.get("month")

        if date_param:
            events = events.filter(date=date_param)
        elif month_param:
            try:
                year, month = month_param.split("-")
                events = events.filter(date__year=int(year), date__month=int(month))
            except (ValueError, AttributeError):
                return Response(
                    {"detail": "month must be in YYYY-MM format."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return Response(CalendarEventSerializer(events, many=True).data)

    def post(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = CalendarEventCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        event = serializer.save(owner=user)
        return Response(CalendarEventSerializer(event).data, status=status.HTTP_201_CREATED)


class CalendarEventDetailView(APIView):
    """
    PATCH  /api/calendar/events/{id}/  — update event fields
    DELETE /api/calendar/events/{id}/  — delete event
    """

    def patch(self, request, event_id):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        event = get_object_or_404(CalendarEvent, id=event_id, owner=user)
        serializer = CalendarEventUpdateSerializer(event, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        event = serializer.save()
        return Response(CalendarEventSerializer(event).data)

    def delete(self, request, event_id):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        event = get_object_or_404(CalendarEvent, id=event_id, owner=user)
        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TodoListCreateView(APIView):
    """
    GET  /api/todos/  — list user's todos (incomplete first, then complete)
    POST /api/todos/  — create a todo
    """

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        todos = Todo.objects.filter(owner=user)
        return Response(TodoSerializer(todos, many=True).data)

    def post(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = TodoCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        todo = serializer.save(owner=user)
        return Response(TodoSerializer(todo).data, status=status.HTTP_201_CREATED)


class TodoDetailView(APIView):
    """
    PATCH  /api/todos/{id}/  — update title or completed flag
    DELETE /api/todos/{id}/  — delete todo
    """

    def patch(self, request, todo_id):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        todo = get_object_or_404(Todo, id=todo_id, owner=user)
        serializer = TodoUpdateSerializer(todo, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        todo = serializer.save()
        return Response(TodoSerializer(todo).data)

    def delete(self, request, todo_id):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        todo = get_object_or_404(Todo, id=todo_id, owner=user)
        todo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
