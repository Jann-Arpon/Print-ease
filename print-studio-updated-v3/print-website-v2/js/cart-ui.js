const cartCountElements = [...document.querySelectorAll('[data-cart-count]')];
const cartList = document.querySelector('[data-cart-items]');
const cartStatus = document.querySelector('[data-cart-status]');

const formatCartFileSize = bytes => bytes < 1024
  ? `${bytes} bytes`
  : `${(bytes / 1024).toFixed(1)} KB`;

const updateCartCount = async () => {
  try {
    const items = await window.PrintEaseCart.getItems();
    cartCountElements.forEach(element => {
      element.textContent = String(items.length);
    });
  } catch (error) {
    console.error('Could not read the local cart count.', error);
    cartCountElements.forEach(element => {
      element.textContent = '—';
    });
  }
};

const renderCartItems = async () => {
  if (!cartList) {
    return;
  }

  cartList.replaceChildren();
  cartStatus.textContent = 'Loading your cart...';

  try {
    const items = await window.PrintEaseCart.getItems();
    cartStatus.textContent = items.length
      ? `${items.length} ${items.length === 1 ? 'item' : 'items'} saved on this device.`
      : 'Your cart is empty.';

    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'cart-item';

      const heading = document.createElement('h2');
      heading.textContent = item.productName;
      card.append(heading);

      const details = document.createElement('dl');
      details.className = 'cart-item-details';
      item.summary.forEach(row => {
        const detail = document.createElement('div');
        const label = document.createElement('dt');
        label.textContent = row.label;
        const value = document.createElement('dd');
        value.textContent = row.value;
        detail.append(label, value);
        details.append(detail);
      });
      card.append(details);

      const fileLabel = document.createElement('p');
      fileLabel.className = 'cart-item-file';
      fileLabel.textContent = `Design file: ${item.file.name} (${formatCartFileSize(item.file.size)})`;
      card.append(fileLabel);

      const actions = document.createElement('div');
      actions.className = 'cart-item-actions';

      const downloadButton = document.createElement('button');
      downloadButton.className = 'cart-action-button';
      downloadButton.type = 'button';
      downloadButton.textContent = 'Download design';
      downloadButton.addEventListener('click', () => {
        const fileUrl = URL.createObjectURL(item.file.blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = fileUrl;
        downloadLink.download = item.file.name;
        downloadLink.click();
        window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
      });

      const removeButton = document.createElement('button');
      removeButton.className = 'cart-action-button cart-action-button--secondary';
      removeButton.type = 'button';
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', async () => {
        removeButton.disabled = true;
        try {
          await window.PrintEaseCart.removeItem(item.id);
          await renderCartItems();
          await updateCartCount();
        } catch (error) {
          console.error('Could not remove the cart item.', error);
          cartStatus.textContent = 'Could not remove this item. Please try again.';
          removeButton.disabled = false;
        }
      });

      actions.append(downloadButton, removeButton);
      card.append(actions);
      cartList.append(card);
    });
    await updateCartCount();
  } catch (error) {
    console.error('Could not load the local cart.', error);
    cartStatus.textContent = 'Could not load your cart. Check that this browser allows local storage for this site.';
    await updateCartCount();
  }
};

window.addEventListener('cart:updated', updateCartCount);
updateCartCount();
renderCartItems();
