from django.urls import path
from .views import (
    AttachmentDetailView,
    AttachmentListCreateView,
    DocumentDetailView,
    DocumentListCreateView,
    DocumentRecentView,
)

urlpatterns = [
    path("", DocumentListCreateView.as_view(), name="doc-list-create"),
    path("recent/", DocumentRecentView.as_view(), name="doc-recent"),
    path("attachments/", AttachmentListCreateView.as_view(), name="attachment-list-create"),
    path("attachments/<int:attachment_id>/", AttachmentDetailView.as_view(), name="attachment-detail"),
    # doc-detail must come after string-prefixed paths to avoid int match on "recent" or "attachments"
    path("<int:doc_id>/", DocumentDetailView.as_view(), name="doc-detail"),
]
