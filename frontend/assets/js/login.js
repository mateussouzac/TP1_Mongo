const API_URL = 'http://localhost:3000/api';

function switchTab(tab) {
  document.getElementById('form-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('form-register').style.display = tab === 'register' ? 'block' : 'none';
  document.querySelectorAll('.tab-btn').forEach((button, index) => {
    const active = (index === 0 && tab === 'login') || (index === 1 && tab === 'register');
    button.classList.toggle('active', active);
  });
}

async function apiRequest(path, data) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || 'Não foi possível concluir a operação.');
  }

  return body;
}

function saveSession(usuario) {
  const initials = `${usuario.nome?.[0] || ''}${usuario.sobrenome?.[0] || ''}`.toUpperCase() || 'PC';
  localStorage.setItem('puccommerce_user', JSON.stringify({ ...usuario, initials }));
}

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-pass').value.trim();

  if (!email || !senha) {
    showToast('Preencha e-mail e senha.', 'error');
    return;
  }

  try {
    const { usuario } = await apiRequest('/auth/login', { email, senha });
    saveSession(usuario);
    showToast('Login realizado com sucesso.');
    window.location.href = 'index.html';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function doRegister() {
  const nome = document.getElementById('reg-name').value.trim();
  const sobrenome = document.getElementById('reg-surname').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const telefone = document.getElementById('reg-phone').value.trim();
  const senha = document.getElementById('reg-pass').value.trim();

  if (!nome || !email || !senha) {
    showToast('Preencha todos os campos obrigatórios.', 'error');
    return;
  }

  if (senha.length < 8) {
    showToast('A senha precisa ter no mínimo 8 caracteres.', 'error');
    return;
  }

  try {
    const { usuario } = await apiRequest('/auth/register', {
      nome,
      sobrenome,
      email,
      telefone,
      senha,
    });
    saveSession(usuario);
    showToast('Conta criada com sucesso.');
    window.location.href = 'index.html';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function doLogout() {
  localStorage.removeItem('puccommerce_user');
  window.location.href = 'login.html';
}

function showForgot(event) {
  if (event) event.preventDefault();
  openModal('modal-forgot');
}

async function sendForgot() {
  const email = document.getElementById('forgot-email').value.trim();

  if (!email) {
    showToast('Informe o e-mail cadastrado.', 'error');
    return;
  }

  try {
    const data = await apiRequest('/auth/forgot-password', { email });
    document.getElementById('reset-area').classList.add('active');
    document.getElementById('reset-token-preview').textContent = data.resetToken;
    document.getElementById('reset-token').value = data.resetToken;
    showToast('Código de recuperação gerado.');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function resetPassword() {
  const email = document.getElementById('forgot-email').value.trim();
  const token = document.getElementById('reset-token').value.trim();
  const novaSenha = document.getElementById('reset-pass').value.trim();

  if (!email || !token || !novaSenha) {
    showToast('Informe e-mail, código e nova senha.', 'error');
    return;
  }

  try {
    await apiRequest('/auth/reset-password', { email, token, novaSenha });
    closeModal('modal-forgot');
    switchTab('login');
    document.getElementById('login-email').value = email;
    document.getElementById('login-pass').value = '';
    showToast('Senha alterada com sucesso.');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show toast-${type}`;
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}
