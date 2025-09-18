/**
 * Videojuegos Game On - Lógica principal
 *
 * Estructura:
 * - Accesibilidad y modales
 * - Carrito de compras
 * - Carga y renderizado de productos
 * - Utilidades de UI (banner, resaltado, efectos, formularios)
 * - Helpers
 */

// ========================
// Accesibilidad: Foco automático en modales
// ========================
document.addEventListener('DOMContentLoaded', () => {
    // Foco en botón aceptar al abrir modal de compra
    const modalCompra = document.getElementById('modalCompra');
    if (modalCompra) {
        modalCompra.addEventListener('shown.bs.modal', () => {
            const btn = document.getElementById('aceptarCompraBtn');
            if (btn) btn.focus();
        });
    }
    // Foco en botón cancelar al abrir modal de eliminar
    const modalEliminar = document.getElementById('modalEliminar');
    if (modalEliminar) {
        modalEliminar.addEventListener('shown.bs.modal', () => {
            const btn = document.getElementById('cancelarEliminarBtn');
            if (btn) btn.focus();
        });
    }
});

// ========================
// Carrito de compras
// ========================
// const carrito = {}; // Eliminado duplicado
// let idPendienteEliminar = null; // Eliminado duplicado

/**
 * Agrega un producto al carrito o incrementa su cantidad.
 * @param {Object} producto - Producto a agregar
 */
function agregarAlCarrito(producto) {
    if (carrito[producto.id]) {
        carrito[producto.id].cantidad++;
    } else {
        carrito[producto.id] = { ...producto, cantidad: 1 };
    }
    renderizarCarrito();
}

/**
 * Renderiza el resumen del carrito en el área #carrito-area
 * Incluye botón para finalizar compra
 */
function renderizarCarrito() {
    const area = document.getElementById('carrito-area');
    if (!area) return;

    const items = Object.values(carrito);
    if (items.length === 0) {
        area.innerHTML = '<div class="alert alert-secondary">El carrito está vacío.</div>';
        return;
    }

    let total = 0;
    let html = `<div class="card p-3 mb-4" style="background: linear-gradient(180deg, rgba(24,24,24,0.98), rgba(24,24,24,0.92)); border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.45); border: 1px solid #222; color: #e6eef6;">
    <h4 class="mb-3" style="color:#4fc3f7;">Carrito de compras</h4>
    <div class="table-responsive">
    <table class="table table-sm align-middle mb-0 carrito-table-rounded" style="color:#cfeaf6; background:#fff; border-radius:12px; overflow:hidden;">
    <thead>
    <tr style="color:#4fc3f7;">
        <th>Producto</th>
        <th>Cantidad</th>
        <th>Precio</th>
        <th>Subtotal</th>
        <th></th>
    </tr>
    </thead>
    <tbody>`;
    items.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        html += `<tr>
            <td style="color:#4fc3f7; font-weight:600;">${item.nombre}</td>
            <td>${item.cantidad}</td>
            <td>$${item.precio.toFixed(2)}</td>
            <td>$${subtotal.toFixed(2)}</td>
            <td><button class="btn btn-sm btn-danger" style="border-radius:6px; font-weight:600;" data-remove-id="${item.id}">Quitar</button></td>
        </tr>`;
    });
    html += `</tbody></table></div>`;
    html += `<div class="fw-bold text-end mt-3" style="color:#9fe7ff; font-size:1.1rem;">Total: $${total.toFixed(2)}</div>`;
    html += `<div class="text-end mt-3"><button class="btn btn-success" style="border-radius:8px; font-weight:700;" id="finalizarCompraBtn">Finalizar compra</button></div>`;
    html += `</div>`;
    area.innerHTML = html;
}

// Manejo de eventos para el carrito y modales
document.addEventListener('click', (e) => {
    // Eliminar producto (abre modal)
    const btnRemove = e.target.closest('button[data-remove-id]');
    if (btnRemove) {
        idPendienteEliminar = btnRemove.getAttribute('data-remove-id');
        mostrarModalEliminar();
        return;
    }
    // Confirmar eliminación
    if (e.target && e.target.id === 'confirmarEliminarBtn') {
        if (idPendienteEliminar && carrito[idPendienteEliminar]) {
            delete carrito[idPendienteEliminar];
            renderizarCarrito();
            mostrarMensajeModal('Producto eliminado del carrito.');
        }
        idPendienteEliminar = null;
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEliminar'));
        if (modal) modal.hide();
        return;
    }
    // Finalizar compra
    if (e.target && e.target.id === 'finalizarCompraBtn') {
        mostrarModalCompra();
        return;
    }
});

