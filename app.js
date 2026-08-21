const SUPABASE_URL = 'https://pfrenmpopmbdyihxndyp.supabase.co/rest/v1';
const SUPABASE_KEY = 'sb_publishable_3hxF_wYNWJngxDtfOxesnA_ZMoLsjIJ';
const TABLE = 'accounts';
const DEMO_ACCOUNTS = [
  ['Gmail 22mimundo1', '22mimundo1@gmail.com', 'CHAVEZ26.1.'],
  ['Gmail Atenea220106', 'Atenea220106@gmail.com', 'ARmando01'],
  ['Gmail Jack22062601', 'Jack22062601@gmail.com', 'BNeH!k76-H4dDUQ'],
  ['Gmail LENINedu012206', 'LENINedu012206@gmail.com', 'ARmando01.'],
  ['Gmail leninedu012206', 'leninedu012206@gmail.com', 'ARmando01.'],
  ['Gmail teliorjack0', 'teliorjack0@gmail.com', 'ARmando01.1']
];

const $ = (id) => document.getElementById(id);
let accounts = [];
const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' };

function showDashboard() { $('login-view').classList.add('hidden'); $('dashboard-view').classList.remove('hidden'); loadAccounts(); }
function setMessage(text, error = false) { const el = $('app-message'); el.textContent = text; el.className = `message${error ? ' error' : ''}`; }
function sorted(list) { return [...list].sort((a,b) => a.name.localeCompare(b.name, 'es', {sensitivity:'base'})); }
function render() {
  accounts = sorted(accounts); $('account-count').textContent = accounts.length;
  $('account-list').innerHTML = accounts.length ? accounts.map((a,i) => `<article class="account-card"><div><h3 class="account-name">${escapeHtml(a.name)}</h3><p class="account-email">${escapeHtml(a.email)}</p><p class="account-password">Contraseña: <span>${escapeHtml(a.password)}</span></p></div><button class="copy-button" data-index="${i}" type="button">Copiar</button></article>`).join('') : '<p class="muted">No hay cuentas todavía.</p>';
  document.querySelectorAll('.copy-button').forEach(btn => btn.addEventListener('click', async () => { const a=accounts[Number(btn.dataset.index)]; await navigator.clipboard.writeText(`${a.email}\n${a.password}`); btn.textContent='Copiado'; setTimeout(()=>btn.textContent='Copiar',1200); }));
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
async function loadAccounts() {
  setMessage('Cargando…');
  try { const res = await fetch(`${SUPABASE_URL}/${TABLE}?select=id,name,email,password&order=name.asc`, {headers}); if (!res.ok) throw new Error('Supabase no está configurado todavía.'); accounts = await res.json(); if (!accounts.length) await seedAccounts(); render(); setMessage('Conectado a Supabase.'); }
  catch (e) { accounts = DEMO_ACCOUNTS.map(([name,email,password],i)=>({id:`demo-${i}`,name,email,password})); render(); setMessage(`${e.message} Mostrando los datos iniciales en modo local.`, true); }
}
async function seedAccounts() { const payload = DEMO_ACCOUNTS.map(([name,email,password])=>({name,email,password})); const res=await fetch(`${SUPABASE_URL}/${TABLE}`,{method:'POST',headers,body:JSON.stringify(payload)}); if(!res.ok) throw new Error('No se pudieron guardar los datos iniciales.'); accounts=payload; }
async function addAccount(data) { const res=await fetch(`${SUPABASE_URL}/${TABLE}`,{method:'POST',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify(data)}); if(!res.ok) throw new Error('No se pudo guardar la cuenta.'); return res.json(); }

$('login-form').addEventListener('submit', e => { e.preventDefault(); if ($('login-user').value === 'Edward01' && $('login-password').value === 'ARmando01') { sessionStorage.setItem('bots-auth','1'); showDashboard(); } else $('login-error').textContent='Usuario o contraseña incorrectos.'; });
$('logout-button').addEventListener('click', () => { sessionStorage.removeItem('bots-auth'); location.reload(); });
$('add-button').addEventListener('click', () => { $('account-form').reset(); $('form-error').textContent=''; $('account-dialog').showModal(); });
function closeDialog(){ $('account-dialog').close(); }
$('close-dialog').addEventListener('click', closeDialog); $('cancel-dialog').addEventListener('click', closeDialog);
$('account-form').addEventListener('submit', async e => { e.preventDefault(); const data={name:$('account-name').value.trim(),email:$('account-email').value.trim(),password:$('account-password').value}; try { const saved=await addAccount(data); accounts.push(saved[0] || data); closeDialog(); render(); setMessage('Cuenta guardada correctamente.'); } catch(err) { accounts.push({...data,id:`local-${Date.now()}`}); closeDialog(); render(); setMessage(`${err.message} Se agregó solo en esta sesión local.`, true); } });
if (sessionStorage.getItem('bots-auth') === '1') showDashboard();
