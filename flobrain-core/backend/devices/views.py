# devices/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Device

class DeviceHeartbeatView(APIView):
    def post(self, request):
        device_id = request.data.get("device_id")
        if not device_id:
            return Response({"error": "device_id required"}, status=400)
        device, _ = Device.objects.get_or_create(device_id=device_id)
        device.is_connected = True
        device.save()  # last_seen auto-updates via auto_now
        return Response({"status": "ok"})