/**
 * Muestra el modal de confirmación de compra y vacía el carrito al cerrar
 */
function mostrarModalCompra() {
    const modal = new bootstrap.Modal(document.getElementById('modalCompra'));
    modal.show();
    document.getElementById('modalCompra').addEventListener('hidden.bs.modal', () => {
        for (const id in carrito) delete carrito[id];
        renderizarCarrito();
    }, { once: true });
}

/**
 * Muestra el modal de confirmación de eliminación
 */
function mostrarModalEliminar() {
    const modal = new bootstrap.Modal(document.getElementById('modalEliminar'));
    modal.show();
}

/**
 * Muestra mensaje de confirmación en el modal de eliminación
 */
function mostrarMensajeModal(mensaje) {
    const body = document.getElementById('modalEliminarBody');
    if (body) {
        body.textContent = mensaje;
        setTimeout(() => {
            body.textContent = '¿Estás seguro de que deseas eliminar este producto del carrito?';
        }, 1500);
    }
}

// ========================
// Carga, renderizado y búsqueda de productos
// ========================
// let productosCargados = []; // Eliminado duplicado

/**
 * Carga productos desde un archivo JSON local usando Fetch API.
 * Renderiza los productos en el contenedor #productos-lista.
 * Si hay término de búsqueda, filtra los productos.
 * @param {string} [busqueda] - Término de búsqueda opcional
 */
function cargarYRenderizarProductos(busqueda = '') {
    const contenedor = document.getElementById('productos-lista');
    if (!contenedor) return;
    // Si ya se cargaron productos, solo filtrar y renderizar
    if (productosCargados.length > 0) {
        renderizarProductos(busqueda);
        return;
    }
    fetch('data/productos.json')
        .then(res => {
            if (!res.ok) throw new Error('No se pudo cargar la lista de productos.');
            return res.json();
        })
        .then(productos => {
            productosCargados = productos;
            renderizarProductos(busqueda);
        })
        .catch(err => {
            contenedor.innerHTML = `<div class="alert alert-danger">No se pudieron cargar los productos. Intenta más tarde.</div>`;
            console.error('Error al cargar productos:', err);
        });
}

/**
 * Renderiza productos en el contenedor, filtrando por búsqueda si aplica
 * @param {string} [busqueda]
 */
function renderizarProductos(busqueda = '') {
    const contenedor = document.getElementById('productos-lista');
    if (!contenedor) return;
    let productos = productosCargados;
    if (busqueda) {
        const termino = busqueda.trim().toLowerCase();
        productos = productos.filter(p => p.nombre.toLowerCase().includes(termino));
    }
    contenedor.innerHTML = '';
    if (productos.length === 0) {
        contenedor.innerHTML = `<div class="alert alert-warning">No se encontraron productos para "${busqueda}".</div>`;
        return;
    }
    productos.forEach(producto => {
        contenedor.appendChild(crearCardProducto(producto));
    });
}

// Evento submit para el formulario de búsqueda de productos
document.addEventListener('DOMContentLoaded', () => {
    const formBusqueda = document.getElementById('form-busqueda');
    if (formBusqueda) {
        formBusqueda.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = document.getElementById('input-busqueda');
            const valor = input ? input.value : '';
            cargarYRenderizarProductos(valor);
        });
    }
});

/**
 * Crea un elemento de tarjeta de producto con Bootstrap.
 * @param {Object} producto - Objeto producto con id, nombre, imagen, precio, descripcion
 * @returns {HTMLElement}
 */
function crearCardProducto(producto) {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';
    col.innerHTML = `
        <div class="card h-100">
            <img src="${producto.imagen}" class="card-img-top" alt="Portada de ${producto.nombre}" />
            <div class="card-body">
                <h5 class="card-title">${producto.nombre}</h5>
                <p class="card-text">${producto.descripcion}</p>
                <p class="card-text fw-bold">$${producto.precio.toFixed(2)}</p>
                <button type="button" class="btn btn-primary" data-producto-id="${producto.id}" aria-pressed="false">Agregar al carrito</button>
            </div>
        </div>
    `;
    return col;
}

