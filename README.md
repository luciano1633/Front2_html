# Videojuegos "Game On"

Pequeño proyecto estático (HTML/CSS/JS) que muestra tarjetas de videojuegos y añade interactividad sencilla.

Estructura relevante:

- `index.html` - Página principal con carousel y noticias.
- `Card.html` - Página de productos con tarjetas y botones "Agregar a la lista".
- `css/estilos.css` - Estilos principales (tema oscuro, variables visuales, .card-highlight, .floating-msg).
- `js/app.js` - Lógica de interactividad: banner, resaltado, efectos de imagen, formulario de contacto, manejo de botones "Agregar".

Cómo probar localmente

1. Abrir `index.html` o `Card.html` en un navegador moderno.
2. Verificar que los botones "Agregar a la lista" cambian a "Agregado" y muestran un mensaje flotante.
3. Usar la consola del navegador para ver errores JS (si los hay).

Buenas prácticas aplicadas

- Código JS organizado en funciones pequeñas y enfocadas.
- Uso de event delegation para los botones "Agregar" (mejora rendimiento y evita listeners por elemento).
- Comentarios y JSDoc en funciones principales para facilitar mantenimiento.
- Estilos visuales centralizados en `css/estilos.css`.
