# Reglas de trabajo del monorepo

## Alcance permitido

Codex puede leer todo el repositorio para:

- comprender la arquitectura;
- revisar rutas y endpoints del backend;
- inspeccionar contratos de API;
- diagnosticar errores de integración;
- identificar si una falla proviene del frontend o del backend;
- sugerir correcciones para otras áreas.

## Alcance de escritura

Codex solo puede crear, modificar, mover o eliminar archivos dentro de:

moodle-enrollment-studio/

## Directorios de solo lectura

Los siguientes directorios son estrictamente de solo lectura:

- backend/
- commercial-website/
- management-dashboard/
- packages/
- shared/

No modificar archivos fuera de moodle-enrollment-studio/.

## Errores provenientes del backend

Cuando una petición del frontend falle:

1. Revisar primero la llamada realizada desde moodle-enrollment-studio/.
2. Compararla con la ruta, método HTTP, parámetros, payload y respuesta definidos en backend/.
3. Determinar si la falla proviene del frontend, del backend o de una incompatibilidad entre ambos.
4. Corregir directamente solo si el problema está en moodle-enrollment-studio/.
5. Si el problema está en el backend, no modificarlo.
6. Explicar:
   - archivo donde se encuentra el problema;
   - causa probable;
   - corrección recomendada;
   - fragmento de código sugerido para que lo aplique el responsable del backend.

## Seguridad

Antes de terminar cada tarea:

- mostrar los archivos modificados;
- confirmar que todos están dentro de moodle-enrollment-studio/;
- ejecutar las pruebas, lint o build disponibles del frontend;
- no cambiar variables de entorno, dependencias globales ni configuración del monorepo sin aprobación.