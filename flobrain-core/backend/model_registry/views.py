from django.db import IntegrityError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from users.views import get_user_from_request

from .models import AIModel
from .serializers import AIModelSerializer


def _authentication_error(request):
    if get_user_from_request(request):
        return None
    return Response(
        {
            "error": "Authentication required",
            "details": "Valid Bearer token required",
        },
        status=status.HTTP_401_UNAUTHORIZED,
    )


def _validation_error(serializer):
    return Response(
        {"error": "Validation failed", "details": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


class AIModelListCreateView(APIView):
    """List registered models or add a model to the shared registry."""

    def get(self, request):
        auth_error = _authentication_error(request)
        if auth_error:
            return auth_error
        models = AIModel.objects.all()
        return Response(AIModelSerializer(models, many=True).data)

    def post(self, request):
        auth_error = _authentication_error(request)
        if auth_error:
            return auth_error
        serializer = AIModelSerializer(data=request.data or {})
        if not serializer.is_valid():
            return _validation_error(serializer)
        try:
            serializer.save()
        except IntegrityError:
            return Response(
                {
                    "error": "Model already exists",
                    "details": "This provider already has a model with this name.",
                },
                status=status.HTTP_409_CONFLICT,
            )
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AIModelDetailView(APIView):
    """Retrieve, update, or delete one registered model."""

    @staticmethod
    def _get_model(pk):
        try:
            return AIModel.objects.get(pk=pk), None
        except AIModel.DoesNotExist:
            return None, Response(
                {"error": "Not found", "details": "Registered model not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

    def get(self, request, pk):
        auth_error = _authentication_error(request)
        if auth_error:
            return auth_error
        model, not_found = self._get_model(pk)
        if not_found:
            return not_found
        return Response(AIModelSerializer(model).data)

    def patch(self, request, pk):
        auth_error = _authentication_error(request)
        if auth_error:
            return auth_error
        model, not_found = self._get_model(pk)
        if not_found:
            return not_found
        serializer = AIModelSerializer(
            model,
            data=request.data or {},
            partial=True,
        )
        if not serializer.is_valid():
            return _validation_error(serializer)
        try:
            serializer.save()
        except IntegrityError:
            return Response(
                {
                    "error": "Model already exists",
                    "details": "This provider already has a model with this name.",
                },
                status=status.HTTP_409_CONFLICT,
            )
        return Response(serializer.data)

    def delete(self, request, pk):
        auth_error = _authentication_error(request)
        if auth_error:
            return auth_error
        model, not_found = self._get_model(pk)
        if not_found:
            return not_found
        model.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
