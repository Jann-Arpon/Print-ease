document.documentElement.classList.add('js');

document.querySelectorAll('[data-year]').forEach(element => {
  element.textContent = new Date().getFullYear();
});

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

const staffLoginForm = document.querySelector('#staffLoginForm');

if (staffLoginForm) {
  staffLoginForm.addEventListener('submit', event => {
    event.preventDefault();

    const username = document.querySelector('#staffUsername').value.trim();
    const password = document.querySelector('#staffPassword').value;
    const loginError = document.querySelector('#loginError');

    if (username === 'admin' && password === '123') {
      window.location.href = 'admin.html';
      return;
    }

    loginError.hidden = false;
  });
}