// ========================
// Inicialización global de la app
// ========================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    // Si estamos en Card.html, cargar productos
    if (document.getElementById('productos-lista')) {
        cargarYRenderizarProductos();
    }
});

/**
 * Inicializa las funciones principales de la aplicación.
 * Solo ejecuta lo necesario según la página.
 */
function initApp() {
    addPromoBanner(); // Solo en index.html
    addHighlightToggleButton();
    addImageHoverEffects();
    addContactForm();
    initAddToListDelegation();
}

/**
 * Crea y añade un banner promocional dinámico solo en index.html
 */
function addPromoBanner() {
    const isIndex = location.pathname.endsWith('index.html') || location.pathname === '/' || location.pathname === '';
    if (!isIndex) return;
    const portada = document.getElementById('Portada');
    const banner = document.createElement('section');
    banner.id = 'promoBanner';
    banner.className = 'container my-3';
    banner.innerHTML = `
        <div class="alert alert-info d-flex justify-content-between align-items-center" role="alert">
            <div>
                <strong>Oferta del día:</strong> Suscríbete a "Game on" y recibe noticias exclusivas en lanzamientos.
            </div>
            <div>
                <button id="closeBanner" class="btn btn-sm btn-outline-secondary">Cerrar</button>
            </div>
        </div>
    `;
    if (portada && portada.parentNode) portada.parentNode.insertBefore(banner, portada);
    else document.body.insertBefore(banner, document.body.firstChild);
    // Evento click para cerrar el banner
    banner.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'closeBanner') banner.remove();
    });
}

/**
 * Añade un botón que alterna un estilo resaltado en las tarjetas (click)
 */
function addHighlightToggleButton() {
    const main = document.querySelector('main');
    if (!main) return;
    const container = document.createElement('div');
    container.className = 'text-center my-3';
    const btn = document.createElement('button');
    btn.className = 'btn btn-warning';
    btn.id = 'toggleHighlightBtn';
    btn.textContent = 'Resaltar tarjetas';
    container.appendChild(btn);
    main.parentNode.insertBefore(container, main);
    btn.addEventListener('click', () => {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => card.classList.toggle('card-highlight'));
        btn.textContent = btn.textContent === 'Resaltar tarjetas' ? 'Quitar resaltado' : 'Resaltar tarjetas';
    });
}

/**
 * Agrega efectos de mouseover a las imágenes de las tarjetas (zoom y sombra)
 */
function addImageHoverEffects() {
    const images = document.querySelectorAll('.card-img-top, .card img');
    images.forEach(img => {
        if (img.dataset.hasHoverListener) return;
        img.dataset.hasHoverListener = 'true';
        img.addEventListener('mouseover', () => {
            img.style.transform = 'scale(1.05)';
            img.style.transition = 'transform 200ms ease';
            img.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
        });
        img.addEventListener('mouseout', () => {
            img.style.transform = 'scale(1)';
            img.style.boxShadow = '';
        });
        img.addEventListener('click', () => {
            const card = img.closest('.card');
            const titleEl = card ? card.querySelector('.card-title') : null;
            const title = titleEl ? titleEl.textContent : 'Detalles del juego';
            showFloatingMessage(title, img);
        });
    });
}

/**
 * Crea un pequeño formulario de contacto dinámicamente y lo añade al final del main
 */
function addContactForm() {
    // Solo agregar el formulario si NO estamos en Contacto.html y no existe ya un #contactForm
    const isContacto = location.pathname.endsWith('Contacto.html');
    if (isContacto) return;
    if (document.getElementById('contactForm')) return;
    const main = document.querySelector('main');
    if (!main) return;
    const section = document.createElement('section');
    section.className = 'container my-4';
    section.id = 'contactSection';
    section.innerHTML = `
        <div class="card p-3">
            <h5>Contacto / Suscripción</h5>
            <form id="contactForm">
                <div class="mb-2">
                    <label for="name" class="form-label">Nombre</label>
                    <input type="text" id="name" name="name" class="form-control" required>
                </div>
                <div class="mb-2">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" id="email" name="email" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary">Enviar</button>
                <div id="formFeedback" class="mt-2" aria-live="polite"></div>
            </form>
        </div>
    `;
    main.parentNode.insertBefore(section, main.nextSibling);
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormSubmit(form);
    });
}

