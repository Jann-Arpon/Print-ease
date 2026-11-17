const cartOrderForm = document.querySelector(
  '#paperOrderForm, #tarpOrderForm, #stickerOrderForm, #tshirtOrderForm, #mugOrderForm'
);

if (cartOrderForm) {
  const addToCartButton = cartOrderForm.querySelector('[data-add-to-cart]');
  const fileInput = cartOrderForm.querySelector('input[type="file"]');
  const reviewStep = [...cartOrderForm.querySelectorAll(
    '[data-paper-step], [data-tarp-step], [data-sticker-step], [data-tshirt-step], [data-mug-step]'
  )].pop();
  const cartStatus = document.createElement('p');
  cartStatus.className = 'cart-order-status';
  cartStatus.setAttribute('role', 'status');
  cartStatus.setAttribute('aria-live', 'polite');

  if (addToCartButton && fileInput && reviewStep) {
    const actions = addToCartButton.parentElement;
    actions.insertAdjacentElement('afterend', cartStatus);
    addToCartButton.disabled = false;

    const collectOptions = () => {
      const options = {};
      [...cartOrderForm.elements].forEach(field => {
        if (!field.name || field.type === 'file' || field.type === 'button' || field.type === 'submit') {
          return;
        }
        if ((field.type === 'radio' || field.type === 'checkbox') && !field.checked) {
          return;
        }

        if (Object.prototype.hasOwnProperty.call(options, field.name)) {
          options[field.name] = Array.isArray(options[field.name])
            ? [...options[field.name], field.value]
            : [options[field.name], field.value];
        } else {
          options[field.name] = field.value;
        }
      });
      return options;
    };

    addToCartButton.addEventListener('click', async () => {
      const file = fileInput.files[0];
      if (!file) {
        cartStatus.textContent = 'Choose a design file before adding this item to your cart.';
        return;
      }

      const summary = [...reviewStep.querySelectorAll('dl > div')].map(row => ({
        label: row.querySelector('dt')?.textContent.trim() || '',
        value: row.querySelector('dd')?.textContent.trim() || ''
      })).filter(row => row.label);
      const productName = cartOrderForm.closest('section')?.querySelector('h1')?.textContent.trim()
        || cartOrderForm.id.replace(/OrderForm$/, '');

      addToCartButton.disabled = true;
      cartStatus.textContent = 'Saving this design and its options on this device...';

      try {
        await window.PrintEaseCart.addItem({
          productName,
          formId: cartOrderForm.id,
          options: collectOptions(),
          summary,
          file: {
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            blob: file
          }
        });
        cartStatus.textContent = 'Added to your cart on this device.';
        window.dispatchEvent(new Event('cart:updated'));
        window.location.href = '../services.html';
      } catch (error) {
        console.error('Could not save this item to the local cart.', error);
        cartStatus.textContent = 'Could not save this item. Check available browser storage and try again.';
      } finally {
        addToCartButton.disabled = false;
      }
    });
  }
}
