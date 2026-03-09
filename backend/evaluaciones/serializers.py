from rest_framework import serializers
from .models import Rubrica, Criterio, EvaluacionGrupo, Calificacion


class CriterioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Criterio
        fields = ['id', 'nombre', 'orden']


class RubricaSerializer(serializers.ModelSerializer):
    criterios = CriterioSerializer(many=True, read_only=True)

    class Meta:
        model = Rubrica
        fields = ['id', 'titulo', 'descripcion', 'creador_id', 'cant_evaluadores', 'criterios', 'created_at']
        read_only_fields = ['creador_id', 'created_at']


class RubricaCreateSerializer(serializers.Serializer):
    """Serializer de escritura para crear rúbrica + criterios en un solo request."""
    titulo = serializers.CharField(max_length=255)
    descripcion = serializers.CharField(allow_blank=True, default='')
    cant_evaluadores = serializers.IntegerField(default=1, min_value=1)
    criterios = serializers.ListField(
        child=serializers.CharField(max_length=255),
        min_length=1
    )

    def create(self, user_id):
        data = self.validated_data
        rubrica = Rubrica.objects.create(
            titulo=data['titulo'],
            descripcion=data['descripcion'],
            creador_id=user_id,
            cant_evaluadores=data['cant_evaluadores']
        )
        for i, nombre in enumerate(data['criterios']):
            Criterio.objects.create(rubrica=rubrica, nombre=nombre, orden=i)
        return rubrica


class EvaluacionGrupoSerializer(serializers.ModelSerializer):
    rubrica_detalle = RubricaSerializer(source='rubrica', read_only=True)

    class Meta:
        model = EvaluacionGrupo
        fields = ['id', 'rubrica', 'rubrica_detalle', 'grupo_agon_id', 'grupo_nombre', 'fecha', 'activa']
        read_only_fields = ['fecha']


class CalificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calificacion
        fields = ['id', 'evaluacion_grupo', 'usuario_agon_id', 'puntajes', 'nota_final', 'comentarios', 'created_at']
        read_only_fields = ['created_at']
