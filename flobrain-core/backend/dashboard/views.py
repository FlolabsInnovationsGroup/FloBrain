from datetime import timedelta
from devices.models import Device
from errorlog.models import ErrorLog

class DashboardHealthView(APIView):
    def get(self, request):
        db_ok = True
        try:
            connection.ensure_connection()
        except Exception:
            db_ok = False

        connected_devices = Device.objects.filter(
            last_seen__gte=timezone.now() - timedelta(minutes=5),
            is_connected=True,
        ).count()

        if not db_ok:
            system_status = "critical_error"
        elif connected_devices == 0:
            system_status = "idle"
        else:
            system_status = "online"

        return Response({
            "status": "ok" if db_ok else "degraded",
            "backend": "online",
            "database": "connected" if db_ok else "disconnected",
            "allSystemsOperational": db_ok and connected_devices > 0,
            "system_status": system_status,
            "connected_devices": connected_devices,
        })


class DashboardErrorLogView(APIView):
    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response(
                {"error": "Authentication Required", "details": "valid Bearer token required"},
                status=401,
            )

        logs = ErrorLog.objects.all()[:20]
        return Response({
            "error-logs": [
                {
                    "level": log.level,
                    "message": log.message,
                    "timestamp": log.timestamp.strftime("%d/%m/%y"),
                }
                for log in logs
            ]
        })