/**
 * Valida el formulario de contacto y muestra feedback
 */
function handleFormSubmit(form) {
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const feedback = form.querySelector('#formFeedback');
    if (name.length < 2) {
        feedback.innerHTML = '<div class="alert alert-danger p-2">Por favor ingresa un nombre válido.</div>';
        return;
    }
    if (!isValidEmail(email)) {
        feedback.innerHTML = '<div class="alert alert-danger p-2">Por favor ingresa un email válido.</div>';
        return;
    }
    feedback.innerHTML = '<div class="alert alert-success p-2">Gracias, tu mensaje ha sido enviado (simulado).</div>';
    form.reset();
}

/**
 * Comprueba si un email tiene formato válido (simple)
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Muestra un mensaje flotante cerca de un elemento (usado por click en imágenes)
 * @param {string} text - Texto a mostrar
 * @param {Element} anchorEl - Elemento DOM cerca del cual posicionar el mensaje
 * @param {number} [duration=2000] - Tiempo en ms que el mensaje permanece visible
 */
function showFloatingMessage(text, anchorEl, duration = 2000) {
    const msg = document.createElement('div');
    msg.className = 'floating-msg bg-dark text-white p-2 rounded-1';
    msg.style.position = 'absolute';
    msg.style.zIndex = 9999;
    msg.textContent = text;
    document.body.appendChild(msg);
    const rect = anchorEl.getBoundingClientRect();
    const left = Math.max(8, rect.left + window.scrollX + 10);
    const top = Math.max(8, rect.top + window.scrollY - 30);
    msg.style.left = `${left}px`;
    msg.style.top = `${top}px`;
    setTimeout(() => msg.remove(), duration);
}

/**
 * Inicializa botones "Agregar a la lista": al hacer click muestran mensaje "Agregado"
 */
function initAddToListDelegation() {
    const root = document.querySelector('main') || document.body;
    if (!root) return;
    root.addEventListener('click', (e) => {
        const btn = e.target.closest('button.btn');
        if (!btn) return;
        // Solo gestionar botones "Agregar al carrito" en Card.html
        if (btn.hasAttribute('data-producto-id')) {
            e.preventDefault();
            markButtonAdded(btn);
            const card = btn.closest('.card');
            const titleEl = card ? card.querySelector('.card-title') : null;
            const title = titleEl ? titleEl.textContent.trim() : 'Producto';
            showFloatingMessage(`Agregado al carrito: ${title}`, btn);
            // Obtener datos del producto desde el DOM
            const id = parseInt(btn.getAttribute('data-producto-id'));
            const precio = parseFloat(card.querySelector('.card-text.fw-bold').textContent.replace(/[^\d.]/g, ''));
            const nombre = title;
            const imagen = card.querySelector('img.card-img-top').getAttribute('src');
            const descripcion = card.querySelector('.card-text:not(.fw-bold)').textContent;
            agregarAlCarrito({ id, nombre, precio, imagen, descripcion });
            if (isAutoResetEnabled()) setTimeout(() => revertButton(btn), 4000);
            return;
        }
        // Compatibilidad con botones "Agregar a la lista" de otras páginas
        const txt = (btn.textContent || '').trim().toLowerCase();
        if (!txt.includes('agregar')) return;
        e.preventDefault();
        markButtonAdded(btn);
        const card = btn.closest('.card');
        const titleEl = card ? card.querySelector('.card-title') : null;
        const title = titleEl ? titleEl.textContent.trim() : 'Elemento';
        showFloatingMessage(`Agregado a la lista: ${title}`, btn);
        if (isAutoResetEnabled()) setTimeout(() => revertButton(btn), 4000);
    });
}

/** Marca visualmente un botón como agregado */
function markButtonAdded(btn) {
    btn.textContent = 'Agregado';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-success');
    btn.setAttribute('aria-pressed', 'true');
    btn.tabIndex = -1;
}

/** Revertir botón a estado original */
function revertButton(btn) {
    if (!btn) return;
    btn.textContent = 'Agregar a la lista';
    btn.classList.remove('btn-success');
    btn.classList.add('btn-primary');
    btn.setAttribute('aria-pressed', 'false');
    btn.tabIndex = 0;
}

