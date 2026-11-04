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