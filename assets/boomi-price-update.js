if (!customElements.get("kit-variant-metafield-select")) {
  customElements.define(
    "kit-variant-metafield-select",
    class KitVariantMetafields extends HTMLElement {
      constructor() {
        super();
        this.metafieldOptions = ["mortar_collar", "storm_collar", "top_clamp", "adapter", "tee_end_cap", "tee_snout", "tee_body", "top_plate", "lid_cap"];

        this.customProperties = {};
        this.kitData = null;
        this.init();
      }

      init() {
        this.updateProperties();
        this.attachEventListeners();
      }

      // Retrieve variant and customer IDs
      get variantNetsuiteId() {
        return document.getElementById("kit-variant-netsuite-id")?.value || null;
      }

      get customerId() {
        return document.getElementById("kit-product")?.dataset?.customerid || null;
      }

      // Update metafield properties dynamically
      updateProperties() {
        this.defaultProperties = this.metafieldOptions.reduce((props, id) => {
          const element = document.getElementById(id);
          if (element?.value.trim()) {
            props[id] = element.value.trim();
          }
          return props;
        }, {});

        this.toggleButtons();
      }

      // Attach event listeners
      attachEventListeners() {
        this.attachFieldListeners();
        this.attachCalculatePriceListener();
        this.attachAddToCartListener();
      }

      attachFieldListeners() {
        this.metafieldOptions.forEach((key) => {
          const selectElement = document.getElementById(key);
          if (selectElement) {
            selectElement.addEventListener("change", () => {
              this.updateProperties();
            });
          }
        });
      }

      attachCalculatePriceListener() {
        const calculatePriceBtn = document.querySelector(".calculate__price");
        if (calculatePriceBtn) {
          calculatePriceBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            if (!this.isCustomerLoggedIn()) return;

            this.toggleLoading(true, calculatePriceBtn);

            try {
              await this.fetchPrice();
            } catch (error) {
              console.error("Error fetching price:", error);
            } finally {
              this.toggleLoading(false, calculatePriceBtn);
            }
          });
        }
      }

      attachAddToCartListener() {
        const addToCartButton = document.getElementById("custom_add-btn");
        if (addToCartButton) {
          addToCartButton.addEventListener("click", async (e) => {
            e.preventDefault();

            const variantId = addToCartButton.dataset.variant;
            this.customProperties = { ...this.defaultProperties, base_price: document.querySelector("#price__property")?.value };

            this.toggleLoading(true, addToCartButton);

            try {
              const cart = await this.fetchCart();
              const data = this.buildCartData(variantId, cart);

              await this.addToCart(data);
            } catch (error) {
              console.error("Error adding to cart:", error);
            } finally {
              this.toggleLoading(false, addToCartButton);
            }
          });
        }
      }

      async fetchCart() {
        try {
          const response = await fetch("/cart.js");
          return await response.json();
        } catch (error) {
          console.error("Error fetching cart:", error);
          throw new Error("Could not fetch cart data");
        }
      }

      buildCartData(variantId, cart) {
        const quantityValue = parseInt(document.querySelector(".quantity__input")?.value, 10) || 1;
        const variantIdInt = parseInt(variantId);

        const matchingVariant = cart.items.find((item) => item.variant_id === variantIdInt);

        if (matchingVariant) {
          const propertiesMatch = this.metafieldOptions.every((prop) => {
            return (matchingVariant.properties[prop] || "") === (this.customProperties[prop] || "");
          });

          if (!propertiesMatch) {
            this.customProperties.unique_id = Date.now().toString();
          }
        }

        return {
          id: variantIdInt,
          quantity: quantityValue,
          properties: { ...this.customProperties, _kit_data: this.kitData },
        };
      }

      async addToCart(data) {
        try {
          const response = await fetch("/cart/add.js", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error(await response.text());
          }

          console.log("Item added to cart:", await response.json());
          window.location.href = "/cart";
        } catch (error) {
          console.error("Error adding to cart:", error);
          this.showError(`Failed to add item to cart: ${error.message}`);
        }
      }

      async fetchPrice() {
        const optionsWrapper = this.closest(".kit__options-wrapper");
        if (!optionsWrapper) return;

        const { token, url: endpoint } = optionsWrapper.dataset;

        try {
          console.log("Fetching price with properties:", this.defaultProperties);
          console.log("Using endpoint:", endpoint);
          console.log("Using token:", token);
          console.log("Variant Netsuite ID:", this.variantNetsuiteId);
          console.log("Customer ID:", this.customerId);
          
          const response = await axios.post(
            endpoint,
            (() => {
              // Get kit_data from hidden input
              const kitDataInput = document.getElementById('kit-data-json');
              let kitData = {};
              if (kitDataInput && kitDataInput.value) {
                try {
                  let rawKitData = kitDataInput.value;
                  // If it's a stringified JSON inside a string, parse it twice
                  if (typeof rawKitData === 'string') {
                    rawKitData = JSON.parse(rawKitData);
                  }
                  if (typeof rawKitData === 'string') {
                    rawKitData = JSON.parse(rawKitData);
                  }
                  // Map each key to its first non-empty value in the array
                  kitData = Object.fromEntries(
                    Object.entries(rawKitData).map(([key, val]) => [key, Array.isArray(val) ? (val.find(v => v) || "") : val])
                  );
                  console.log("Parsed kit_data (flattened):", kitData);
                } catch (e) {
                  console.error('Error parsing kit_data JSON:', e);
                }
              }
              return {
                item: this.variantNetsuiteId,
                customer: this.customerId,
                ...this.defaultProperties,
                ...kitData // Spread kit_data keys into the request body as strings
              };
            })(),
            {
              headers: {
                Authorization: `Basic ${btoa(token)}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.status === 200) {
            this.updatePrice(response.data.price);
            this.kitData = response.data.kit_data;
            this.showError(false);
          } else {
            throw new Error(`Request failed with status: ${response.status}`);
          }
        } catch (error) {
          console.error("Error fetching price:", error);
          this.showError(`Failed to fetch price: ${error.message}`);
        }
      }

      kitData(data) {
        this.kitData = data;
      }

      updatePrice(price) {
        const formattedPrice = `$${Number(price).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

        document.querySelector("#price__property").value = Number(price).toFixed(2);
        document.querySelector(".price-item span").textContent = formattedPrice;

        document.getElementById("custom_add-btn").style.display = "flex";
        document.querySelector(".calculate__price").style.display = "none";
      }

      toggleButtons() {
        const calculatePriceBtn = document.querySelector(".calculate__price");
        const addToCartButton = document.getElementById("custom_add-btn");

        calculatePriceBtn.style.display = "flex";
        addToCartButton.style.display = "none";
      }

      toggleLoading(isLoading, button) {
        const loader = button.querySelector(".btn-ring");
        if (loader) loader.style.display = isLoading ? "block" : "none";
        button.disabled = isLoading;
      }

      showError(message = "") {
        const fetchError = document.querySelector(".boomi__error-popup");
        fetchError.style.display = message ? "block" : "none";
        if (message) {
          fetchError.textContent = message;
        }
      }

      isCustomerLoggedIn() {
        if (!this.customerId) {
          const loginPopup = document.querySelector(".customer_login_popup");
          if (loginPopup) {
            loginPopup.style.display = "block";
          }
          console.warn("Customer not logged in. Redirecting...");
          setTimeout(() => {
            window.location.href = "/account/login";
          }, 2000);
          return false;
        }
        return true;
      }
    }
  );
}
