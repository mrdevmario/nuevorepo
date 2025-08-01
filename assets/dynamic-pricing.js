// document.addEventListener('DOMContentLoaded', function() {
//   // Initialize the dynamic pricing functionality
//   class DynamicPricing {
//     constructor() {
//       this.productForm = document.querySelector('form[action="/cart/add"]');
//       this.addToCartButton = document.querySelector('[type="submit"]');
//       this.variantSelect = document.querySelector('select[name="id"]');
//       this.propertyInputs = document.querySelectorAll('[name^="properties"]');

//       if (this.productForm) {
//         this.initializeListeners();
//       }
//     }

//     initializeListeners() {
//       // Listen for form submission
//       this.productForm.addEventListener('submit', (e) => {
//         e.preventDefault();
//         this.handleAddToCart();
//       });

//       // Listen for property changes
//       this.propertyInputs.forEach(input => {
//         input.addEventListener('change', () => {
//           this.updatePrice();
//         });
//       });
//     }

//     calculatePrice() {
//       // Replace this with your actual price calculation logic
//       let basePrice = parseFloat(this.variantSelect.selectedOptions[0].dataset.price || 0);

//       // Example: Add extra cost for each selected property
//       this.propertyInputs.forEach(input => {
//         if (input.type === 'checkbox' && input.checked) {
//           basePrice += parseFloat(input.dataset.extraCost || 0);
//         } else if (input.type === 'select-one') {
//           basePrice += parseFloat(input.selectedOptions[0].dataset.extraCost || 0);
//         }
//       });

//       return basePrice;
//     }

//     updatePrice() {
//       const newPrice = this.calculatePrice();
//       // Update price display on the product page
//       const priceDisplay = document.querySelector('[data-product-price]');
//       if (priceDisplay) {
//         priceDisplay.textContent = this.formatMoney(newPrice);
//       }
//       return newPrice;
//     }

//     handleAddToCart() {
//       const variantId = this.variantSelect.value;
//       const properties = {};
//       const calculatedPrice = this.calculatePrice();

//       // Gather all properties
//       this.propertyInputs.forEach(input => {
//         if (input.type === 'checkbox') {
//           properties[input.name.replace('properties[', '').replace(']', '')] = input.checked;
//         } else {
//           properties[input.name.replace('properties[', '').replace(']', '')] = input.value;
//         }
//       });

//       // Add calculated price to properties
//       properties._calculated_price = calculatedPrice;

//       this.addToCartWithProperties(variantId, properties, calculatedPrice);
//     }

//     addToCartWithProperties(variantId, properties, calculatedPrice) {
//       fetch('/cart/add.js', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           items: [{
//             id: variantId,
//             quantity: 1,
//             properties: properties
//           }]
//         })
//       })
//       .then(response => response.json())
//       .then(data => {
//         this.updateCartItemPrice(data.items[0].key, calculatedPrice);
//       })
//       .catch((error) => {
//         console.error('Error:', error);
//       });
//     }

//     updateCartItemPrice(lineKey, newPrice) {
//       fetch('/cart/change.js', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           id: lineKey,
//           properties: {
//             _price_override: newPrice
//           }
//         })
//       })
//       .then(response => response.json())
//       .then(cart => {
//         this.updateCartDisplay(cart);
//         // Refresh mini-cart or cart page
//         window.location.reload();
//       })
//       .catch((error) => {
//         console.error('Error:', error);
//       });
//     }

//     updateCartDisplay(cart) {
//       // Implementation depends on your theme's cart structure
//       // This is a basic example
//       let cartTotal = 0;
//       const cartContainer = document.querySelector('[data-cart-container]');

//       cart.items.forEach(item => {
//         const calculatedPrice = item.properties._calculated_price || item.price;
//         cartTotal += calculatedPrice * item.quantity;
//       });

//       const totalElement = document.querySelector('[data-cart-total]');
//       if (totalElement) {
//         totalElement.textContent = this.formatMoney(cartTotal);
//       }
//     }

//     formatMoney(cents) {
//       return (cents/100).toLocaleString('en-US', {
//         style: 'currency',
//         currency: 'USD'
//       });
//     }
//   }

//   // Initialize the class
//   new DynamicPricing();
// });
