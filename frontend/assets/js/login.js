function switchTab(tab) {
  document.getElementById('form-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('form-register').style.display = tab === 'register' ? 'block' : 'none';
  document.querySelectorAll('.tab-btn').forEach((b,i) => b.classList.toggle('active', (i===0 && tab==='login')||(i===1 && tab==='register')));
}
 
function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  if (!email || !pass) { showToast('Preencha e-mail e senha','error'); return; }
  window.location.href = 'index.html';
}
 
function doRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value.trim();
  if (!name || !email || !pass) { showToast('Preencha todos os campos obrigatórios','error'); return; }
  if (pass.length < 8) { showToast('A senha precisa ter no mínimo 8 caracteres','error'); return; }
  const surname = document.getElementById('reg-surname').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const initials = (name[0]+(surname?surname[0]:'X')).toUpperCase();
  state.user = { name, surname, email, phone, initials };
  updateUserUI();
  goTo('home');
  showToast('Conta criada com sucesso! Bem-vindo(a)! 🎉');
}
 
function doLogout() {
  state.user = null;
  state.cart = [];
  document.getElementById('screen-profile').classList.remove('active');
  document.getElementById('screen-login').classList.add('active');
  showToast('Até logo!');
}
 
function updateUserUI() {
  if (!state.user) return;
  const ini = state.user.initials;
  ['user-avatar','user-avatar2','user-avatar3','user-avatar4','user-avatar5','user-avatar6','profile-avatar-big'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = ini;
  });
  const hn = document.getElementById('hero-name');
  if (hn) hn.textContent = state.user.name;
}
 
function showForgot() { openModal('modal-forgot'); }
function sendForgot() {
  closeModal('modal-forgot');
  showToast('Instruções enviadas para o e-mail! 📧');
}