// Helpers de configuración
function isPersistEnabled() { return false; }
function isAutoResetEnabled() { return true; }
// Mejorar accesibilidad: foco automático en modales
document.addEventListener('DOMContentLoaded', () => {
    // Foco en botón aceptar al abrir modal de compra
    const modalCompra = document.getElementById('modalCompra');
    if (modalCompra) {
        modalCompra.addEventListener('shown.bs.modal', () => {
            const btn = document.getElementById('aceptarCompraBtn');
            if (btn) btn.focus();
        });
    }
    // Foco en botón cancelar al abrir modal de eliminar
    const modalEliminar = document.getElementById('modalEliminar');
    if (modalEliminar) {
        modalEliminar.addEventListener('shown.bs.modal', () => {
            const btn = document.getElementById('cancelarEliminarBtn');
            if (btn) btn.focus();
        });
    }
});
// ================= CARRITO DE COMPRAS =================
const carrito = {};

/**
 * Agrega un producto al carrito o incrementa su cantidad.
 * @param {Object} producto - Producto a agregar
 */
function agregarAlCarrito(producto) {
    if (carrito[producto.id]) {
        carrito[producto.id].cantidad++;
    } else {
        carrito[producto.id] = { ...producto, cantidad: 1 };
    }
    renderizarCarrito();
}


/**
 * Renderiza el resumen del carrito en el área #carrito-area
 * Incluye botón para finalizar compra
 */
function renderizarCarrito() {
    const area = document.getElementById('carrito-area');
    if (!area) return;

    const items = Object.values(carrito);
    if (items.length === 0) {
        area.innerHTML = '<div class="alert alert-secondary">El carrito está vacío.</div>';
        return;
    }

    let total = 0;
    let html = `<div class="card p-3 mb-4" style="background: linear-gradient(180deg, rgba(24,24,24,0.98), rgba(24,24,24,0.92)); border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.45); border: 1px solid #222; color: #e6eef6;">
    <h4 class="mb-3" style="color:#4fc3f7;">Carrito de compras</h4>
    <div class="table-responsive">
    <table class="table table-sm align-middle mb-0 carrito-table-rounded" style="color:#cfeaf6; background:#fff; border-radius:12px; overflow:hidden;">
    <thead>
    <tr style="color:#4fc3f7;">
        <th>Producto</th>
        <th>Cantidad</th>
        <th>Precio</th>
        <th>Subtotal</th>
        <th></th>
    </tr>
    </thead>
    <tbody>`;
    items.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        html += `<tr>
            <td style="color:#4fc3f7; font-weight:600;">${item.nombre}</td>
            <td>${item.cantidad}</td>
            <td>$${item.precio.toFixed(2)}</td>
            <td>$${subtotal.toFixed(2)}</td>
            <td><button class="btn btn-sm btn-danger" style="border-radius:6px; font-weight:600;" data-remove-id="${item.id}">Quitar</button></td>
        </tr>`;
    });
    html += `</tbody></table></div>`;
    html += `<div class="fw-bold text-end mt-3" style="color:#9fe7ff; font-size:1.1rem;">Total: $${total.toFixed(2)}</div>`;
    html += `<div class="text-end mt-3"><button class="btn btn-success" style="border-radius:8px; font-weight:700;" id="finalizarCompraBtn">Finalizar compra</button></div>`;
    html += `</div>`;
    area.innerHTML = html;
}


// ========== MODAL DE BOOTSTRAP ==========
let idPendienteEliminar = null;

// Evento para quitar productos del carrito (con confirmación modal)
document.addEventListener('click', (e) => {
    // Eliminar producto
    const btnRemove = e.target.closest('button[data-remove-id]');
    if (btnRemove) {
        idPendienteEliminar = btnRemove.getAttribute('data-remove-id');
        mostrarModalEliminar();
        return;
    }

    // Confirmar eliminación
    if (e.target && e.target.id === 'confirmarEliminarBtn') {
        if (idPendienteEliminar && carrito[idPendienteEliminar]) {
            delete carrito[idPendienteEliminar];
            renderizarCarrito();
            mostrarMensajeModal('Producto eliminado del carrito.');
        }
        idPendienteEliminar = null;
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEliminar'));
        if (modal) modal.hide();
        return;
    }

    // Finalizar compra
    if (e.target && e.target.id === 'finalizarCompraBtn') {
        mostrarModalCompra();
        return;
    }
});

