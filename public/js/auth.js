document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const REMEMBER_KEY = 'accountingAppRememberLogin';

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(registerForm).entries());
      try {
        const data = await apiFetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        showToast('toast', data.message, 'success');
        setTimeout(() => (location.href = '/dashboard'), 700);
      } catch (error) {
        showToast('toast', error.message, 'error');
      }
    });
  }

  if (loginForm) {
    const emailInput = loginForm.querySelector('input[name="email"]');
    const passwordInput = loginForm.querySelector('input[name="password"]');
    const rememberInput = document.getElementById('rememberLogin');

    try {
      const saved = JSON.parse(localStorage.getItem(REMEMBER_KEY) || 'null');
      if (saved?.email && saved?.password) {
        emailInput.value = saved.email;
        passwordInput.value = saved.password;
        rememberInput.checked = true;
      }
    } catch (error) {
      localStorage.removeItem(REMEMBER_KEY);
    }

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(loginForm).entries());
      try {
        const data = await apiFetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (rememberInput.checked) {
          localStorage.setItem(REMEMBER_KEY, JSON.stringify({
            email: formData.email,
            password: formData.password
          }));
        } else {
          localStorage.removeItem(REMEMBER_KEY);
        }

        showToast('toast', data.message, 'success');
        setTimeout(() => (location.href = '/dashboard'), 700);
      } catch (error) {
        showToast('toast', error.message, 'error');
      }
    });
  }
});
