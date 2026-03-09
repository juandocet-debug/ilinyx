from rest_framework import serializers
from .models import Rubrica, Criterio, NivelCriterio, EvaluacionGrupo, Calificacion


class NivelCriterioSerializer(serializers.ModelSerializer):
    class Meta:
        model = NivelCriterio
        fields = ['id', 'valor', 'descripcion']


class CriterioSerializer(serializers.ModelSerializer):
    niveles = NivelCriterioSerializer(many=True, read_only=True)

    class Meta:
        model = Criterio
        fields = ['id', 'nombre', 'orden', 'niveles']


class RubricaSerializer(serializers.ModelSerializer):
    criterios = CriterioSerializer(many=True, read_only=True)

    class Meta:
        model = Rubrica
        fields = ['id', 'titulo', 'descripcion', 'creador_id', 'cant_evaluadores', 'criterios', 'created_at']
        read_only_fields = ['creador_id', 'created_at']


class NivelInputSerializer(serializers.Serializer):
    valor = serializers.IntegerField(min_value=1, max_value=10)
    descripcion = serializers.CharField(allow_blank=True, default='')


class CriterioInputSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=255)
    niveles = NivelInputSerializer(many=True, default=[])


class RubricaCreateSerializer(serializers.Serializer):
    """Crea rúbrica + criterios + niveles en un único request."""
    titulo = serializers.CharField(max_length=255)
    descripcion = serializers.CharField(allow_blank=True, default='')
    cant_evaluadores = serializers.IntegerField(default=1, min_value=1)
    criterios = CriterioInputSerializer(many=True, min_length=1)

    def create(self, user_id):
        data = self.validated_data
        rubrica = Rubrica.objects.create(
            titulo=data['titulo'],
            descripcion=data['descripcion'],
            creador_id=user_id,
            cant_evaluadores=data['cant_evaluadores'],
        )
        for i, c_data in enumerate(data['criterios']):
            criterio = Criterio.objects.create(
                rubrica=rubrica,
                nombre=c_data['nombre'],
                orden=i,
            )
            for nivel in c_data.get('niveles', []):
                NivelCriterio.objects.create(
                    criterio=criterio,
                    valor=nivel['valor'],
                    descripcion=nivel.get('descripcion', ''),
                )
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
        fields = ['id', 'evaluacion_grupo', 'usuario_agon_id', 'puntajes', 'nota_final', 'comentarios', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