// Mostrar modal de confirmación de compra
function mostrarModalCompra() {
    const modal = new bootstrap.Modal(document.getElementById('modalCompra'));
    modal.show();
    // Vaciar carrito al cerrar modal
    document.getElementById('modalCompra').addEventListener('hidden.bs.modal', () => {
        for (const id in carrito) delete carrito[id];
        renderizarCarrito();
    }, { once: true });
}

// Mostrar modal de confirmación de eliminación
function mostrarModalEliminar() {
    const modal = new bootstrap.Modal(document.getElementById('modalEliminar'));
    modal.show();
}

// Mostrar mensaje de confirmación en el modal de eliminación
function mostrarMensajeModal(mensaje) {
    const body = document.getElementById('modalEliminarBody');
    if (body) {
        body.textContent = mensaje;
        setTimeout(() => {
            body.textContent = '¿Estás seguro de que deseas eliminar este producto del carrito?';
        }, 1500);
    }
}
// ================= CARGA, RENDERIZADO Y BÚSQUEDA DE PRODUCTOS =================
let productosCargados = [];

/**
 * Carga productos desde un archivo JSON local usando Fetch API.
 * Renderiza los productos en el contenedor #productos-lista.
 * Muestra mensaje de error si la carga falla.
 * Si hay término de búsqueda, filtra los productos.
 * @param {string} [busqueda] - Término de búsqueda opcional
 */
function cargarYRenderizarProductos(busqueda = '') {
    const contenedor = document.getElementById('productos-lista');
    if (!contenedor) return;

    // Si ya se cargaron productos, solo filtrar y renderizar
    if (productosCargados.length > 0) {
        renderizarProductos(busqueda);
        return;
    }

    fetch('data/productos.json')
        .then(res => {
            if (!res.ok) throw new Error('No se pudo cargar la lista de productos.');
            return res.json();
        })
        .then(productos => {
            productosCargados = productos;
            renderizarProductos(busqueda);
        })
        .catch(err => {
            contenedor.innerHTML = `<div class=\"alert alert-danger\">No se pudieron cargar los productos. Intenta más tarde.</div>`;
            console.error('Error al cargar productos:', err);
        });
}

/**
 * Renderiza productos en el contenedor, filtrando por búsqueda si aplica
 * @param {string} [busqueda]
 */
function renderizarProductos(busqueda = '') {
    const contenedor = document.getElementById('productos-lista');
    if (!contenedor) return;
    let productos = productosCargados;
    if (busqueda) {
        const termino = busqueda.trim().toLowerCase();
        productos = productos.filter(p => p.nombre.toLowerCase().includes(termino));
    }
    contenedor.innerHTML = '';
    if (productos.length === 0) {
        contenedor.innerHTML = `<div class=\"alert alert-warning\">No se encontraron productos para "${busqueda}".</div>`;
        return;
    }
    productos.forEach(producto => {
        contenedor.appendChild(crearCardProducto(producto));
    });
}

// Evento submit para el formulario de búsqueda
document.addEventListener('DOMContentLoaded', () => {
    const formBusqueda = document.getElementById('form-busqueda');
    if (formBusqueda) {
        formBusqueda.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = document.getElementById('input-busqueda');
            const valor = input ? input.value : '';
            cargarYRenderizarProductos(valor);
        });
    }
});

/**
 * Crea un elemento de tarjeta de producto con Bootstrap.
 * @param {Object} producto - Objeto producto con id, nombre, imagen, precio, descripcion
 * @returns {HTMLElement}
 */
function crearCardProducto(producto) {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';

    col.innerHTML = `
        <div class="card h-100">
            <img src="${producto.imagen}" class="card-img-top" alt="Portada de ${producto.nombre}" />
            <div class="card-body">
                <h5 class="card-title">${producto.nombre}</h5>
                <p class="card-text">${producto.descripcion}</p>
                <p class="card-text fw-bold">$${producto.precio.toFixed(2)}</p>
                <button type="button" class="btn btn-primary" data-producto-id="${producto.id}" aria-pressed="false">Agregar al carrito</button>
            </div>
        </div>
    `;
    return col;
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    // Si estamos en Card.html, cargar productos
    if (document.getElementById('productos-lista')) {
        cargarYRenderizarProductos();
    }
});

