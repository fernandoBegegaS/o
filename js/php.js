
async function apiGet(url) {
  const resp = await fetch(url, { method: 'GET', credentials: 'include' });
  return resp.json();
}

async function apiPost(url, data) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  });
  return resp.json();
}

let resourcesData = [];

async function registerUser(nombre, email, password) {
  if (!nombre || !email || !password) {
    return { success: false, message: 'Todos los campos son obligatorios.' };
  }
  try {
    const result = await apiPost('api/register.php', {
      nombre: nombre.trim(),
      email: email.trim(),
      password: password.trim()
    });
    return result;
  } catch (e) {
    console.error('Error en registerUser:', e);
    return { success: false, message: 'Error de red o servidor.' };
  }
}

async function loginUser(email, password) {
  if (!email || !password) {
    return { success: false, message: 'Ambos campos son obligatorios.' };
  }
  try {
    const result = await apiPost('api/login.php', {
      email: email.trim(),
      password: password.trim()
    });
    if (result.success) {
      localStorage.setItem('userName', result.user.nombre);
    }
    return result;
  } catch (e) {
    console.error('Error en loginUser:', e);
    return { success: false, message: 'Error de red o servidor.' };
  }
}

async function getResources() {
  try {
    const result = await apiGet('api/resources.php');
    return result;
  } catch (e) {
    console.error('Error en getResources:', e);
    return { success: false, message: 'Error de red o servidor.' };
  }
}

async function getReservations() {
  try {
    const result = await apiGet('api/reservations.php');
    return result;
  } catch (e) {
    console.error('Error en getReservations:', e);
    return { success: false, message: 'Error de red o servidor.' };
  }
}

async function createReservation(recursoId, fecha, numPersonas, numDias) {
  if (!recursoId || !fecha) {
    return { success: false, message: 'Recurso y fecha son obligatorios.' };
  }
  try {
    const result = await apiPost('api/reservations.php', {
      recurso_id: recursoId,
      fecha: fecha,
      num_personas: numPersonas,
      num_dias: numDias
    });
    return result;
  } catch (e) {
    console.error('Error en createReservation:', e);
    return { success: false, message: 'Error de red o servidor.' };
  }
}

async function cancelReservation(reservaId) {
  if (!reservaId) {
    return { success: false, message: 'ID de reserva no proporcionado.' };
  }
  try {
    const result = await apiPost('api/cancel_reservations.php', {
      reserva_id: reservaId
    });
    return result;
  } catch (e) {
    console.error('Error en cancelReservation:', e);
    return { success: false, message: 'Error de red o servidor.' };
  }
}

function renderResources(resources) {
  resourcesData = resources;
  const sections      = document.querySelectorAll('main section');
  const tableBody     = sections[0]?.querySelector('tbody');
  const selectRecurso = sections[1]?.querySelector('select');
  if (!tableBody || !selectRecurso) return;

  tableBody.innerHTML = '';
  selectRecurso.innerHTML = '<option value="">-- Seleccione --</option>';

  resources.forEach(res => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${res.nombre}</td>
      <td>${res.tipo_nombre}</td>
      <td>${res.horario || ''}</td>
      <td>${res.capacidad}</td>
      <td>${res.precio} €</td>
    `;
    tableBody.appendChild(row);

    const opt = document.createElement('option');
    opt.value = res.id;
    opt.textContent = res.nombre;
    selectRecurso.appendChild(opt);
  });
}

function renderReservations(reservas) {
  const sections = document.querySelectorAll('main section');
  const tbody = sections[2]?.querySelector('tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  reservas.forEach(res => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${res.recurso_nombre}</td>
      <td>${res.fecha_reserva}</td>
      <td>${res.num_personas}</td>
      <td>${res.costo_total} €</td>
      <td>${res.estado}</td>
      <td><button onclick="onCancelarClick(${res.id})">Cancelar</button></td>
    `;
    tbody.appendChild(row);
  });
}

function renderUserName() {
  const spanUser = document.querySelector('main > p span');
  if (spanUser) {
    spanUser.textContent = localStorage.getItem('userName') || '';
  }
}

function getReservationForm() {
  const select = document.querySelector('form select');
  return select ? select.closest('form') : null;
}

