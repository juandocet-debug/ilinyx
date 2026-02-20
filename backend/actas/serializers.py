from rest_framework import serializers
from .models import Acta, Documento


class DocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documento
        fields = '__all__'


class ActaSerializer(serializers.ModelSerializer):
    group_name    = serializers.CharField(source='group.name', read_only=True)
    linked_doc_title = serializers.CharField(source='linked_doc.title', read_only=True)
    pdf_url    = serializers.SerializerMethodField()
    photo1_url = serializers.SerializerMethodField()
    photo2_url = serializers.SerializerMethodField()
    file_count = serializers.SerializerMethodField()

    class Meta:
        model = Acta
        fields = [
            'id', 'linked_doc', 'linked_doc_title', 'type',
            'group', 'group_name',
            'advisor_id', 'advisor_name',
            'date', 'logros', 'acuerdos', 'sintesis',
            'pdf', 'pdf_url',
            'photo1', 'photo1_url',
            'photo2', 'photo2_url',
            'file_count', 'created_at',
        ]
        extra_kwargs = {
            'pdf':    {'required': False, 'allow_null': True},
            'photo1': {'required': False, 'allow_null': True},
            'photo2': {'required': False, 'allow_null': True},
        }

    def get_pdf_url(self, obj):
        return obj.pdf.url if obj.pdf else None

    def get_photo1_url(self, obj):
        return obj.photo1.url if obj.photo1 else None

    def get_photo2_url(self, obj):
        return obj.photo2.url if obj.photo2 else None

    def get_file_count(self, obj):
        return sum([bool(obj.pdf), bool(obj.photo1), bool(obj.photo2)])
