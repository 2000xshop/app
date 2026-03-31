document.addEventListener('DOMContentLoaded', async () => {
  await requireLogin();
  document.getElementById('logoutBtn').addEventListener('click', logout);

  const backgroundFileInput = document.getElementById('backgroundFile');
  const opacityInput = document.getElementById('backgroundOpacity');
  const opacityValue = document.getElementById('backgroundOpacityValue');
  const buttonColorInput = document.getElementById('buttonColor');
  const glowColorInput = document.getElementById('glowColor');

  const { store } = await apiFetch('/api/store');
  document.getElementById('storeName').value = store.storeName || '';
  buttonColorInput.value = store.buttonColor || '#24c8f3';
  glowColorInput.value = store.glowColor || store.buttonColor || '#24c8f3';
  opacityInput.value = Number(store.backgroundOpacity ?? 0.72);
  opacityValue.textContent = `${Math.round(Number(opacityInput.value) * 100)}%`;

  if (store.logo) {
    document.getElementById('logoPreview').src = store.logo;
    document.getElementById('logoPreview').classList.remove('hidden');
  }

  applyStoreTheme(store);
  renderBackgroundPreview(store.backgroundImage, opacityInput.value);

  opacityInput.addEventListener('input', (e) => {
    const value = Number(e.target.value || 0);
    opacityValue.textContent = `${Math.round(value * 100)}%`;
    renderBackgroundPreview(backgroundFileInput.files[0] || store.backgroundImage, value);
  });

  backgroundFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    renderBackgroundPreview(file || store.backgroundImage, opacityInput.value);
  });

  [buttonColorInput, glowColorInput].forEach((input) => {
    input.addEventListener('input', () => {
      applyStoreTheme({
        ...store,
        buttonColor: buttonColorInput.value,
        glowColor: glowColorInput.value,
        backgroundOpacity: opacityInput.value,
        backgroundImage: backgroundFileInput.files[0] ? URL.createObjectURL(backgroundFileInput.files[0]) : store.backgroundImage
      });
    });
  });

  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const res = await fetch('/api/store', {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'เกิดข้อผิดพลาด');
      showToast('toast', data.message, 'success');

      Object.assign(store, data.store);

      if (data.store.logo) {
        document.getElementById('logoPreview').src = data.store.logo;
        document.getElementById('logoPreview').classList.remove('hidden');
      }

      backgroundFileInput.value = '';
      opacityInput.value = Number(data.store.backgroundOpacity ?? 0.72);
      opacityValue.textContent = `${Math.round(Number(opacityInput.value) * 100)}%`;
      renderBackgroundPreview(data.store.backgroundImage, opacityInput.value);
      applyStoreTheme(data.store);
    } catch (error) {
      showToast('toast', error.message, 'error');
    }
  });
});

function renderBackgroundPreview(source, opacity = 0.72) {
  const preview = document.getElementById('backgroundPreviewBox');
  if (!preview) return;

  let url = '';
  if (source instanceof File) {
    url = URL.createObjectURL(source);
  } else if (typeof source === 'string') {
    url = source;
  }

  if (url) {
    preview.classList.remove('hidden');
    preview.style.backgroundImage = `linear-gradient(135deg, rgba(8,22,43,${opacity}), rgba(23,51,95,${Math.min(1, Number(opacity) + 0.08)})), url("${url}")`;
    preview.innerHTML = '<span>ตัวอย่างพื้นหลังเว็บ</span>';
  } else {
    preview.classList.add('hidden');
    preview.style.backgroundImage = '';
    preview.innerHTML = '';
  }
}
