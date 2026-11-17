document.documentElement.classList.add('js');

document.querySelectorAll('[data-year]').forEach(element => {
  element.textContent = new Date().getFullYear();
});

const orderForm = document.querySelector(
  '#paperOrderForm, #tarpOrderForm, #stickerOrderForm, #tshirtOrderForm, #mugOrderForm'
);

if (orderForm) {
  const guestIdKey = 'aljPrintGuestId';
  const guestNotice = document.createElement('p');
  guestNotice.className = 'guest-session-note';
  guestNotice.setAttribute('role', 'status');

  const createGuestId = () => {
    if (window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }

    if (!window.crypto.getRandomValues) {
      throw new Error('Secure random ID generation is unavailable.');
    }

    const bytes = window.crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  };

  try {
    let guestId = window.localStorage.getItem(guestIdKey);
    if (!guestId || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(guestId)) {
      guestId = createGuestId();
      window.localStorage.setItem(guestIdKey, guestId);
    }

    window.printEaseGuestId = guestId;
    orderForm.dataset.guestId = guestId;

    const idLabel = document.createElement('span');
    idLabel.textContent = 'Guest ID for this browser: ';
    const idValue = document.createElement('code');
    idValue.textContent = guestId;
    const note = document.createElement('span');
    note.textContent = ' — stored only on this device; this is not a secure login or submitted order.';
    guestNotice.append(idLabel, idValue, note);
  } catch (error) {
    console.error('Could not create or save a guest ID.', error);
    guestNotice.textContent = 'Guest ID unavailable: this browser could not generate or save an ID.';
  }

  const orderMain = document.querySelector('.services-main');
  if (orderMain) {
    orderMain.insertBefore(guestNotice, orderMain.firstChild);
  }
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealedElements = document.querySelectorAll('.reveal');

if (!reduceMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -15px 0px' });
  revealedElements.forEach(element => observer.observe(element));
} else {
  revealedElements.forEach(element => element.classList.add('is-visible'));
}