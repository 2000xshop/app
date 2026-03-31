async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'เกิดข้อผิดพลาด');
  return data;
}

function showToast(id, message, type = 'success') {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `toast show ${type}`;
  el.textContent = message;
}

function currency(value) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function formatThaiDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const raw = String(value);
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return raw;
    const [, y, m, d] = match;
    return `${d}/${m}/${Number(y) + 543}`;
  }
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear() + 543;
  return `${day}/${month}/${year}`;
}

async function requireLogin(redirect = '/login') {
  try {
    const { user } = await apiFetch('/api/auth/me');
    return user;
  } catch (e) {
    location.href = redirect;
  }
}

async function logout() {
  await apiFetch('/api/auth/logout', { method: 'POST' });
  location.href = '/login';
}

function clamp(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, num));
}

function shadeHexColor(hex, percent) {
  const raw = String(hex || '').replace('#', '');
  const normalized = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return '#24c8f3';

  const num = parseInt(normalized, 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}

function hexToRgba(hex, alpha = 0.45) {
  const raw = String(hex || '').replace('#', '');
  const normalized = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return `rgba(36, 200, 243, ${alpha})`;
  const num = parseInt(normalized, 16);
  const r = num >> 16;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyStoreTheme(store = {}) {
  const root = document.documentElement;
  const buttonColor = store.buttonColor || '#24c8f3';
  const buttonColor2 = shadeHexColor(buttonColor, -16);
  const glowColor = store.glowColor || buttonColor;
  const bgOpacity = clamp(store.backgroundOpacity ?? 0.72, 0, 1);

  root.style.setProperty('--primary', buttonColor);
  root.style.setProperty('--button-color', buttonColor);
  root.style.setProperty('--button-color-2', buttonColor2);
  root.style.setProperty('--glow-color', hexToRgba(glowColor, 0.45));

  if (store.backgroundImage) {
    document.body.classList.add('has-custom-bg');
    document.body.style.backgroundImage = `linear-gradient(135deg, rgba(8,22,43,${bgOpacity}), rgba(23,51,95,${Math.min(1, bgOpacity + 0.08)})), url("${store.backgroundImage}")`;
  } else {
    document.body.classList.remove('has-custom-bg');
    document.body.style.backgroundImage = '';
  }

  const logoEl = document.getElementById('storeLogoHeader');
  if (logoEl) {
    if (store.logo) {
      logoEl.src = store.logo;
      logoEl.classList.remove('hidden');
    } else {
      logoEl.classList.add('hidden');
    }
  }
}
