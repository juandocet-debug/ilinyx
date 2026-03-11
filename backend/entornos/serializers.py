from rest_framework import serializers
from .models import Entorno, Corte, Entregable


# ── Entregable ────────────────────────────────────────────────────────────────

class EntregableSerializer(serializers.ModelSerializer):
    rubrica_titulo = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = Entregable
        fields = [
            'id', 'nombre', 'descripcion', 'tipo',
            'rubrica', 'rubrica_titulo',
            'peso', 'nota_max', 'fecha_entrega', 'activo', 'orden',
        ]

    def get_rubrica_titulo(self, obj):
        return obj.rubrica.titulo if obj.rubrica_id else None


class EntregableCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Entregable
        fields = [
            'nombre', 'descripcion', 'tipo',
            'rubrica', 'peso', 'nota_max', 'fecha_entrega', 'orden',
        ]


# ── Corte ─────────────────────────────────────────────────────────────────────

class CorteSerializer(serializers.ModelSerializer):
    entregables = EntregableSerializer(many=True, read_only=True)

    class Meta:
        model  = Corte
        fields = [
            'id', 'nombre', 'numero', 'porcentaje',
            'fecha_inicio', 'fecha_fin', 'descripcion', 'entregables',
        ]


class CorteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Corte
        fields = ['nombre', 'numero', 'porcentaje', 'fecha_inicio', 'fecha_fin', 'descripcion']


# ── Entorno ───────────────────────────────────────────────────────────────────

class EntornoSerializer(serializers.ModelSerializer):
    cortes      = CorteSerializer(many=True, read_only=True)
    total_grupos = serializers.SerializerMethodField()

    class Meta:
        model  = Entorno
        fields = [
            'id', 'nombre', 'semestre', 'descripcion', 'objetivos',
            'profesor_id', 'grupos_agon_ids', 'grupos_nombres',
            'fecha_inicio', 'fecha_fin', 'color', 'activo',
            'created_at', 'updated_at', 'cortes', 'total_grupos',
        ]
        read_only_fields = ['profesor_id', 'created_at', 'updated_at']

    def get_total_grupos(self, obj):
        return len(obj.grupos_agon_ids or [])


class EntornoCreateSerializer(serializers.ModelSerializer):
    """Para POST/PUT — sin cortes (se añaden por separado)."""
    class Meta:
        model  = Entorno
        fields = [
            'nombre', 'semestre', 'descripcion', 'objetivos',
            'grupos_agon_ids', 'grupos_nombres',
            'fecha_inicio', 'fecha_fin', 'color',
        ]
