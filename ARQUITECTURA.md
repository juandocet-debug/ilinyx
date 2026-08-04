# Arquitectura objetivo del ecosistema AGON + ILINYX

## Estado del documento

Este contrato inicia la modernizacion progresiva de AGON e ILINYX. La
reestructuracion debe conservar los datos, las migraciones aplicadas, los
identificadores y los contratos HTTP existentes hasta que exista una version
compatible y probada que los sustituya.

## Responsabilidades de los sistemas

- **AGON** es la fuente de identidad, roles, usuarios, cursos, sesiones,
  asistencia, practicas y gamificacion.
- **ILINYX** gestiona actas, firmas, grupos de trabajo, rubricas,
  calificaciones y entornos de seguimiento.
- La comunicacion entre backends usa credenciales de servicio y nunca expone
  secretos en el navegador.
- Durante la transicion cada sistema conserva su base de datos y su historial
  de migraciones.

## Arquitectura del backend

Cada contexto funcional se migrara gradualmente a un modulo vertical:

```text
backend/modulos/<modulo>/
|-- dominio/          # Entidades, reglas y puertos; sin Django ni HTTP
|-- aplicacion/       # Casos de uso y DTO de entrada/salida
`-- infraestructura/  # ORM Django, repositorios, serializers y controladores
```

Reglas de dependencia:

1. `dominio` no importa Django, DRF, almacenamiento ni clientes HTTP.
2. `aplicacion` depende del dominio y de sus puertos.
3. `infraestructura` implementa puertos y conecta Django/DRF.
4. Los controladores no contienen reglas de negocio.
5. Ninguna nueva unidad de codigo puede superar 500 lineas.
6. Las operaciones mutables deben quedar registradas por auditoria.

La migracion se realizara modulo por modulo. Las aplicaciones Django actuales
seguiran registradas mientras sus reemplazos entran en servicio; no se
renombraran tablas existentes ni se reescribiran migraciones aplicadas.

## Arquitectura del cliente

La interfaz objetivo usa TypeScript, React Native y Expo, con salida Expo Web
para Vercel y posibilidad de empaquetado movil. Cada modulo mantiene las capas:

```text
frontend/src/modules/<modulo>/
|-- domain/          # Tipos, entidades y contratos de repositorio
|-- application/     # Casos de uso del cliente
|-- infrastructure/  # API, persistencia y adaptadores
`-- presentation/    # Pantallas, componentes y hooks de interfaz
```

La presentacion no importa Axios directamente. Los tokens persistentes de una
aplicacion nativa se almacenan en SecureStore; el cliente web debe preferir
cookies seguras administradas por el servidor para credenciales renovables.

## Experiencia mobile-first

- El contenido se diseña primero para 360 px de ancho.
- Los objetivos tactiles miden al menos 44 x 44 px.
- La navegacion primaria en celular usa barra inferior o acciones accesibles.
- Las tablas se convierten en tarjetas o vistas resumidas en pantallas pequenas.
- Formularios extensos se dividen en pasos y conservan borradores seguros.
- La aplicacion web sera instalable como PWA y respetara areas seguras.

## Datos y compatibilidad

Antes de cualquier cambio de esquema se debe producir:

1. Inventario de tablas, columnas, restricciones e indices.
2. Conteo de filas y relaciones criticas.
3. Respaldo verificable y procedimiento de restauracion.
4. Migracion Django aditiva y reversible cuando sea posible.
5. Pruebas de compatibilidad de endpoints.
6. Comparacion de datos antes y despues del despliegue.

Queda prohibido editar o eliminar migraciones ya aplicadas. Los cambios
destructivos requieren aprobacion expresa y una ventana de mantenimiento.

## Integracion y autenticacion

AGON permanece como autoridad de identidad durante la primera etapa. ILINYX
valida la identidad y consulta datos academicos por contratos versionados. Las
llamadas de servicio deben usar una credencial rotatoria, limite de tiempo,
registro seguro de fallos y alcance minimo.

La evolucion recomendada es:

1. Mantener los endpoints actuales como compatibilidad.
2. Publicar contratos `/api/v1/` documentados.
3. Introducir una sesion unificada para el portal.
4. Retirar contratos antiguos solo despues de medir que no tienen consumidores.

## Seguridad obligatoria

- Secretos exclusivamente en variables de entorno.
- CORS con lista explicita de dominios en produccion.
- Rate limiting en autenticacion y operaciones sensibles.
- Autorizacion por rol y por pertenencia al recurso.
- Serializadores con campos explicitos y listas paginadas.
- Validacion de tipo real, extension y tamano de archivos.
- Auditoria de `POST`, `PUT`, `PATCH` y `DELETE` sin registrar secretos.
- Dependencias y configuracion revisadas en CI.

## Infraestructura objetivo

- Backend Django/DRF: Railway.
- Base de datos: PostgreSQL administrado, conservando inicialmente la instancia
  existente y sin copiar datos durante el primer despliegue.
- Frontend Expo Web: Vercel.
- Archivos existentes: Cloudinary durante la transicion.
- R2/S3: opcion posterior mediante adaptador y migracion verificada.

Los cambios de proveedor se hacen primero en un entorno de ensayo. Produccion
solo cambia despues de pruebas automatizadas, smoke tests y plan de reversion.

## Estrategia incremental

1. Baseline: inventario, pruebas de caracterizacion y controles de calidad.
2. Seguridad: secretos, CORS, permisos, paginacion y auditoria.
3. Backend: migracion vertical de cada modulo sin alterar contratos.
4. Cliente: shell Expo, sistema de diseno y pantallas mobile-first.
5. Integracion: sesion comun y portal de seleccion AGON/ILINYX.
6. Infraestructura: staging en Railway/Vercel y corte controlado.

Cada etapa debe poder desplegarse o revertirse de forma independiente.
