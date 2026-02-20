#!/usr/bin/env bash
# Exit on error
set -o errexit

# 1. Instalar dependencias de Python (Backend Ilinyx)
pip install -r backend/requirements.txt

# 2. Instalar y construir Frontend React
echo "Construyendo Frontend Ilinyx..."
cd frontend
npm install
npm run build
cd ..

# 3. Mover index.html al directorio de templates de Django
echo "Moviendo index.html a templates..."
mkdir -p backend/templates
cp frontend/dist/index.html backend/templates/index.html

# 4. Recolectar estáticos
echo "Recolectando estáticos..."
python backend/manage.py collectstatic --no-input

# 5. Ejecutar migraciones
echo "Ejecutando migraciones..."
python backend/manage.py migrate
