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
    advisor_id   = models.IntegerField(null=True, blank=True, verbose_name="ID Docente (Agon)")
    advisor_name = models.CharField(max_length=200, blank=True, verbose_name="Nombre Docente (cache)")
    date         = models.DateField(verbose_name="Fecha del acta")

    logros       = models.TextField(blank=True, verbose_name="Logros")
    acuerdos     = models.TextField(blank=True, verbose_name="Acuerdos")
    sintesis     = models.TextField(blank=True, verbose_name="Compromisos / Síntesis")

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


class ActaReunion(models.Model):
    """
    Acta de Reunión — formulario completo con asistentes, firmas, comentarios.
    Todos los datos del formulario se almacenan como JSON para máxima flexibilidad.
    'participantes_ids' permite buscar rápidamente actas por usuario.
    """
    # Identificación
    tipo        = models.CharField(max_length=20, default='ACTA')
    numero      = models.CharField(max_length=20, blank=True)
    total       = models.CharField(max_length=20, blank=True)
    fecha       = models.CharField(max_length=30, blank=True)
    hora_inicio = models.CharField(max_length=20, blank=True)
    hora_final  = models.CharField(max_length=20, blank=True)
    instancias  = models.TextField(blank=True)
    lugar       = models.TextField(blank=True)

    # Contenido
    orden_dia   = models.TextField(blank=True)
    desarrollo  = models.TextField(blank=True)
    proxima_convocatoria = models.TextField(blank=True, default='N/A')
    anexos      = models.TextField(blank=True, default='N/A')

    # JSON fields — listas de personas
    asistentes  = models.JSONField(default=list, blank=True)
    ausentes    = models.JSONField(default=list, blank=True)
    invitados   = models.JSONField(default=list, blank=True)
    compromisos = models.JSONField(default=list, blank=True)
    firmas      = models.JSONField(default=list, blank=True)
    comentarios = models.JSONField(default=list, blank=True)

    # IDs de participantes (para búsquedas rápidas)
    participantes_ids = models.JSONField(default=list, blank=True,
        help_text="Lista de user_id de AGON de todos los involucrados")

    # Creador del acta
    creador_id   = models.IntegerField(null=True, blank=True)
    creador_name = models.CharField(max_length=200, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Acta de Reunión"
        verbose_name_plural = "Actas de Reunión"

    def __str__(self):
        return f"Acta {self.numero}/{self.total} — {self.fecha}"

    def actualizar_participantes(self):
        """Recalcula la lista de IDs de participantes para búsquedas rápidas."""
        ids = set()
        for lista in [self.asistentes, self.ausentes, self.invitados, self.firmas]:
            for person in (lista or []):
                uid = person.get('user_id')
                if uid:
                    try:
                        ids.add(int(uid))
                    except (ValueError, TypeError):
                        ids.add(uid)
        for c in (self.compromisos or []):
            uid = c.get('responsable_id')
            if uid:
                try:
                    ids.add(int(uid))
                except (ValueError, TypeError):
                    ids.add(uid)
        if self.creador_id:
            try:
                ids.add(int(self.creador_id))
            except (ValueError, TypeError):
                ids.add(self.creador_id)
        self.participantes_ids = list(ids)
