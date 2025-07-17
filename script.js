document.addEventListener('DOMContentLoaded', () => {
    // Código para el año actual en el footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Funciones del carrito
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElement = document.querySelector('.cart-count');
    // CORRECCIÓN: Apuntar al tbody con ID "cartItems" en comprar.html
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal'); // Cambiado a 'cartTotal' según comprar.html
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const deliveryForm = document.getElementById('deliveryForm');

    // Variables para el descuento
    const discountCodeInput = document.getElementById('discountCode');
    const applyDiscountBtn = document.getElementById('applyDiscountBtn');
    const discountMessage = document.getElementById('discountMessage');
    let discountApplied = false; // Estado del descuento

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCartItems(); // Asegurar que el carrito se re-renderice al guardar cambios
    }

    function renderCartItems() {
        if (!cartItemsContainer) return; // Salir si no estamos en la página del carrito

        cartItemsContainer.innerHTML = ''; // Limpiar el contenedor (tbody)
        let total = 0;

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            // Mensaje dentro del tbody si el carrito está vacío para la tabla
            cartItemsContainer.innerHTML = '<tr><td colspan="5" class="text-center text-muted">El carrito está vacío.</td></tr>';
            if (clearCartBtn) clearCartBtn.style.display = 'none'; // Ocultar botón vaciar
            if (deliveryForm) deliveryForm.style.display = 'none'; // Ocultar formulario si el carrito está vacío
        } else {
            emptyCartMessage.style.display = 'none';
            if (clearCartBtn) clearCartBtn.style.display = 'block'; // Mostrar botón vaciar
            if (deliveryForm) deliveryForm.style.display = 'block'; // Mostrar formulario si hay items

            cart.forEach(item => {
                const row = document.createElement('tr'); // Crear una fila de tabla
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>S/ ${item.price.toFixed(2)}</td>
                    <td>
                        <input type="number" class="form-control form-control-sm item-quantity" data-product-id="${item.id}" value="${item.quantity}" min="1" style="width: 70px;">
                    </td>
                    <td>S/ ${(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                        <button class="btn btn-danger btn-sm remove-from-cart-btn" data-item-id="${item.id}">
                            Eliminar
                        </button>
                    </td>
                `;
                cartItemsContainer.appendChild(row);
                total += item.price * item.quantity;
            });
        }

        // Aplicar descuento si ya se había aplicado
        if (discountApplied) {
            total *= 0.50; // 50% de descuento
            if (discountMessage) {
                discountMessage.innerHTML = '<div class="alert alert-success mt-2">¡Descuento "TECSUP" aplicado! (50%)</div>';
            }
        } else {
            // Si el descuento no está aplicado, limpiar el mensaje si no hay un código válido ingresado
            if (discountMessage && discountCodeInput && discountCodeInput.value.trim().toUpperCase() !== 'TECSUP') {
                discountMessage.innerHTML = '';
            }
        }

        if (cartTotalElement) {
            cartTotalElement.textContent = `S/ ${total.toFixed(2)}`;
        }

        // Re-adjuntar event listeners para los botones de eliminar después de renderizar
        document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = event.currentTarget.dataset.itemId;
                removeItemFromCart(itemId);
            });
        });

        // Re-adjuntar event listeners para los cambios de cantidad
        document.querySelectorAll('.item-quantity').forEach(input => {
            input.addEventListener('change', (event) => {
                const productId = event.target.dataset.productId;
                const newQuantity = parseInt(event.target.value);
                updateItemQuantity(productId, newQuantity);
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
    }

    function updateItemQuantity(productId, newQuantity) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            if (newQuantity > 0) {
                item.quantity = newQuantity;
            } else {
                // Si la cantidad es 0 o menos, eliminar el artículo
                cart = cart.filter(item => item.id !== productId);
            }
            saveCart();
        }
    }

    function removeItemFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        alert('Producto eliminado del carrito.');
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
                discountApplied = false; // Resetear el descuento al vaciar el carrito
                saveCart();
                alert('El carrito ha sido vaciado.');
            }
        });
    }

    // Inicializar el carrito en todas las páginas que lo necesiten
    updateCartCount();
    if (cartItemsContainer) { // Solo renderizar si estamos en la página comprar.html
        renderCartItems();
    }

    // Lógica para guardar y cargar datos del formulario de delivery (registro simulado)
    const nombreClienteInput = document.getElementById('nombreCliente'); // Revertido
    const emailClienteInput = document.getElementById('emailCliente'); // Revertido
    const direccionEnvioInput = document.getElementById('direccionEnvio'); // Revertido
    const telefonoContactoInput = document.getElementById('telefonoContacto'); // Revertido

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
            discountApplied = false; // Resetear el descuento al confirmar pedido
            saveCart();
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
            const productImg = button.dataset.productImg; // Revertido a productImg
            const productDesc = button.dataset.productDesc; // Revertido a productDesc

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

    // Lógica para aplicar el código de descuento
    if (applyDiscountBtn) {
        applyDiscountBtn.addEventListener('click', () => {
            const code = discountCodeInput.value.trim().toUpperCase();
            if (code === 'TECSUP') {
                if (!discountApplied) {
                    discountApplied = true;
                    saveCart(); // Re-renderizar el carrito para aplicar el descuento
                } else {
                    if (discountMessage) {
                        discountMessage.innerHTML = '<div class="alert alert-warning mt-2">El descuento "TECSUP" ya ha sido aplicado.</div>';
                    }
                }
            } else {
                discountApplied = false; // Quitar el descuento si se ingresa un código inválido
                saveCart(); // Re-renderizar el carrito para quitar el descuento si aplica
                if (discountMessage) {
                    discountMessage.innerHTML = '<div class="alert alert-danger mt-2">Código de descuento inválido.</div>';
                }
            }
        });
    }
});
