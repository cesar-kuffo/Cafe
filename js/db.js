/**
 * ============================================================================
 * PROYECTO: Aroma Café - Cafetería & Panadería Artesanal
 * ASIGNATURA: FrontEnd - e-actividad 3.1
 * MÓDULO: Base de Datos Transaccional (IndexedDB W3C Standard)
 * AUTOR: Equipo de Desarrollo Web
 * DESCRIPCIÓN: Motor de persistencia en cliente con IndexedDB para gestionar
 *              las reservas de mesas y pedidos especiales de la cafetería.
 * ============================================================================
 */

class AromaDatabase {
  constructor() {
    this.dbName = 'AromaCafeDB';
    this.dbVersion = 1;
    this.storeName = 'reservas';
    this.db = null;
    this.isIndexedDBSupported = 'indexedDB' in window;
  }

  /**
   * Inicializa la base de datos y crea el ObjectStore 'reservas'
   */
  async init() {
    if (!this.isIndexedDBSupported) {
      console.warn('AromaDB: IndexedDB no disponible, usando respaldo en localStorage.');
      return null;
    }

    return new Promise((resolve) => {
      const request = window.indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('AromaDB: Creando esquema de base de datos...');

        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true
          });

          store.createIndex('nombre', 'nombre', { unique: false });
          store.createIndex('fecha', 'fecha', { unique: false });
          store.createIndex('email', 'email', { unique: false });
          console.log('AromaDB: ObjectStore "reservas" creado exitosamente.');
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('AromaDB: Conexión establecida con éxito.');
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('AromaDB: Error al conectar:', event.target.error);
        resolve(null);
      };
    });
  }

  /**
   * Inserta una nueva reserva en la base de datos
   * @param {Object} reserva - Datos de la reserva
   */
  async guardar(reserva) {
    const registro = {
      ...reserva,
      fechaCreacion: new Date().toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' }),
      timestamp: Date.now()
    };

    if (this.db) {
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const request = store.add(registro);

          request.onsuccess = () => resolve(request.result);
          request.onerror = (e) => reject(e.target.error);
        } catch {
          resolve(this._guardarEnLocalStorage(registro));
        }
      });
    } else {
      return Promise.resolve(this._guardarEnLocalStorage(registro));
    }
  }

  /**
   * Lista todas las reservas almacenadas
   */
  async listar() {
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const transaction = this.db.transaction([this.storeName], 'readonly');
          const store = transaction.objectStore(this.storeName);
          const request = store.getAll();

          request.onsuccess = () => {
            const ordenados = request.result.sort((a, b) => b.timestamp - a.timestamp);
            resolve(ordenados);
          };

          request.onerror = () => resolve(this._listarDeLocalStorage());
        } catch {
          resolve(this._listarDeLocalStorage());
        }
      });
    } else {
      return Promise.resolve(this._listarDeLocalStorage());
    }
  }

  /**
   * Elimina una reserva por ID
   */
  async eliminar(id) {
    const numId = Number(id);
    if (this.db) {
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const request = store.delete(numId);
          request.onsuccess = () => resolve(true);
          request.onerror = (e) => reject(e.target.error);
        } catch {
          resolve(this._eliminarDeLocalStorage(numId));
        }
      });
    } else {
      return Promise.resolve(this._eliminarDeLocalStorage(numId));
    }
  }

  /**
   * Vacía toda la tabla de reservas
   */
  async limpiar() {
    if (this.db) {
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const request = store.clear();
          request.onsuccess = () => resolve(true);
          request.onerror = (e) => reject(e.target.error);
        } catch {
          localStorage.removeItem('aroma_reservas');
          resolve(true);
        }
      });
    } else {
      localStorage.removeItem('aroma_reservas');
      return Promise.resolve(true);
    }
  }

  /**
   * Siembra 3 reservas de prueba para facilitar la revisión del evaluador
   */
  async sembrarDatosEjemplo() {
    const ejemplos = [
      {
        nombre: 'Valeria Gómez',
        telefono: '+58 412 8765432',
        email: 'valeria.gomez@gmail.com',
        personas: '2 personas',
        fechaReserva: '2026-11-02',
        horaReserva: '16:30',
        zona: 'Terraza al aire libre',
        notas: 'Tarde de café y degustación de tarta de frutos rojos.'
      },
      {
        nombre: 'Marcos Rivas',
        telefono: '+58 414 1122334',
        email: 'mrivas@empresa.com',
        personas: '4 personas',
        fechaReserva: '2026-11-03',
        horaReserva: '09:00',
        zona: 'Salón Principal',
        notas: 'Desayuno de trabajo corporativo y degustación de café.'
      },
      {
        nombre: 'Daniela y Santiago',
        telefono: '+58 424 9988776',
        email: 'daniela.s@hotmail.com',
        personas: '2 personas',
        fechaReserva: '2026-11-04',
        horaReserva: '17:00',
        zona: 'Rincón de Lectura',
        notas: 'Mesa tranquila junto a la ventana para café filtrado Chemex.'
      }
    ];

    for (const item of ejemplos) {
      await this.guardar(item);
    }
  }

  /* ---------------- MÉTODOS LOCALSTORAGE FALLBACK ---------------- */
  _guardarEnLocalStorage(reg) {
    const lista = this._listarDeLocalStorage();
    const id = lista.length > 0 ? Math.max(...lista.map(i => i.id || 0)) + 1 : 1;
    reg.id = id;
    lista.push(reg);
    localStorage.setItem('aroma_reservas', JSON.stringify(lista));
    return id;
  }

  _listarDeLocalStorage() {
    try {
      const data = localStorage.getItem('aroma_reservas');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  _eliminarDeLocalStorage(id) {
    let lista = this._listarDeLocalStorage();
    lista = lista.filter(item => item.id !== id);
    localStorage.setItem('aroma_reservas', JSON.stringify(lista));
    return true;
  }
}

// Instancia global
window.dbManager = new AromaDatabase();
