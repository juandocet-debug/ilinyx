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

class EvaluacionGrupoSerializer(serializers.ModelSerializer):
    rubrica_detalle = RubricaSerializer(source='rubrica', read_only=True)

    class Meta:
        model = EvaluacionGrupo
        fields = ['id', 'rubrica', 'grupo', 'fecha', 'activa', 'rubrica_detalle']

class CalificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calificacion
        fields = ['id', 'evaluacion_grupo', 'evaluador_id', 'estudiante_id', 'puntajes', 'nota_final', 'comentarios', 'created_at']