/** Inicializa las funciones principales de la aplicación. */
function initApp() {

    // Inicializaciones ordenadas
    addPromoBanner();
    addHighlightToggleButton();
    addImageHoverEffects();
    addContactForm();
    initAddToListDelegation();
}

/** Crea y añade un banner promocional dinámico antes del elemento #Portada o al inicio del body */
function addPromoBanner() {
    
    const isIndex = location.pathname.endsWith('index.html') || location.pathname === '/' || location.pathname === '';
    if (!isIndex) return;

    const portada = document.getElementById('Portada');
    const banner = document.createElement('section');
    banner.id = 'promoBanner';
    banner.className = 'container my-3';
    banner.innerHTML = `
        <div class="alert alert-info d-flex justify-content-between align-items-center" role="alert">
            <div>
                <strong>Oferta del día:</strong> Suscríbete a "Game on" y recibe noticias exclusivas en lanzamientos.
            </div>
            <div>
                <button id="closeBanner" class="btn btn-sm btn-outline-secondary">Cerrar</button>
            </div>
        </div>
    `;

    if (portada && portada.parentNode) portada.parentNode.insertBefore(banner, portada);
    else document.body.insertBefore(banner, document.body.firstChild);

    // Evento click para cerrar el banner (delegado mínimamente)
    banner.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'closeBanner') banner.remove();
    });
}

/** Añade un botón que alterna un estilo resaltado en las tarjetas (click) */
function addHighlightToggleButton() {
    const main = document.querySelector('main');
    if (!main) return;

    const container = document.createElement('div');
    container.className = 'text-center my-3';

    const btn = document.createElement('button');
    btn.className = 'btn btn-warning';
    btn.id = 'toggleHighlightBtn';
    btn.textContent = 'Resaltar tarjetas';

    container.appendChild(btn);
    main.parentNode.insertBefore(container, main);

    btn.addEventListener('click', () => {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => card.classList.toggle('card-highlight'));
        btn.textContent = btn.textContent === 'Resaltar tarjetas' ? 'Quitar resaltado' : 'Resaltar tarjetas';
    });
}

/** Agrega efectos de mouseover a las imágenes de las tarjetas (zoom y sombra) */
function addImageHoverEffects() {
    const images = document.querySelectorAll('.card-img-top, .card img');
    images.forEach(img => {
        if (img.dataset.hasHoverListener) return; 
        img.dataset.hasHoverListener = 'true';

        img.addEventListener('mouseover', () => {
            img.style.transform = 'scale(1.05)';
            img.style.transition = 'transform 200ms ease';
            img.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
        });

        img.addEventListener('mouseout', () => {
            img.style.transform = 'scale(1)';
            img.style.boxShadow = '';
        });

        img.addEventListener('click', () => {
            const card = img.closest('.card');
            const titleEl = card ? card.querySelector('.card-title') : null;
            const title = titleEl ? titleEl.textContent : 'Detalles del juego';
            showFloatingMessage(title, img);
        });
    });
}

/** Crea un pequeño formulario de contacto dinámicamente y lo añade al final del main */
function addContactForm() {
    const main = document.querySelector('main');
    if (!main) return;

    const section = document.createElement('section');
    section.className = 'container my-4';
    section.id = 'contactSection';

    section.innerHTML = `
        <div class="card p-3">
            <h5>Contacto / Suscripción</h5>
            <form id="contactForm">
                <div class="mb-2">
                    <label for="name" class="form-label">Nombre</label>
                    <input type="text" id="name" name="name" class="form-control" required>
                </div>
                <div class="mb-2">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" id="email" name="email" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary">Enviar</button>
                <div id="formFeedback" class="mt-2" aria-live="polite"></div>
            </form>
        </div>
    `;

    main.parentNode.insertBefore(section, main.nextSibling);

    const form = document.getElementById('contactForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormSubmit(form);
    });
}

