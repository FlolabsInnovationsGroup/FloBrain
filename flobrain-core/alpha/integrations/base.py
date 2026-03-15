from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class BaseIntegration(ABC):
    """Abstract base class for all FloBrain integrations."""

    # ------------------------------------------------------------------
    # Identity
    # ------------------------------------------------------------------

    @property
    @abstractmethod
    def name(self) -> str:
        """Short machine-readable name, e.g. 'notion'."""
        ...

    @property
    @abstractmethod
    def description(self) -> str:
        """Human-readable description shown in the integrations list."""
        ...

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    @abstractmethod
    async def connect(self) -> bool:
        """
        Establish or verify connection to the external service.

        Returns True on success, False otherwise.
        """
        ...

    @abstractmethod
    async def disconnect(self) -> None:
        """Clean up any open connections or resources."""
        ...

    @abstractmethod
    async def health_check(self) -> dict[str, Any]:
        """
        Check integration health.

        Returns a dict with at least {"status": "ok" | "error", "message": str}.
        """
        ...

    # ------------------------------------------------------------------
    # OAuth scaffold (not abstract — subclasses override only if needed)
    # ------------------------------------------------------------------

    def get_auth_url(self, state: str = "") -> str:
        """
        Return the OAuth authorization URL for this integration.

        Subclasses that support OAuth should override this.
        """
        raise NotImplementedError(f"{self.name} does not support OAuth.")

    async def exchange_code(self, code: str) -> dict[str, Any]:
        """
        Exchange an OAuth authorization code for tokens.

        Returns a dict containing at minimum:
          {"access_token": str, "token_type": str}
        """
        raise NotImplementedError(f"{self.name} does not support OAuth code exchange.")

    async def refresh_token(self, refresh_token: str) -> dict[str, Any]:
        """Refresh an expired OAuth access token."""
        raise NotImplementedError(f"{self.name} does not support token refresh.")
