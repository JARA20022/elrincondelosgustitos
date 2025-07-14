document.addEventListener('DOMContentLoaded', () => {
    // Código para el año actual en el footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Funciones del carrito
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElement = document.querySelector('.cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const deliveryForm = document.getElementById('deliveryForm');

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    function renderCartItems() {
        if (!cartItemsContainer) return; // Salir si no estamos en la página del carrito

        cartItemsContainer.innerHTML = ''; // Limpiar el contenedor
        let total = 0;

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            cartItemsContainer.style.display = 'none'; // Ocultar el list-group si está vacío
            if (clearCartBtn) clearCartBtn.style.display = 'none'; // Ocultar botón vaciar
        } else {
            emptyCartMessage.style.display = 'none';
            cartItemsContainer.style.display = 'block'; // Mostrar el list-group
            if (clearCartBtn) clearCartBtn.style.display = 'inline-block'; // Mostrar botón vaciar

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                const listItem = document.createElement('div');
                listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'animate__animated', 'animate__fadeIn');
                listItem.innerHTML = `
                    <div>
                        <h6 class="my-0">${item.name}</h6>
                        <small class="text-muted">Cantidad: ${item.quantity} x S/ ${item.price.toFixed(2)}</small>
                    </div>
                    <span class="text-success">S/ ${itemTotal.toFixed(2)}</span>
                    <button type="button" class="btn btn-sm btn-outline-danger ms-3 remove-from-cart-btn" data-item-id="${item.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                `;
                cartItemsContainer.appendChild(listItem);
            });
        }
        if (cartTotalElement) {
            cartTotalElement.textContent = `S/ ${total.toFixed(2)}`;
        }

        // Añadir event listeners para los botones de eliminar después de renderizar
        document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = event.currentTarget.dataset.itemId;
                removeItemFromCart(itemId);
            });
        });
    }

    function addItemToCart(id, name, price) {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }
        saveCart();
        alert(`${name} añadido al carrito.`);
        renderCartItems(); // Para actualizar la vista del carrito inmediatamente si estamos en esa página
    }

    function removeItemFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        renderCartItems();
    }

    if (document.querySelector('.add-to-cart-btn')) {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const { itemId, itemName, itemPrice } = event.currentTarget.dataset;
                addItemToCart(itemId, itemName, parseFloat(itemPrice));
            });
        });
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
                cart = [];
                saveCart();
                renderCartItems();
            }
        });
    }

    // Inicializar el carrito en todas las páginas que lo necesiten
    updateCartCount();
    if (cartItemsContainer) { // Solo renderizar si estamos en la página comprar.html
        renderCartItems();
    }

    // Lógica para guardar y cargar datos del formulario de delivery (registro simulado)
    const nombreClienteInput = document.getElementById('nombreCliente');
    const emailClienteInput = document.getElementById('emailCliente');
    const direccionEnvioInput = document.getElementById('direccionEnvio');
    const telefonoContactoInput = document.getElementById('telefonoContacto');

    // Función para cargar los datos guardados
    function loadDeliveryDetails() {
        const savedDetails = JSON.parse(localStorage.getItem('deliveryDetails'));
        if (savedDetails) {
            if (nombreClienteInput) nombreClienteInput.value = savedDetails.nombre || '';
            if (emailClienteInput) emailClienteInput.value = savedDetails.email || '';
            if (direccionEnvioInput) direccionEnvioInput.value = savedDetails.direccion || '';
            if (telefonoContactoInput) telefonoContactoInput.value = savedDetails.telefono || '';
        }
    }

    // Función para guardar los datos
    function saveDeliveryDetails() {
        const details = {
            nombre: nombreClienteInput ? nombreClienteInput.value : '',
            email: emailClienteInput ? emailClienteInput.value : '',
            direccion: direccionEnvioInput ? direccionEnvioInput.value : '',
            telefono: telefonoContactoInput ? telefonoContactoInput.value : ''
        };
        localStorage.setItem('deliveryDetails', JSON.stringify(details));
    }

    // Cargar datos al cargar la página si estamos en comprar.html
    if (deliveryForm) {
        loadDeliveryDetails();

        // Guardar datos al enviar el formulario
        deliveryForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Evitar el envío real del formulario
            saveDeliveryDetails(); // Guardar los datos del "registro"

            if (cart.length === 0) {
                alert('Tu carrito está vacío. Por favor, añade productos antes de confirmar tu pedido.');
                return;
            }

            // Simulación de confirmación de pedido
            alert('¡Pedido confirmado! Tus datos de envío han sido guardados para futuras compras.');
            
            // Opcional: Vaciar el carrito después de la confirmación del pedido
            cart = [];
            saveCart();
            renderCartItems(); // Actualizar la vista del carrito
        });
    }

    // Lógica para el Modal de Detalles de Producto (productos.html)
    const productDetailModal = document.getElementById('productDetailModal');
    if (productDetailModal) {
        productDetailModal.addEventListener('show.bs.modal', (event) => {
            const button = event.relatedTarget; // Botón que activó el modal
            const productId = button.dataset.productId;
            const productName = button.dataset.productName;
            const productPrice = button.dataset.productPrice;
            const productImg = button.dataset.productImg;
            const productDesc = button.dataset.productDesc;

            // Actualizar el contenido del modal
            document.getElementById('modalProductImage').src = productImg;
            document.getElementById('modalProductName').textContent = productName;
            document.getElementById('modalProductDescription').textContent = productDesc;
            document.getElementById('modalProductPrice').textContent = `S/ ${parseFloat(productPrice).toFixed(2)}`;

            // Configurar el botón "Añadir al Carrito" dentro del modal
            const addToCartModalBtn = productDetailModal.querySelector('.add-to-cart-modal-btn');
            addToCartModalBtn.onclick = () => {
                addItemToCart(productId, productName, parseFloat(productPrice));
                const modalInstance = bootstrap.Modal.getInstance(productDetailModal);
                modalInstance.hide(); // Cerrar el modal después de añadir al carrito
            };
        });
    }

    // Lógica para el Modal de Contacto Global
    const globalContactForm = document.getElementById('globalContactForm');
    if (globalContactForm) {
        globalContactForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Evitar el envío real del formulario

            // Validación básica
            const modalNombre = document.getElementById('modalNombre').value;
            const modalCorreo = document.getElementById('modalCorreo').value;
            const modalMensaje = document.getElementById('modalMensaje').value;

            if (modalNombre && modalCorreo && modalMensaje) {
                alert('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.');
                // Aquí podrías añadir lógica para enviar los datos a un servidor (requiere backend)
                globalContactForm.reset(); // Limpiar el formulario
                const modalInstance = bootstrap.Modal.getInstance(document.getElementById('contactModal'));
                modalInstance.hide(); // Cerrar el modal
            } else {
                alert('Por favor, rellena todos los campos del formulario de contacto.');
            }
        });
    }

});
