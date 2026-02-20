from cloudinary.models import CloudinaryField
from django.db import models


class Grupo(models.Model):
    """
    Representa una cohorte/grupo académico.
    El asesor se referencia por ID de usuario en Agon (no se duplica).
    """
    name        = models.CharField(max_length=100, verbose_name="Nombre / Cohorte")
    date        = models.DateField(verbose_name="Fecha de inicio")
    description = models.TextField(blank=True, verbose_name="Descripción")
    features    = models.TextField(blank=True, verbose_name="Características y condiciones")
    # ID del TEACHER en Agon — no FK porque son sistemas separados
    advisor_id  = models.IntegerField(null=True, blank=True, verbose_name="ID Asesor (Agon)")
    advisor_name = models.CharField(max_length=200, blank=True, verbose_name="Nombre Asesor (cache)")
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        verbose_name = "Grupo / Cohorte"
        verbose_name_plural = "Grupos / Cohortes"

    def __str__(self):
        return f"{self.name} — Asesor: {self.advisor_name or self.advisor_id}"
