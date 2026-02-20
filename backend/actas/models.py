from cloudinary.models import CloudinaryField
from django.db import models
from grupos.models import Grupo


class Documento(models.Model):
    """
    Documento base que se vincula a un Acta.
    Al seleccionar el documento, autocompleta la fecha del acta (lógica de Recreeo).
    """
    TIPO_CHOICES = [
        ('Acta Estudiantes', 'Acta Estudiantes'),
        ('Informe', 'Informe'),
        ('Memorando', 'Memorando'),
        ('Otro', 'Otro'),
    ]
    title   = models.CharField(max_length=255, verbose_name="Título")
    type    = models.CharField(max_length=50, choices=TIPO_CHOICES, default='Informe')
    date    = models.DateField(verbose_name="Fecha")
    purpose = models.TextField(verbose_name="Propósito del documento")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        verbose_name = "Documento"
        verbose_name_plural = "Documentos"

    def __str__(self):
        return f"{self.title} ({self.type})"


class Acta(models.Model):
    """
    Acta estudiantil — lógica exacta de Recreeo.
    - Vinculada a un Documento base (que autocompleta la fecha)
    - Tiene Cohorte (Grupo) y Docente Asesor (de Agon)
    - Campos: logros, acuerdos, síntesis
    - Archivos: PDF + 2 evidencias fotográficas → Cloudinary
    """
    TIPO_CHOICES = [
        ('Acta Estudiantes', 'Acta Estudiantes'),
        ('Informe', 'Informe'),
        ('Memorando', 'Memorando'),
        ('Otro', 'Otro'),
    ]

    linked_doc   = models.ForeignKey(
        Documento, on_delete=models.SET_NULL, null=True,
        related_name='actas', verbose_name="Documento base"
    )
    type         = models.CharField(max_length=50, choices=TIPO_CHOICES, default='Acta Estudiantes')
    group        = models.ForeignKey(
        Grupo, on_delete=models.SET_NULL, null=True,
        related_name='actas', verbose_name="Cohorte"
    )
    # Referencia al TEACHER de Agon — solo ID + nombre cacheado
    advisor_id   = models.IntegerField(null=True, blank=True, verbose_name="ID Docente (Agon)")
    advisor_name = models.CharField(max_length=200, blank=True, verbose_name="Nombre Docente (cache)")
    date         = models.DateField(verbose_name="Fecha del acta")

    # Contenido del acta (respeta lógica de Recreeo)
    logros       = models.TextField(blank=True, verbose_name="Logros")
    acuerdos     = models.TextField(blank=True, verbose_name="Acuerdos")
    sintesis     = models.TextField(blank=True, verbose_name="Compromisos / Síntesis")

    # Archivos en Cloudinary
    pdf    = CloudinaryField('pdf',   blank=True, null=True, folder='ilinyx/actas/pdf',    resource_type='raw')
    photo1 = CloudinaryField('photo1', blank=True, null=True, folder='ilinyx/actas/fotos')
    photo2 = CloudinaryField('photo2', blank=True, null=True, folder='ilinyx/actas/fotos')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        verbose_name = "Acta"
        verbose_name_plural = "Actas"

    def __str__(self):
        group_name = self.group.name if self.group else "Sin cohorte"
        return f"Acta — {group_name} — {self.date}"
