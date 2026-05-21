# CRUD de Estudiantes - Java Orientado a Objetos

## Descripción
Sistema completo de gestión de estudiantes con interfaz gráfica Swing. Implementa todas las operaciones CRUD con validaciones según las especificaciones.

## Archivos del Proyecto

### 1. **Estudiante.java**
Clase que representa el modelo de datos de un estudiante.
- Atributos: ID, Nombre, Edad
- Métodos: Getters, Setters, toString()

### 2. **GestorEstudiantes.java**
Clase que maneja la lógica de negocio.
- **Validaciones** (RF-05):
  - ID: Obligatorio y no repetido
  - Nombre: Obligatorio
  - Edad: Obligatoria, numérica y en rango válido (1-120)
- **Métodos CRUD**:
  - `agregarEstudiante()` (RF-01): Agrega un nuevo estudiante
  - `actualizarEstudiante()` (RF-02): Actualiza datos de un estudiante existente
  - `eliminarEstudiante()` (RF-03): Elimina un estudiante por ID
  - `obtenerTodos()` (RF-04): Retorna todos los estudiantes
  - `buscarPorId()`: Busca un estudiante por ID
  - `mostrarTodos()`: Retorna string formateado de todos los estudiantes

### 3. **FormularioEstudiante.java**
Clase que implementa la interfaz gráfica con Swing.
- **Campos de entrada**: ID, Nombre, Edad
- **Botones de acción**:
  - **Agregar**: Añade un nuevo estudiante
  - **Actualizar**: Modifica un estudiante existente
  - **Buscar**: Busca un estudiante por ID y carga sus datos
  - **Eliminar**: Elimina un estudiante
  - **Mostrar Todos**: Muestra todos los estudiantes en la tabla
  - **Limpiar**: Limpia los campos de entrada
- **Tabla**: Muestra todos los estudiantes registrados (ID, Nombre, Edad)
- **Área de Resultados**: Muestra mensajes de éxito, errores y confirmaciones

## Compilación y Ejecución

### Compilar los archivos:
```bash
javac Estudiante.java
javac GestorEstudiantes.java
javac FormularioEstudiante.java
```

### Ejecutar la aplicación:
```bash
java FormularioEstudiante
```

## Características

✅ Orientación a Objetos completa (3 clases cohesivas)
✅ Validación de datos según especificaciones
✅ Interfaz gráfica intuitiva con Swing
✅ Tabla dinámica que se actualiza en tiempo real
✅ Mensajes informativos de éxito y error
✅ Persistencia en memoria durante la sesión
✅ Búsqueda rápida de estudiantes por ID
✅ Funcionalidad completa de CRUD

## Requisitos Funcionales Implementados

- **RF-01**: ✅ Agregar nuevo estudiante con ID, Nombre y Edad
- **RF-02**: ✅ Actualizar datos de estudiante existente
- **RF-03**: ✅ Eliminar estudiante seleccionado
- **RF-04**: ✅ Mostrar todos los estudiantes registrados en tabla
- **RF-05**: ✅ Validar datos obligatorios y rangos válidos

## Validaciones

- ID: Debe ser único y obligatorio
- Nombre: Debe ser obligatorio (no vacío)
- Edad: Debe ser obligatoria, numérica e idealmente entre 1 y 120 años

## Ejemplo de Uso

1. Ingresa ID (ej: "001")
2. Ingresa Nombre (ej: "Juan Pérez")
3. Ingresa Edad (ej: "20")
4. Haz clic en "Agregar"
5. El estudiante aparecerá en la tabla
6. Puedes buscar, actualizar o eliminar según sea necesario
7. Haz clic en "Mostrar Todos" para ver la lista completa

---
**Autor**: Proyecto CRUD de Estudiantes
**Versión**: 1.0
