document.addEventListener('DOMContentLoaded', () => initApp());

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

        const txt = (btn.textContent || '').trim().toLowerCase();
        if (!txt.includes('agregar')) return; // Sólo gestionar botones "Agregar"

        e.preventDefault();
        markButtonAdded(btn);

        const card = btn.closest('.card');
        const titleEl = card ? card.querySelector('.card-title') : null;
        const title = titleEl ? titleEl.textContent.trim() : 'Elemento';
        showFloatingMessage(`Agregado a la lista: ${title}`, btn);

        // Auto-reset configurable desde helpers
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

