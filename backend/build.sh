#!/usr/bin/env bash
# Estricto: cualquier error detiene la ejecución
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
