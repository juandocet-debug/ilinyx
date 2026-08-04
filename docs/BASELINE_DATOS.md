# Baseline de datos de ILINYX

## Objetivo

Este inventario identifica los agregados que no pueden perder datos durante la
reestructuracion. No sustituye un respaldo de produccion ni afirma conteos de
filas: esos valores se obtendran directamente de la base autorizada antes de
cualquier despliegue.

## Aplicaciones y modelos existentes

| Aplicacion | Modelos persistentes | Responsabilidad |
|---|---|---|
| `actas` | `Documento`, `Acta`, `ActaReunion`, `FirmaUsuario` | Documentos, reuniones, evidencias y firmas |
| `grupos` | `Grupo` | Cohortes vinculadas con AGON |
| `evaluaciones` | `Rubrica`, `Criterio`, `NivelCriterio`, `EvaluacionGrupo`, `Calificacion` | Instrumentos y resultados de evaluacion |
| `entornos` | `Entorno`, `Corte`, `Entregable` | Seguimiento y entregables por periodo |

## Referencias externas criticas

- Los identificadores de usuarios, docentes y evaluadores pertenecen a AGON.
- Los grupos y cursos pueden conservar identificadores originados en AGON.
- PDF, fotografias y otras evidencias pueden estar almacenados en Cloudinary.
- `ILINYX_API_KEY` autentica llamadas servidor a servidor.

Estas referencias no deben convertirse en claves foraneas locales sin un plan
de reconciliacion y una migracion de datos aprobada.

## Historial de migraciones protegido

- `actas`: `0001` a `0004`.
- `grupos`: `0001`.
- `evaluaciones`: `0001` a `0004`.
- `entornos`: `0001`.

Las migraciones existentes son inmutables. La arquitectura limpia se introduce
primero alrededor de los modelos actuales; cualquier evolucion del esquema se
realiza con una migracion nueva.

## Evidencia requerida antes del corte

Para desarrollo, staging y produccion se debe registrar de forma separada:

- motor, version y nombre logico de la base;
- ultima migracion aplicada por aplicacion;
- conteo de filas por tabla;
- conteo de archivos referenciados y accesibles;
- restricciones e indices;
- registros huerfanos o referencias AGON no resolubles;
- fecha, ubicacion y checksum del respaldo;
- resultado de una restauracion de ensayo.

## Criterios de aceptacion

Una etapa de migracion solo se acepta cuando:

1. Los conteos esperados coinciden antes y despues.
2. Los identificadores historicos se conservan.
3. Las relaciones y referencias AGON siguen resolviendo.
4. Los archivos historicos siguen disponibles.
5. Las rutas publicadas mantienen respuestas compatibles.
6. Existe una reversion ensayada para el despliegue.
