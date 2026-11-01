/**
 * ============================================================================
 * PROYECTO: Aroma Café - Cafetería & Panadería Artesanal
 * ASIGNATURA: FrontEnd - e-actividad 3.1
 * MÓDULO: Controlador del Formulario de Reservas & IndexedDB
 * AUTOR: Equipo de Desarrollo Web
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('bookingForm');
  const alertSuccess = document.getElementById('alertSuccess');
  const alertError = document.getElementById('alertError');
  const submitBtn = document.getElementById('submitBtn');

  if (!bookingForm) return;

  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    ocultarAlertas();
    limpiarErrores();

    // Extraer campos del formulario
    const nombre = document.getElementById('nombre')?.value.trim();
    const telefono = document.getElementById('telefono')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const personas = document.getElementById('personas')?.value;
    const fechaReserva = document.getElementById('fechaReserva')?.value;
    const horaReserva = document.getElementById('horaReserva')?.value;
    const zona = document.getElementById('zona')?.value;
    const notas = document.getElementById('notas')?.value.trim();

    let esValido = true;

    if (!nombre || nombre.length < 3) {
      mostrarError('nombre', 'Por favor ingresa tu nombre completo (mínimo 3 caracteres).');
      esValido = false;
    }

    if (!telefono || telefono.length < 7) {
      mostrarError('telefono', 'Por favor ingresa un número de teléfono de contacto válido.');
      esValido = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      mostrarError('email', 'Ingresa una dirección de correo electrónico válida.');
      esValido = false;
    }

    if (!personas) {
      mostrarError('personas', 'Selecciona la cantidad de comensales.');
      esValido = false;
    }

    if (!fechaReserva) {
      mostrarError('fechaReserva', 'Selecciona la fecha deseada para la reserva.');
      esValido = false;
    }

    if (!horaReserva) {
      mostrarError('horaReserva', 'Selecciona la hora de tu visita.');
      esValido = false;
    }

    if (!zona) {
      mostrarError('zona', 'Selecciona la zona o ambiente de tu preferencia.');
      esValido = false;
    }

    if (!esValido) {
      if (alertError) {
        alertError.innerText = '⚠️ Por favor verifica los campos resaltados antes de enviar la reserva.';
        alertError.classList.remove('hidden');
      }
      return;
    }

    const originalBtn = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Registrando reserva...</span>';

    try {
      const nuevaReserva = {
        nombre,
        telefono,
        email,
        personas,
        fechaReserva,
        horaReserva,
        zona,
        notas: notas || 'Sin peticiones especiales'
      };

      const recordId = await window.dbManager.guardar(nuevaReserva);

      bookingForm.reset();

      // Actualizar la tabla de reservas en tiempo real si está en la página
      if (typeof window.cargarReservas === 'function') {
        await window.cargarReservas();
      }

      if (alertSuccess) {
        alertSuccess.innerHTML = `
          <div>
            <strong>¡Mesa reservada con éxito! (Ticket #${recordId} en IndexedDB)</strong>
            <p style="margin: 0.3rem 0 0 0; font-size: 0.92rem;">
              Tu reserva ha sido almacenada de forma persistente y ya está visible en la tabla inferior.
            </p>
          </div>
        `;
        alertSuccess.classList.remove('hidden');
      }
    } catch (err) {
      console.error('Error al guardar reserva:', err);
      if (alertError) {
        alertError.innerText = '❌ Ocurrió un error al registrar la reserva en la base de datos.';
        alertError.classList.remove('hidden');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtn;
    }
  });

  function mostrarError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    const group = el.closest('.form-group');
    if (group) {
      group.classList.add('has-error');
      const err = group.querySelector('.error-message');
      if (err) err.innerText = msg;
    }
  }

  function limpiarErrores() {
    document.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
  }

  function ocultarAlertas() {
    if (alertSuccess) alertSuccess.classList.add('hidden');
    if (alertError) alertError.classList.add('hidden');
  }
});
