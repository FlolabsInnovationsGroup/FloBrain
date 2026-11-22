from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from users.views import get_user_from_request

from .models import Document, DocumentAttachment
from .serializers import (
    AttachmentCreateSerializer,
    AttachmentSerializer,
    AttachmentUpdateSerializer,
    DocumentCreateSerializer,
    DocumentDetailSerializer,
    DocumentListSerializer,
    DocumentUpdateSerializer,
)


class DocumentListCreateView(APIView):
    """
    GET  /api/docs/  — list user's documents (compact)
    POST /api/docs/  — create a new document
    """

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        docs = Document.objects.filter(owner=user)
        return Response(DocumentListSerializer(docs, many=True).data)

    def post(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = DocumentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        doc = serializer.save(owner=user)
        return Response(DocumentDetailSerializer(doc).data, status=status.HTTP_201_CREATED)


class DocumentDetailView(APIView):
    """
    GET    /api/docs/{id}/  — document detail with content
    PATCH  /api/docs/{id}/  — update title, content, or is_favorite
    DELETE /api/docs/{id}/  — delete
    """

    def get(self, request, doc_id):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        doc = get_object_or_404(Document, id=doc_id, owner=user)
        return Response(DocumentDetailSerializer(doc).data)

    def patch(self, request, doc_id):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        doc = get_object_or_404(Document, id=doc_id, owner=user)
        serializer = DocumentUpdateSerializer(doc, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        doc = serializer.save()
        return Response(DocumentDetailSerializer(doc).data)

    def delete(self, request, doc_id):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        doc = get_object_or_404(Document, id=doc_id, owner=user)
        doc.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DocumentRecentView(APIView):
    """
    GET /api/docs/recent/
    Returns the 10 most recently touched items (docs + attachments) merged,
    for the MyDocsOverview activity feed.
    Shape: [{id, title, type ("document"|"attachment"), date}]
    """

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        recent_docs = (
            Document.objects.filter(owner=user)
            .order_by("-updated_at")
            .values("id", "title", "updated_at")[:10]
        )
        recent_attachments = (
            DocumentAttachment.objects.filter(uploaded_by=user)
            .order_by("-created_at")
            .values("id", "name", "created_at")[:10]
        )

        activity = []
        for doc in recent_docs:
            activity.append({
                "id": doc["id"],
                "title": doc["title"],
                "type": "document",
                "date": doc["updated_at"],
            })
        for att in recent_attachments:
            activity.append({
                "id": att["id"],
                "title": att["name"],
                "type": "attachment",
                "date": att["created_at"],
            })

        activity.sort(key=lambda x: x["date"], reverse=True)
        return Response(activity[:10])


class AttachmentListCreateView(APIView):
    """
    GET  /api/docs/attachments/  — list user's attachments
    POST /api/docs/attachments/  — upload one attachment (multipart/form-data)
    """

    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        attachments = DocumentAttachment.objects.filter(uploaded_by=user)
        return Response(
            AttachmentSerializer(attachments, many=True, context={"request": request}).data
        )

    def post(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = AttachmentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        attachment = DocumentAttachment.objects.create(
            name=serializer.validated_data["name"],
            file=serializer.validated_data["file"],
            uploaded_by=user,
        )
        return Response(
            AttachmentSerializer(attachment, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class AttachmentDetailView(APIView):
    """
    PATCH  /api/docs/attachments/{id}/  — update name or is_favorite
    DELETE /api/docs/attachments/{id}/  — delete attachment and its file
    """

    def patch(self, request, attachment_id):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        attachment = get_object_or_404(DocumentAttachment, id=attachment_id, uploaded_by=user)
        serializer = AttachmentUpdateSerializer(attachment, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        attachment = serializer.save()
        return Response(AttachmentSerializer(attachment, context={"request": request}).data)

    def delete(self, request, attachment_id):
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        attachment = get_object_or_404(DocumentAttachment, id=attachment_id, uploaded_by=user)
        attachment.file.delete(save=False)
        attachment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
