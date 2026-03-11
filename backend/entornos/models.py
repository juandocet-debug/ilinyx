"""
entornos/models.py
Entorno Académico — agrupa grupos de AGON por materia/semestre.
Organiza evaluaciones en Cortes y Entregables con soporte de Rúbricas y notas manuales.
"""
from django.db import models


class Entorno(models.Model):
    """Espacio académico semestral. Agrupa grupos, define cortes y entregables."""
    nombre        = models.CharField(max_length=255, verbose_name="Nombre del espacio")
    semestre      = models.CharField(max_length=20,  verbose_name="Semestre", default='')
    descripcion   = models.TextField(blank=True, verbose_name="Descripción")
    objetivos     = models.TextField(blank=True, verbose_name="Objetivos de aprendizaje")
    profesor_id   = models.IntegerField(verbose_name="ID Docente (AGON)")
    # Cache de grupos de AGON seleccionados para este entorno
    grupos_agon_ids  = models.JSONField(default=list)
    grupos_nombres   = models.JSONField(default=list, verbose_name="Nombres cache")
    fecha_inicio  = models.DateField(null=True, blank=True)
    fecha_fin     = models.DateField(null=True, blank=True)
    color         = models.CharField(max_length=7, default='#6366f1', verbose_name="Color")
    activo        = models.BooleanField(default=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name        = "Entorno Académico"
        verbose_name_plural = "Entornos Académicos"

    def __str__(self):
        return f"{self.nombre} ({self.semestre})"


class Corte(models.Model):
    """Período de evaluación dentro de un Entorno. Suma de porcentajes debe ser 100."""
    entorno     = models.ForeignKey(Entorno, on_delete=models.CASCADE, related_name='cortes')
    nombre      = models.CharField(max_length=100, verbose_name="Nombre del corte")
    numero      = models.IntegerField(default=1)
    porcentaje  = models.DecimalField(max_digits=5, decimal_places=2, default=33.33,
                                      verbose_name="% de la nota final")
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin    = models.DateField(null=True, blank=True)
    descripcion  = models.TextField(blank=True)

    class Meta:
        ordering = ['numero']
        verbose_name = "Corte"

    def __str__(self):
        return f"{self.entorno.nombre} — {self.nombre}"


class Entregable(models.Model):
    """Actividad evaluativa de un Corte. Linked a Rúbrica o acepta nota manual."""
    TIPO_RUBRICA = 'rubrica'
    TIPO_MANUAL  = 'manual'
    TIPO_CHOICES = [
        (TIPO_RUBRICA, 'Por Rúbrica'),
        (TIPO_MANUAL,  'Nota Manual'),
    ]

    corte          = models.ForeignKey(Corte, on_delete=models.CASCADE, related_name='entregables')
    nombre         = models.CharField(max_length=255)
    descripcion    = models.TextField(blank=True)
    tipo           = models.CharField(max_length=10, choices=TIPO_CHOICES, default=TIPO_RUBRICA)
    rubrica        = models.ForeignKey(
        'evaluaciones.Rubrica', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='entregables'
    )
    peso           = models.DecimalField(max_digits=5, decimal_places=2, default=100.0,
                                         verbose_name="Peso dentro del corte (%)")
    nota_max       = models.DecimalField(max_digits=4, decimal_places=1, default=5.0)
    fecha_entrega  = models.DateField(null=True, blank=True)
    # Cuando activo=True, el entregable está habilitado para evaluación
    activo         = models.BooleanField(default=False)
    orden          = models.IntegerField(default=0)

    class Meta:
        ordering = ['orden', 'fecha_entrega']
        verbose_name = "Entregable"

    def __str__(self):
        return f"{self.corte.nombre} — {self.nombre}"
