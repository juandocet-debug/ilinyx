from rest_framework import serializers
from .models import Grupo


class GrupoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grupo
        fields = [
            'id', 'name', 'date', 'description',
            'features', 'advisor_id', 'advisor_name', 'created_at'
        ]
