from django.db import models
from grupos.models import Grupo

class Rubrica(models.Model):
    titulo = models.CharField(max_length=255, verbose_name="Título")
    descripcion = models.TextField(blank=True, verbose_name="Descripción")
    creador_id = models.IntegerField(verbose_name="ID Docente (Agon)")
    cant_evaluadores = models.IntegerField(default=1, verbose_name="Cantidad de evaluadores")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

class Criterio(models.Model):
    rubrica = models.ForeignKey(Rubrica, on_delete=models.CASCADE, related_name='criterios')
    nombre = models.CharField(max_length=255)
    orden = models.IntegerField(default=0)

    class Meta:
        ordering = ['orden']

class EvaluacionGrupo(models.Model):
    rubrica = models.ForeignKey(Rubrica, on_delete=models.CASCADE, related_name='evaluaciones')
    grupo = models.ForeignKey(Grupo, on_delete=models.CASCADE, related_name='evaluaciones')
    fecha = models.DateField(auto_now_add=True)
    activa = models.BooleanField(default=True)

    class Meta:
        ordering = ['-fecha']

class Calificacion(models.Model):
    evaluacion_grupo = models.ForeignKey(EvaluacionGrupo, on_delete=models.CASCADE, related_name='calificaciones')
    evaluador_id = models.IntegerField(verbose_name="ID Evaluador (Agon)")
    estudiante_id = models.IntegerField(verbose_name="ID Estudiante (Agon)")
    puntajes = models.JSONField(default=dict, help_text="{'criterio_id': nota_1_a_5}")
    nota_final = models.DecimalField(max_digits=4, decimal_places=2, default=0.0)
    comentarios = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('evaluacion_grupo', 'evaluador_id', 'estudiante_id')