/** Valida el formulario y muestra feedback */
function handleFormSubmit(form) {
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const feedback = form.querySelector('#formFeedback');

    if (name.length < 2) {
        feedback.innerHTML = '<div class="alert alert-danger p-2">Por favor ingresa un nombre válido.</div>';
        return;
    }
    if (!isValidEmail(email)) {
        feedback.innerHTML = '<div class="alert alert-danger p-2">Por favor ingresa un email válido.</div>';
        return;
    }

    // Simular envío exitoso
    feedback.innerHTML = '<div class="alert alert-success p-2">Gracias, tu mensaje ha sido enviado (simulado).</div>';
    form.reset();
}

/** Comprueba si un email tiene formato válido (simple) */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Muestra un mensaje flotante cerca de un elemento (usado por click en imágenes) */
/**
 * @param {string} text - Texto a mostrar
 * @param {Element} anchorEl - Elemento DOM cerca del cual posicionar el mensaje
 * @param {number} [duration=2000] - Tiempo en ms que el mensaje permanece visible
 */
function showFloatingMessage(text, anchorEl, duration = 2000) {
    const msg = document.createElement('div');
    msg.className = 'floating-msg bg-dark text-white p-2 rounded-1';
    msg.style.position = 'absolute';
    msg.style.zIndex = 9999;
    msg.textContent = text;

    document.body.appendChild(msg);

    // Posicionar cerca del elemento (mantener dentro de la ventana)
    const rect = anchorEl.getBoundingClientRect();
    const left = Math.max(8, rect.left + window.scrollX + 10);
    const top = Math.max(8, rect.top + window.scrollY - 30);
    msg.style.left = `${left}px`;
    msg.style.top = `${top}px`;

    setTimeout(() => msg.remove(), duration);
}


/** Inicializa botones "Agregar a la lista": al hacer click muestran mensaje "Agregado" */
function initAddToListDelegation() {
    const root = document.querySelector('main') || document.body;
    if (!root) return;

    root.addEventListener('click', (e) => {
        const btn = e.target.closest('button.btn');
        if (!btn) return;

        // Solo gestionar botones "Agregar al carrito" en Card.html
        if (btn.hasAttribute('data-producto-id')) {
            e.preventDefault();
            markButtonAdded(btn);
            const card = btn.closest('.card');
            const titleEl = card ? card.querySelector('.card-title') : null;
            const title = titleEl ? titleEl.textContent.trim() : 'Producto';
            showFloatingMessage(`Agregado al carrito: ${title}`, btn);

            // Obtener datos del producto desde el DOM
            const id = parseInt(btn.getAttribute('data-producto-id'));
            const precio = parseFloat(card.querySelector('.card-text.fw-bold').textContent.replace(/[^\d.]/g, ''));
            const nombre = title;
            const imagen = card.querySelector('img.card-img-top').getAttribute('src');
            const descripcion = card.querySelector('.card-text:not(.fw-bold)').textContent;
            agregarAlCarrito({ id, nombre, precio, imagen, descripcion });

            if (isAutoResetEnabled()) setTimeout(() => revertButton(btn), 4000);
            return;
        }

        // Compatibilidad con botones "Agregar a la lista" de otras páginas
        const txt = (btn.textContent || '').trim().toLowerCase();
        if (!txt.includes('agregar')) return;

        e.preventDefault();
        markButtonAdded(btn);
        const card = btn.closest('.card');
        const titleEl = card ? card.querySelector('.card-title') : null;
        const title = titleEl ? titleEl.textContent.trim() : 'Elemento';
        showFloatingMessage(`Agregado a la lista: ${title}`, btn);
        if (isAutoResetEnabled()) setTimeout(() => revertButton(btn), 4000);
    });
}

/** Marca visualmente un botón como agregado */
function markButtonAdded(btn) {
    btn.textContent = 'Agregado';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-success');
    btn.setAttribute('aria-pressed', 'true');
    btn.tabIndex = -1;
}

/** Revertir botón a estado original */
function revertButton(btn) {
    if (!btn) return;
    btn.textContent = 'Agregar a la lista';
    btn.classList.remove('btn-success');
    btn.classList.add('btn-primary');
    btn.setAttribute('aria-pressed', 'false');
    btn.tabIndex = 0;
}

/* Config helpers - centralizar valores modificables */
function isPersistEnabled() { return false; }
function isAutoResetEnabled() { return true; }

