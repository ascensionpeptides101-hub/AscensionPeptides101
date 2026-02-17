// Shopping Cart JavaScript

// Product data with prices
const products = {
    'CJC-1295 5mg + Ipamorelin 5mg': { price: 49.99, icon: '🧬' },
    'GHK-CU 100mg': { price: 45.00, icon: '🔬' },
    'Retatrutide 10mg': { price: 75.00, icon: '⚗️' },
    'BAC Water 10ml': { price: 6.99, icon: '💧' },
    'MT1 10mg': { price: 39.99, icon: '☀️' }
};

// Get cart from localStorage or initialize empty cart
function getCart() {
    const cart = localStorage.getItem('peptideCart');
    return cart ? JSON.parse(cart) : {};
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('peptideCart', JSON.stringify(cart));
    updateCartBadge();
    // Always re-render cart if we're on the cart page
    if (document.getElementById('cart-items-container')) {
        renderCart();
    }
}

// Update cart badge count
function updateCartBadge() {
    const cart = getCart();
    const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    });
}

// Add item to cart
function addToCart(productName) {
    const cart = getCart();
    cart[productName] = (cart[productName] || 0) + 1;
    saveCart(cart);
    
    // Show confirmation
    alert(`✓ ${productName} added to cart!`);
}

// Update quantity
function updateQuantity(productName, change) {
    const cart = getCart();
    const newQty = (cart[productName] || 0) + change;
    
    if (newQty <= 0) {
        delete cart[productName];
    } else {
        cart[productName] = newQty;
    }
    
    saveCart(cart);
}

// Remove item from cart
function removeFromCart(productName) {
    if (confirm(`Remove ${productName} from cart?`)) {
        const cart = getCart();
        delete cart[productName];
        saveCart(cart);
    }
}

// Calculate totals
function calculateTotals() {
    const cart = getCart();
    let subtotal = 0;
    
    for (const [productName, qty] of Object.entries(cart)) {
        subtotal += products[productName].price * qty;
    }
    
    const shippingCost = subtotal >= 100 ? 0 : 10;
    const total = subtotal + shippingCost;
    
    return { subtotal, shippingCost, total };
}

// Render cart items
function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cart-items-container');
    const { subtotal, shippingCost, total } = calculateTotals();
    
    // Always update totals (even if cart is empty)
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`;
    if (shippingCost === 0) {
        document.getElementById('shipping').classList.add('shipping-free');
    } else {
        document.getElementById('shipping').classList.remove('shipping-free');
    }
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    
    // Render shipping progress
    renderShippingProgress(subtotal);
    
    // If cart is empty
    if (Object.keys(cart).length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some premium research peptides to get started!</p>
                <a href="shop.html" class="btn-shop">Browse Products</a>
            </div>
        `;
        return;
    }
    
    // Render cart items
    let html = '';
    for (const [productName, qty] of Object.entries(cart)) {
        const product = products[productName];
        const itemTotal = product.price * qty;
        
        html += `
            <div class="cart-item">
                <div class="item-icon">${product.icon}</div>
                <div class="item-details">
                    <h3>${productName}</h3>
                    <div class="item-price">$${product.price.toFixed(2)} each</div>
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="updateQuantity('${productName}', -1)">-</button>
                        <span class="qty-display">${qty}</span>
                        <button class="qty-btn" onclick="updateQuantity('${productName}', 1)">+</button>
                    </div>
                </div>
                <div class="item-right">
                    <div class="item-total">$${itemTotal.toFixed(2)}</div>
                    <button class="btn-remove" onclick="removeFromCart('${productName}')">Remove</button>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Render shipping progress bar
function renderShippingProgress(subtotal) {
    const progressContainer = document.getElementById('shipping-progress');
    const remaining = Math.max(0, 100 - subtotal);
    const percentage = Math.min(100, (subtotal / 100) * 100);
    
    if (subtotal >= 100) {
        progressContainer.innerHTML = `
            <div class="shipping-banner">
                🎉 You've qualified for FREE SHIPPING!
            </div>
        `;
    } else {
        progressContainer.innerHTML = `
            <div class="shipping-banner" style="background: linear-gradient(135deg, #DC143C, #B91030);">
                Add $${remaining.toFixed(2)} more for FREE SHIPPING!
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }
}

// Checkout function
function checkout() {
    const cart = getCart();
    const { subtotal, shippingCost, total } = calculateTotals();
    
    if (Object.keys(cart).length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Build order details for email
    let orderDetails = 'Order Details:\n\n';
    for (const [productName, qty] of Object.entries(cart)) {
        const product = products[productName];
        const itemTotal = product.price * qty;
        orderDetails += `${productName}\nQuantity: ${qty}\nPrice: $${product.price.toFixed(2)} each\nSubtotal: $${itemTotal.toFixed(2)}\n\n`;
    }
    
    orderDetails += `-------------------\n`;
    orderDetails += `Subtotal: $${subtotal.toFixed(2)}\n`;
    orderDetails += `Shipping: ${shippingCost === 0 ? 'FREE' : '$' + shippingCost.toFixed(2)}\n`;
    orderDetails += `TOTAL: $${total.toFixed(2)}\n\n`;
    orderDetails += `Please provide payment and shipping instructions.\n\nThank you!`;
    
    const subject = encodeURIComponent('New Order - Ascension Peptides');
    const body = encodeURIComponent(orderDetails);
    
    window.location.href = `mailto:AscensionPeptides101@gmail.com?subject=${subject}&body=${body}`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart system initialized');
    updateCartBadge();
    
    if (window.location.pathname.includes('cart.html') || document.getElementById('cart-items-container')) {
        console.log('Rendering cart...');
        renderCart();
    }
});
