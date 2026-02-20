from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Grupo
from .serializers import GrupoSerializer


class GrupoViewSet(viewsets.ModelViewSet):
    queryset = Grupo.objects.all().order_by('-date')
    serializer_class = GrupoSerializer
    permission_classes = [IsAuthenticated]
