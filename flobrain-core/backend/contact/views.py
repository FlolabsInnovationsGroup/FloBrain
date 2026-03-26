import html
import logging
import re

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework import status
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

logger = logging.getLogger(__name__)

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
MAX_FIELD_LENGTH = 500
MAX_MESSAGE_LENGTH = 5000

VALID_COMPANY_TYPES = {
    "startup",
    "smb",
    "enterprise",
    "agency",
    "nonprofit",
    "other",
}


class ContactRateThrottle(AnonRateThrottle):
    rate = "5/hour"


class ContactView(APIView):
    throttle_classes = [ContactRateThrottle]

    def post(self, request):
        payload = self._extract_fields(request.data)
        errors = self._validate(payload)

        if errors:
            return Response({"errors": errors}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        try:
            self._send_notification(payload)
        except Exception:
            logger.exception(
                "Contact email delivery failed",
                extra={"email": payload["email"]},
            )
            return Response(
                {"error": "We couldn't deliver your message. Please try again shortly."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        logger.info("Contact form submitted", extra={"email": payload["email"]})
        return Response({"success": True}, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------ #
    # Private helpers                                                      #
    # ------------------------------------------------------------------ #

    @staticmethod
    def _extract_fields(data: dict) -> dict:
        return {
            "name": (data.get("name") or "").strip()[:MAX_FIELD_LENGTH],
            "email": (data.get("email") or "").strip()[:MAX_FIELD_LENGTH],
            "company_type": (data.get("companyType") or "").strip().lower()[:MAX_FIELD_LENGTH],
            "message": (data.get("message") or "").strip()[:MAX_MESSAGE_LENGTH],
        }

    @staticmethod
    def _validate(payload: dict) -> dict:
        errors = {}

        for field in ("name", "email", "company_type", "message"):
            if not payload[field]:
                errors[field] = "This field is required."

        if "email" not in errors and not EMAIL_RE.match(payload["email"]):
            errors["email"] = "Enter a valid email address."

        if "company_type" not in errors and payload["company_type"] not in VALID_COMPANY_TYPES:
            errors["company_type"] = (
                f"Must be one of: {', '.join(sorted(VALID_COMPANY_TYPES))}."
            )

        return errors

    @staticmethod
    def _send_notification(payload: dict) -> None:
        name = payload["name"]
        email = payload["email"]
        company_type = payload["company_type"]
        message = payload["message"]

        subject = f"[Contact] {name} · {company_type.title()}"

        plain = (
            f"Name:         {name}\n"
            f"Email:        {email}\n"
            f"Company type: {company_type}\n"
            f"{'─' * 40}\n\n"
            f"{message}"
        )

        safe = {k: html.escape(v) for k, v in payload.items()}
        html_body = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:8px;overflow:hidden;
                    box-shadow:0 1px 3px rgba(0,0,0,.08)">

        <!-- Header -->
        <tr>
          <td style="background:#0f172a;padding:24px 32px">
            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:600;
                      letter-spacing:-.3px">New contact form submission</p>
          </td>
        </tr>

        <!-- Metadata -->
        <tr>
          <td style="padding:28px 32px 0">
            <table width="100%" cellpadding="0" cellspacing="0">
              {_meta_row("Name", safe["name"])}
              {_meta_row("Email",
                  f'<a href="mailto:{safe["email"]}" '
                  f'style="color:#2563eb;text-decoration:none">{safe["email"]}</a>')}
              {_meta_row("Company type", safe["company_type"].title())}
            </table>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:24px 32px 0">
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:0">
          </td>
        </tr>

        <!-- Message -->
        <tr>
          <td style="padding:24px 32px 32px">
            <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;
                      letter-spacing:.8px;color:#94a3b8">Message</p>
            <p style="margin:0;font-size:14px;line-height:1.7;color:#334155;
                      white-space:pre-wrap">{safe["message"]}</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""

        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain,
            from_email=settings.EMAIL_HOST_USER,
            to=[settings.SALES_EMAIL],
            reply_to=[email],
        )
        msg.attach_alternative(html_body, "text/html")
        msg.send(fail_silently=False)


def _meta_row(label: str, value: str) -> str:
    return (
        f'<tr>'
        f'<td style="padding:0 16px 14px 0;font-size:12px;font-weight:600;'
        f'text-transform:uppercase;letter-spacing:.6px;color:#94a3b8;'
        f'white-space:nowrap;vertical-align:top">{label}</td>'
        f'<td style="padding:0 0 14px;font-size:14px;color:#1e293b">{value}</td>'
        f'</tr>'
    )