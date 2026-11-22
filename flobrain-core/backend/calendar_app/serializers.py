from rest_framework import serializers
from .models import CalendarEvent, Todo


class CalendarEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = ["id", "title", "date", "start_time", "end_time", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class CalendarEventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = ["title", "date", "start_time", "end_time"]


class CalendarEventUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = ["title", "date", "start_time", "end_time"]
        extra_kwargs = {
            "title": {"required": False},
            "date": {"required": False},
            "start_time": {"required": False},
            "end_time": {"required": False},
        }


class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = ["id", "title", "completed", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class TodoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = ["title"]


class TodoUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = ["title", "completed"]
        extra_kwargs = {
            "title": {"required": False},
            "completed": {"required": False},
        }
