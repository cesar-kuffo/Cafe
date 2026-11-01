/**
 * ============================================================================
 * PROYECTO: Aroma Café - Cafetería & Panadería Artesanal
 * ASIGNATURA: FrontEnd - e-actividad 3.1
 * MÓDULO: Visualizador y Administrador de Reservas (IndexedDB)
 * AUTOR: Equipo de Desarrollo Web
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  const tableBody = document.getElementById('recordsTableBody');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const recordCountBadge = document.getElementById('recordCountBadge');
  const btnSeedData = document.getElementById('btnSeedData');
  const btnClearData = document.getElementById('btnClearData');
  const btnExportJSON = document.getElementById('btnExportJSON');

  let todasLasReservas = [];

  if (window.dbManager) {
    await window.dbManager.init();
    await cargarReservas();
  }

  async function cargarReservas() {
    try {
      todasLasReservas = await window.dbManager.listar();
      renderizarTabla(todasLasReservas);
    } catch (err) {
      console.error('Error al listar reservas:', err);
    }
  }

  // Exponer para actualización en tiempo real desde el formulario
  window.cargarReservas = cargarReservas;

  function renderizarTabla(lista) {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (recordCountBadge) {
      recordCountBadge.innerText = `${lista.length} reserva(s)`;
    }

    if (lista.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    lista.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="badge-id">#${item.id}</span></td>
        <td><strong>${escaparHTML(item.nombre)}</strong></td>
        <td>${escaparHTML(item.telefono)}</td>
        <td><a href="mailto:${escaparHTML(item.email)}">${escaparHTML(item.email)}</a></td>
        <td><span class="badge-guests">👥 ${escaparHTML(item.personas)}</span></td>
        <td>📅 ${escaparHTML(item.fechaReserva)} (${escaparHTML(item.horaReserva)})</td>
        <td><span style="font-weight: 600; color: #784825;">☕ ${escaparHTML(item.zona)}</span></td>
        <td style="max-width: 200px; font-size: 0.88rem; color: #634b3e;">${escaparHTML(item.notas)}</td>
        <td>
          <button class="btn-delete-row" data-id="${item.id}" title="Eliminar reserva">
            🗑️ Cancelar
          </button>
        </td>
      `;

      const deleteBtn = tr.querySelector('.btn-delete-row');
      deleteBtn.addEventListener('click', async () => {
        if (confirm(`¿Deseas cancelar la reserva #${item.id} de ${item.nombre}?`)) {
          await window.dbManager.eliminar(item.id);
          await cargarReservas();
        }
      });

      tableBody.appendChild(tr);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtradas = todasLasReservas.filter(r =>
        (r.nombre && r.nombre.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.telefono && r.telefono.toLowerCase().includes(q)) ||
        (r.zona && r.zona.toLowerCase().includes(q)) ||
        (r.notas && r.notas.toLowerCase().includes(q))
      );
      renderizarTabla(filtradas);
    });
  }

  if (btnSeedData) {
    btnSeedData.addEventListener('click', async () => {
      btnSeedData.disabled = true;
      btnSeedData.innerText = 'Cargando datos...';
      await window.dbManager.sembrarDatosEjemplo();
      await cargarReservas();
      btnSeedData.disabled = false;
      btnSeedData.innerText = '🌱 Cargar Reservas de Ejemplo';
    });
  }

  if (btnClearData) {
    btnClearData.addEventListener('click', async () => {
      if (confirm('¿Estás seguro de que deseas vaciar toda la lista de reservas?')) {
        await window.dbManager.limpiar();
        await cargarReservas();
      }
    });
  }

  if (btnExportJSON) {
    btnExportJSON.addEventListener('click', () => {
      if (todasLasReservas.length === 0) {
        alert('No hay reservas registradas para exportar.');
        return;
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(todasLasReservas, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `aroma_cafe_reservas_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  }

  function escaparHTML(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.innerText = texto;
    return div.innerHTML;
  }
});
