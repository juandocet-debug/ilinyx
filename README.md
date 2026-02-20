# ILINYX — Sistema de Gestión de Actas y Cohortes

Sistema del ecosistema UPN-CIAR. Migración y evolución del sistema Recreeo.

**Ver documentación completa del ecosistema:** `../ECOSISTEMA.md`

---

## Stack
- **Backend:** Django + Django REST Framework + JWT (`rest_framework_simplejwt`)
- **Frontend:** React 18 + Vite + Tailwind CSS (paleta lila `ilinyx-*`)
- **Auth:** JWT de **AGON** (no tiene auth propia)
- **BD:** PostgreSQL en Render (separada de Agon)
- **Archivos:** Cloudinary

## Módulos

| App Django | Modelos | Endpoints |
|---|---|---|
| `actas` | `Documento`, `Acta` | `/api/actas/registros/`, `/api/actas/documentos/` |
| `grupos` | `Grupo` | `/api/grupos/` |

## Lógica respetada de Recreeo

- Acta → vinculada a Documento base (autocompleta la fecha)
- Campos: `logros`, `acuerdos`, `sintesis`
- Archivos: PDF + 2 fotos → Cloudinary
- Docente asesor: viene de `/api/users/?role=TEACHER` de **Agon**
- Cohorte/Grupo: con asesor_id de Agon

## Arrancar en local

```bash
# Requiere que Agon esté corriendo en http://localhost:8000

# Backend (puerto 8001)
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8001

# Frontend (puerto 5174)
cd frontend
npm install
npm run dev
```

## Variables de entorno locales

Crea un archivo `.env` en `backend/`:
```
AGON_API_URL=http://localhost:8000/api
```

Crea un archivo `.env` en `frontend/`:
```
VITE_AGON_API_URL=http://localhost:8000/api
VITE_ILINYX_API_URL=http://localhost:8001/api
```

## Estado del proyecto

- [x] Backend Django — modelos Acta, Documento, Grupo
- [x] Backend Django — serializers, views, urls
- [x] Frontend — Login (auth con JWT de Agon)
- [x] Frontend — DashboardLayout (sidebar lila)
- [x] Frontend — Dashboard (stats)
- [x] Frontend — Actas (tabla + modal + preview)
- [x] Frontend — Grupos (tabla + modal)
- [ ] npm install (pendiente correr localmente)
- [ ] makemigrations + migrate
- [ ] Crear repo en GitHub
- [ ] Deploy en Render
