from django.db import models


class Rubrica(models.Model):
    titulo = models.CharField(max_length=255, verbose_name="Título")
    descripcion = models.TextField(blank=True, verbose_name="Descripción")
    creador_id = models.IntegerField(verbose_name="ID Docente (Agon)")
    cant_evaluadores = models.IntegerField(default=1, verbose_name="Cantidad de evaluadores")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.titulo


class Criterio(models.Model):
    """Un criterio de la rúbrica, con N niveles de logro asociados."""
    rubrica = models.ForeignKey(Rubrica, on_delete=models.CASCADE, related_name='criterios')
    nombre = models.CharField(max_length=255, verbose_name="Nombre del criterio")
    orden = models.IntegerField(default=0)

    class Meta:
        ordering = ['orden']

    def __str__(self):
        return self.nombre


class NivelCriterio(models.Model):
    """
    Nivel de logro de un criterio.
    Cada criterio puede tener entre 1 y N niveles.
    El valor representa la puntuación (típicamente 1 a 5).
    """
    criterio = models.ForeignKey(Criterio, on_delete=models.CASCADE, related_name='niveles')
    valor = models.IntegerField(verbose_name="Valor numérico del nivel")
    descripcion = models.TextField(blank=True, verbose_name="Descripción del nivel de logro")

    class Meta:
        ordering = ['valor']
        unique_together = ('criterio', 'valor')

    def __str__(self):
        return f"{self.criterio.nombre} — Nivel {self.valor}"


class EvaluacionGrupo(models.Model):
    """Asignación de una rúbrica a un grupo/curso de AGON."""
    rubrica = models.ForeignKey(Rubrica, on_delete=models.CASCADE, related_name='evaluaciones')
    grupo_agon_id = models.IntegerField(verbose_name="ID Clase/Grupo en AGON")
    grupo_nombre = models.CharField(max_length=255, blank=True, verbose_name="Nombre del grupo (cache)")
    fecha = models.DateField(auto_now_add=True)
    activa = models.BooleanField(default=True)

    class Meta:
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.rubrica.titulo} → {self.grupo_nombre or self.grupo_agon_id}"


class Calificacion(models.Model):
    evaluacion_grupo = models.ForeignKey(EvaluacionGrupo, on_delete=models.CASCADE, related_name='calificaciones')
    usuario_agon_id = models.IntegerField(verbose_name="ID Estudiante (Agon)")
    # puntajes: { "criterio_id": valor_seleccionado }
    puntajes = models.JSONField(default=dict)
    nota_final = models.DecimalField(max_digits=4, decimal_places=2, default=0.0)
    comentarios = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('evaluacion_grupo', 'usuario_agon_id')

    def __str__(self):
        return f"Calificación usuario {self.usuario_agon_id} — eval {self.evaluacion_grupo_id}"