function updateCostDisplay() {
  const form = getReservationForm();
  if (!form) return;                       

  const select = form.querySelector('select');
  const [persInput, diasInput] = form.querySelectorAll('input[type="number"]');
  if (!select || !persInput || !diasInput) return;

  const resourceId = select.value;
  const numPers = parseInt(persInput.value, 10) || 0;
  const numDias = parseInt(diasInput.value, 10) || 0;

  let text = '';
  if (resourceId && numPers > 0 && numDias > 0) {
    const resource = resourcesData.find(r => String(r.id) === resourceId);
    if (resource) {
      const cost = resource.precio * numPers * numDias;
      text = `Coste estimado: ${cost.toFixed(2)} €`;
    }
  }

  let display = form.querySelector('p[role="cost"]');
  if (!display) {
    display = document.createElement('p');
    display.setAttribute('role', 'cost');
    const btnSubmit = form.querySelector('button[type="submit"]');
    btnSubmit?.before(display);
  }
  display.textContent = text;
}

function setupCostCalc() {
  const form = getReservationForm();
  if (!form) return;
  const select = form.querySelector('select');
  const inputs = form.querySelectorAll('input[type="number"]');
  if (!select) return;

  select.addEventListener('change', updateCostDisplay);
  inputs.forEach(i => i.addEventListener('input', updateCostDisplay));
}

async function handleRegister(event) {
  event.preventDefault();
  const nombre   = document.querySelector('input[name="nombre"]').value;
  const email    = document.querySelector('input[name="email"]').value;
  const password = document.querySelector('input[name="password"]').value;
  const resp = await registerUser(nombre, email, password);
  if (resp.success) {
    alert('Registro exitoso. Ahora puedes iniciar sesión.');
    window.location.href = 'reservas.php';
  } else {
    alert('Error al registrar: ' + resp.message);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const email    = document.querySelector('input[name="email"]').value;
  const password = document.querySelector('input[name="password"]').value;
  const resp = await loginUser(email, password);
  if (resp.success) {
    window.location.href = 'reservas.php';
  } else {
    alert('Error en el login: ' + resp.message);
  }
}

async function initDashboard() {
  renderUserName();

  const dataRec = await getResources();
  if (dataRec.success) {
    renderResources(dataRec.resources);
    setupCostCalc();
  } else {
    console.error('Error al obtener recursos:', dataRec.message);
  }

  const dataRes = await getReservations();
  if (dataRes.success) {
    renderReservations(dataRes.reservas);
  } else {
    console.error('Error al obtener reservas:', dataRes.message);
  }
}

function onReservarClick(recursoId) {
  const form = getReservationForm();
  if (!form) return;

  const selectRecurso = form.querySelector('select');
  const fechaInput    = form.querySelector('input[type="date"]');
  if (selectRecurso && fechaInput) {
    selectRecurso.value = recursoId;
    fechaInput.scrollIntoView({ behavior: 'smooth' });
    fechaInput.focus();
    updateCostDisplay();
  }
}

async function onCancelarClick(reservaId) {
  if (!confirm('¿Seguro que deseas cancelar la reserva?')) return;
  const resp = await cancelReservation(reservaId);
  if (resp.success) {
    alert('Reserva cancelada!');
    const dataRes = await getReservations();
    if (dataRes.success) {
      renderReservations(dataRes.reservas);
    }
  } else {
    alert('No se pudo cancelar: ' + resp.message);
  }
}

async function handleNewReservation(event) {
  event.preventDefault();
  const form = getReservationForm();
  if (!form) return;

  const select = form.querySelector('select');
  const fecha  = form.querySelector('input[type="date"]').value;
  const [persInput, diasInput] = form.querySelectorAll('input[type="number"]');
  const numPers = parseInt(persInput.value, 10);
  const numDias = parseInt(diasInput.value, 10);

  if (!select.value) {
    alert('Por favor selecciona un recurso.');
    return;
  }

  const resp = await createReservation(select.value, fecha, numPers, numDias);
  if (resp.success) {
    alert('Reserva exitosa (ID ' + resp.reserva.id + ')');
    const dataRes = await getReservations();
    if (dataRes.success) {
      renderReservations(dataRes.reservas);
    }
  } else {
    alert('Error al reservar: ' + resp.message);
  }
}

function handleLogout() {
  logoutUser();
}

