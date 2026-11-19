from django.contrib import admin

from .models import CredentialValidation, CredentialVersion, ProviderCredential, TokenReplayGuard


@admin.register(ProviderCredential)
class ProviderCredentialAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "provider", "source", "label", "scope_id", "created_at"]
    list_filter = ["provider", "source"]
    search_fields = ["scope_id", "label"]
    readonly_fields = ["id", "scope_id", "created_at", "updated_at"]


@admin.register(CredentialVersion)
class CredentialVersionAdmin(admin.ModelAdmin):
    list_display = ["id", "credential", "version", "state", "activated_at", "created_at"]
    list_filter = ["state"]
    readonly_fields = ["id", "encrypted_key", "created_at"]


@admin.register(CredentialValidation)
class CredentialValidationAdmin(admin.ModelAdmin):
    list_display = ["id", "credential_version", "status", "checked_at", "provider_request_id"]
    list_filter = ["status"]
    readonly_fields = ["id", "created_at"]


@admin.register(TokenReplayGuard)
class TokenReplayGuardAdmin(admin.ModelAdmin):
    list_display = ["jti", "kind", "expires_at", "created_at"]
    readonly_fields = ["jti", "kind", "expires_at", "created_at"]
