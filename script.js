// Global variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    updateWishlistButtons();
    
    // Page-specific initializations
    if (document.getElementById('cartItems')) {
        displayCartItems();
    }
    
    if (document.getElementById('contactForm')) {
        initializeContactForm();
    }
    
    if (document.getElementById('categoryFilter')) {
        initializeProductFilter();
    }
});

// Cart functionality
function addToCart(id, name, price, image = null) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1,
            image: image || `https://via.placeholder.com/80x80/4A90E2/ffffff?text=${encodeURIComponent(name)}`
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showSuccessMessage(`${name} added to cart!`);
    
    // Add visual feedback
    const button = event.target;
    button.innerHTML = 'Added!';
    button.style.background = '#28a745';
    setTimeout(() => {
        button.innerHTML = 'Add to Cart';
        button.style.background = '';
    }, 1000);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCartItems();
    showSuccessMessage('Item removed from cart');
}

function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
            return;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        updateCartCount();
    }
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(count => count.textContent = totalItems);
}

function displayCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to get started!</p>
                <a href="products.html" class="cta-button" style="margin-top: 20px;">Shop Now</a>
            </div>
        `;
        updateCartSummary();
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>Price: $${item.price.toFixed(2)}</p>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})" title="Remove item">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    updateCartSummary();
}

function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 9.99 : 0;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = subtotal > 0 ? `$${shipping.toFixed(2)}` : 'Free';
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 9.99 + (cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.08);
    
    if (confirm(`Proceed to checkout for $${total.toFixed(2)}?`)) {
        // Simulate checkout process
        showSuccessMessage('Order placed successfully! Thank you for your purchase.');
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        displayCartItems();
    }
}

// Wishlist functionality
function toggleWishlist(id) {
    const button = document.querySelector(`[data-id="${id}"] .wishlist-btn`);
    const icon = button.querySelector('i');
    
    if (wishlist.includes(id)) {
        wishlist = wishlist.filter(item => item !== id);
        button.classList.remove('active');
        icon.className = 'far fa-heart';
        showSuccessMessage('Removed from wishlist');
    } else {
        wishlist.push(id);
        button.classList.add('active');
        icon.className = 'fas fa-heart';
        showSuccessMessage('Added to wishlist!');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function updateWishlistButtons() {
    wishlist.forEach(id => {
        const button = document.querySelector(`[data-id="${id}"] .wishlist-btn`);
        if (button) {
            button.classList.add('active');
            const icon = button.querySelector('i');
            if (icon) icon.className = 'fas fa-heart';
        }
    });
}

function showWishlistItems() {
    const productCards = document.querySelectorAll('.product-card');
    const button = document.getElementById('showWishlist');
    
    if (button.textContent.includes('Show Wishlist')) {
        // Show only wishlist items
        productCards.forEach(card => {
            const id = parseInt(card.getAttribute('data-id'));
            if (!wishlist.includes(id)) {
                card.classList.add('hidden');
            }
        });
        button.innerHTML = '<i class="fas fa-th"></i> Show All Products';
    } else {
        // Show all products
        productCards.forEach(card => {
            card.classList.remove('hidden');
        });
        button.innerHTML = '<i class="fas fa-heart"></i> Show Wishlist';
    }
}

// Product filtering
function initializeProductFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.addEventListener('change', function() {
        const selectedCategory = this.value;
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });
}

// Contact form functionality
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Validate required fields
        if (!data.name || !data.email || !data.subject || !data.message) {
            alert('Please fill in all required fields.');
            return;
        }
        
        if (!data.terms) {
            alert('Please agree to the terms and conditions.');
            return;
        }
        
        // Simulate form submission
        const submitBtn = contactForm.querySelector('.submit-btn');
        submitBtn.innerHTML = 'Sending...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            showSuccessMessage('Thank you! Your message has been sent successfully.');
            contactForm.reset();
            submitBtn.innerHTML = 'Send Message';
            submitBtn.disabled = false;
        }, 2000);
    });
}

// Utility functions
function showSuccessMessage(message) {
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageEl = document.createElement('div');
    messageEl.className = 'success-message';
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

// Search functionality (bonus feature)
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const productCards = document.querySelectorAll('.product-card');
            
            productCards.forEach(card => {
                const productName = card.querySelector('h4').textContent.toLowerCase();
                const productDescription = card.querySelector('.description');
                const description = productDescription ? productDescription.textContent.toLowerCase() : '';
                
                if (productName.includes(searchTerm) || description.includes(searchTerm)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    }
}

// Initialize search if search input exists
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
});

// Smooth scrolling for anchor links
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Add loading states for better UX
function addLoadingState(element) {
    element.classList.add('loading');
    element.style.position = 'relative';
}

function removeLoadingState(element) {
    element.classList.remove('loading');
}

// Mobile menu toggle (for smaller screens)
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Add mobile menu styles when needed
const style = document.createElement('style');
style.textContent = `
    @media (max-width: 768px) {
        .nav-menu.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 70px;
            left: 0;
            right: 0;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
        }
        
        .hamburger {
            display: block;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
        }
    }
    
    .hamburger {
        display: none;
    }
`;
document.head.appendChild(style);
