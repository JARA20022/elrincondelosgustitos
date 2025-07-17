document.addEventListener('DOMContentLoaded', () => {
    // Código para el año actual en el footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Funciones del carrito
    let cart = JSON.parse(localStorage.getItem('cart')) || []; // Correcto: usa 'cart'
    const cartCountElement = document.querySelector('.cart-count');
    const cartItemsContainer = document.getElementById('cartItems'); // Apunta al tbody en comprar.html
    const cartTotalElement = document.getElementById('cartTotal');
    const emptyCartMessage = document.getElementById('empty-cart-message'); // Elemento opcional
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const deliveryForm = document.getElementById('deliveryForm');

    // Variables para el descuento
    const discountCodeInput = document.getElementById('discountCode');
    const applyDiscountBtn = document.getElementById('applyDiscountBtn');
    const discountMessage = document.getElementById('discountMessage');
    let discountApplied = false; // Estado del descuento

    // Opcional: Recuperar el estado del descuento desde localStorage para persistencia
    // discountApplied = localStorage.getItem('discountApplied') === 'true';

    function updateCartCount() {
        // Asegurarse de que 'quantity' es un número válido antes de sumar
        const totalItems = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        // Opcional: Guardar el estado del descuento si se quiere persistencia
        // localStorage.setItem('discountApplied', discountApplied);
        updateCartCount();
        renderCartItems(); // Re-renderizar para reflejar cambios y descuentos
    }

    function renderCartItems() {
        // Salir si no estamos en la página del carrito (sin contenedor de ítems)
        if (!cartItemsContainer) {
            updateCartCount(); // Solo actualizar el contador si no hay contenedor de items
            return;
        }

        cartItemsContainer.innerHTML = ''; // Limpiar el contenedor (tbody)
        let total = 0;

        if (cart.length === 0) {
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            cartItemsContainer.innerHTML = '<tr><td colspan="5" class="text-center text-muted">El carrito está vacío.</td></tr>';
            if (clearCartBtn) clearCartBtn.style.display = 'none'; // Ocultar botón vaciar
            if (deliveryForm) deliveryForm.style.display = 'none'; // Ocultar formulario de delivery
        } else {
            if (emptyCartMessage) emptyCartMessage.style.display = 'none';
            if (clearCartBtn) clearCartBtn.style.display = 'block'; // Mostrar botón vaciar
            if (deliveryForm) deliveryForm.style.display = 'block'; // Mostrar formulario de delivery

            cart.forEach(item => {
                // *** CORRECCIÓN CLAVE para el NaN: Asegurar que price y quantity son números ***
                const itemPriceNum = Number(item.price);
                const itemQuantityNum = Number(item.quantity || 1); // Default a 1 si quantity es 0/null/undefined

                // Verificar si los valores son válidos antes de calcular el subtotal
                const subtotal = (isNaN(itemPriceNum) || isNaN(itemQuantityNum)) ? 0 : itemPriceNum * itemQuantityNum;

                const row = document.createElement('tr'); // Crear una fila de tabla
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>S/ ${itemPriceNum.toFixed(2)}</td>
                    <td>
                        <input type="number" class="form-control form-control-sm item-quantity" data-product-id="${item.id}" value="${itemQuantityNum}" min="1" style="width: 70px;">
                    </td>
                    <td>S/ ${subtotal.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-danger btn-sm remove-from-cart-btn" data-item-id="${item.id}">
                            Eliminar
                        </button>
                    </td>
                `;
                cartItemsContainer.appendChild(row);
                total += subtotal; // Sumar el subtotal validado al total
            });
        }

        // Aplicar descuento si ya se había aplicado
        if (discountApplied) {
            total *= 0.50; // 50% de descuento
            if (discountMessage) {
                discountMessage.innerHTML = '<div class="alert alert-success mt-2">¡Descuento "TECSUP" aplicado! (50%)</div>';
            }
        } else {
            // Limpiar el mensaje de descuento si no hay un código válido aplicado
            if (discountMessage && discountCodeInput && discountCodeInput.value.trim().toUpperCase() !== 'TECSUP') {
                discountMessage.innerHTML = '';
            }
        }

        if (cartTotalElement) {
            cartTotalElement.textContent = `S/ ${total.toFixed(2)}`;
        }

        // Re-adjuntar event listeners para los botones de eliminar y cambios de cantidad
        document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = event.currentTarget.dataset.itemId;
                removeItemFromCart(itemId);
            });
        });

        document.querySelectorAll('.item-quantity').forEach(input => {
            input.addEventListener('change', (event) => {
                const productId = event.target.dataset.productId;
                // Asegurar que la cantidad es un número entero válido y al menos 1
                const newQuantity = Math.max(1, parseInt(event.target.value) || 1);
                updateItemQuantity(productId, newQuantity);
            });
        });
    }

    function addItemToCart(id, name, price) {
        // Asegurar que el precio es un número al añadirlo al carrito
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice)) {
            console.error('Error: El precio del producto no es un número válido.', { id, name, price });
            alert('No se pudo añadir el producto. El precio no es válido.');
            return;
        }

        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            // Asegurar que quantity es número antes de incrementar
            existingItem.quantity = Number(existingItem.quantity || 0) + 1;
        } else {
            cart.push({ id, name, price: parsedPrice, quantity: 1 });
        }
        saveCart();
        alert(`${name} añadido al carrito.`);
    }

    function updateItemQuantity(productId, newQuantity) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            // Asegurar que newQuantity es un número positivo
            const quantityToSet = Math.max(1, Number(newQuantity));
            item.quantity = quantityToSet;
            saveCart();
        } else {
            console.warn(`Intento de actualizar la cantidad de un producto no encontrado: ${productId}`);
        }
    }

    function removeItemFromCart(id) {
        const initialCartLength = cart.length;
        cart = cart.filter(item => item.id !== id);
        if (cart.length < initialCartLength) {
            saveCart();
            alert('Producto eliminado del carrito.');
        } else {
            console.warn(`Intento de eliminar un producto no encontrado: ${id}`);
        }
    }

    // Event listeners para los botones "Agregar al Carrito" (usados en productos.html)
    if (document.querySelector('.add-to-cart-btn')) {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const { itemId, itemName, itemPrice } = event.currentTarget.dataset;
                addItemToCart(itemId, itemName, itemPrice);
            });
        });
    }

    // Event listener para el botón "Vaciar Carrito" (en comprar.html)
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
                cart = [];
                discountApplied = false; // Resetear el descuento al vaciar el carrito
                // Opcional: localStorage.removeItem('discountApplied');
                saveCart();
                alert('El carrito ha sido vaciado.');
            }
        });
    }

    // Inicializar el carrito: actualizar el contador y renderizar items si estamos en comprar.html
    updateCartCount();
    if (cartItemsContainer) {
        renderCartItems();
    }

    // Lógica para guardar y cargar datos del formulario de delivery (registro simulado)
    // *** CORRECCIÓN: Usar los IDs de input de comprar.html que proporcionaste antes ***
    const direccionInput = document.getElementById('direccion');
    const ciudadInput = document.getElementById('ciudad');
    const telefonoInput = document.getElementById('telefono');
    const couponCodeInput = document.getElementById('couponCode'); // Campo de cupón en el formulario
    const notasInput = document.getElementById('notas'); // Campo de notas adicionales

    function loadDeliveryDetails() {
        const savedDetails = JSON.parse(localStorage.getItem('deliveryDetails'));
        if (savedDetails) {
            if (direccionInput) direccionInput.value = savedDetails.direccion || '';
            if (ciudadInput) ciudadInput.value = savedDetails.ciudad || '';
            if (telefonoInput) telefonoInput.value = savedDetails.telefono || '';
            if (couponCodeInput) couponCodeInput.value = savedDetails.couponCode || '';
            if (notasInput) notasInput.value = savedDetails.notas || '';
        }
    }

    function saveDeliveryDetails() {
        const details = {
            direccion: direccionInput ? direccionInput.value : '',
            ciudad: ciudadInput ? ciudadInput.value : '',
            telefono: telefonoInput ? telefonoInput.value : '',
            couponCode: couponCodeInput ? couponCodeInput.value : '',
            notas: notasInput ? notasInput.value : ''
        };
        localStorage.setItem('deliveryDetails', JSON.stringify(details));
    }

    // Cargar datos del formulario al cargar la página (solo si el formulario existe)
    if (deliveryForm) {
        loadDeliveryDetails();

        // Guardar datos al enviar el formulario y confirmar pedido
        deliveryForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Evitar el envío real del formulario
            saveDeliveryDetails(); // Guardar los datos del formulario

            if (cart.length === 0) {
                alert('Tu carrito está vacío. Por favor, añade productos antes de confirmar tu pedido.');
                return;
            }

            // Mensaje de confirmación detallado
            const orderConfirmationMessage = document.getElementById('orderConfirmationMessage');
            const direccion = direccionInput ? direccionInput.value : 'No proporcionado';
            const ciudad = ciudadInput ? ciudadInput.value : 'No proporcionado';
            const telefono = telefonoInput ? telefonoInput.value : 'No proporcionado';
            const couponCode = couponCodeInput ? couponCodeInput.value : 'Ninguno';
            const notas = notasInput ? notasInput.value : 'Ninguna';

            let confirmationText = `¿Estás seguro de que tu información es correcta y quieres confirmar tu pedido?\n\n`;
            confirmationText += `Detalles del Pedido:\n`;
            cart.forEach(item => {
                // Asegurar que sean números para la confirmación también
                confirmationText += `- ${item.name} x ${Number(item.quantity || 0)} (S/ ${(Number(item.price) * Number(item.quantity || 0)).toFixed(2)})\n`;
            });
            confirmationText += `\nTotal: ${cartTotalElement ? cartTotalElement.textContent : 'Calculando...'}\n\n`;
            confirmationText += `Datos de Envío:\n`;
            confirmationText += `Dirección: ${direccion}\n`;
            confirmationText += `Ciudad: ${ciudad}\n`;
            confirmationText += `Teléfono: ${telefono}\n`;
            confirmationText += `Cupón de descuento: ${couponCode}\n`;
            confirmationText += `Notas Adicionales: ${notas}\n`;

            if (confirm(confirmationText)) {
                orderConfirmationMessage.innerHTML = `<div class="alert alert-success">¡Tu pedido ha sido confirmado! Nos contactaremos contigo pronto.</div>`;
                deliveryForm.reset();
                cart = [];
                discountApplied = false; // Resetear el descuento
                saveCart(); // Guarda el carrito vacío
                setTimeout(() => { if (orderConfirmationMessage) orderConfirmationMessage.innerHTML = ''; }, 5000);
            } else {
                orderConfirmationMessage.innerHTML = `<div class="alert alert-info">Pedido cancelado. Puedes revisar tus datos.</div>`;
                setTimeout(() => { if (orderConfirmationMessage) orderConfirmationMessage.innerHTML = ''; }, 3000);
            }
        });
    }

    // Lógica para el Modal de Detalles de Producto (usado en productos.html)
    const productDetailModal = document.getElementById('productDetailModal');
    if (productDetailModal) {
        productDetailModal.addEventListener('show.bs.modal', (event) => {
            const button = event.relatedTarget;
            const productId = button.dataset.productId;
            const productName = button.dataset.productName;
            const productPrice = button.dataset.productPrice;
            const productImg = button.dataset.productImg;
            const productDesc = button.dataset.productDesc;

            document.getElementById('modalProductImage').src = productImg || '';
            document.getElementById('modalProductName').textContent = productName || 'Producto Desconocido';
            document.getElementById('modalProductDescription').textContent = productDesc || 'Sin descripción.';
            document.getElementById('modalProductPrice').textContent = `S/ ${parseFloat(productPrice || 0).toFixed(2)}`;

            const addToCartModalBtn = productDetailModal.querySelector('.add-to-cart-modal-btn');
            if (addToCartModalBtn) {
                addToCartModalBtn.onclick = () => {
                    addItemToCart(productId, productName, productPrice);
                    const modalInstance = bootstrap.Modal.getInstance(productDetailModal);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                };
            }
        });
    }

    // Lógica para el Modal de Contacto Global (si existe)
    const globalContactForm = document.getElementById('globalContactForm');
    if (globalContactForm) {
        globalContactForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const modalNombre = document.getElementById('modalNombre')?.value;
            const modalCorreo = document.getElementById('modalCorreo')?.value;
            const modalMensaje = document.getElementById('modalMensaje')?.value;

            if (modalNombre && modalCorreo && modalMensaje) {
                alert('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.');
                globalContactForm.reset();
                const contactModal = document.getElementById('contactModal');
                const modalInstance = contactModal ? bootstrap.Modal.getInstance(contactModal) : null;
                if (modalInstance) {
                    modalInstance.hide();
                }
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
                    if (discountMessage) {
                        discountMessage.innerHTML = '<div class="alert alert-success mt-2">¡Descuento "TECSUP" aplicado! (50%)</div>';
                    }
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
