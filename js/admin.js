let suscripcionesData = [];      // todos los datos originales
let suscripcionesFiltrados = []; // datos que se muestran (filtrados o no)
let paginaActual = 1;
const porPagina = 10;

async function cargarDashboard() {
  try {
    const res = await fetch("http://localhost:3001/api/suscripciones");
    const data = await res.json();
    suscripcionesData = data;
    suscripcionesFiltrados = data; // al inicio mostrar todos

    // contador
    document.getElementById("total-suscriptores").textContent = data.length;

    mostrarTablaPaginada();

    // grafico
    const conteoPlanes = { basico: 0, intermedio: 0, premium: 0 };
    data.forEach(s => {
      if (conteoPlanes[s.plan] !== undefined) conteoPlanes[s.plan]++;
    });

    const ctx = document.getElementById("chartPlanes").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Básico", "Intermedio", "Premium"],
        datasets: [{
          label: "Cantidad de Suscripciones",
          data: [conteoPlanes.basico, conteoPlanes.intermedio, conteoPlanes.premium],
          backgroundColor: ["#3498db", "#f39c12", "#2ecc71"]
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });

  } catch (err) {
    console.error("Error cargando suscripciones:", err);
  }
}

// Función para mostrar tabla con paginación
function mostrarTablaPaginada() {
  const inicio = (paginaActual - 1) * porPagina;
  const fin = inicio + porPagina;
  const paginaDatos = suscripcionesFiltrados.slice(inicio, fin);

  const tabla = document.getElementById("tabla-suscripciones");
  tabla.innerHTML = "";

  paginaDatos.forEach((s, index) => {
    const row = `
      <tr>
        <td class="border p-2">${s.codigo || "-"}</td>
        <td class="border p-2">${s.nombreApellido}</td>
        <td class="border p-2">${s.correo}</td>
        <td class="border p-2">${s.telefono}</td>
        <td class="border p-2">${s.plan}</td>
        <td class="border p-2">${new Date(s.fechaRegistro).toLocaleString()}</td>
      </tr>
    `;
    tabla.innerHTML += row;
  });

  // Texto de paginación
  const total = suscripcionesFiltrados.length;
  const mostrandoInicio = total > 0 ? inicio + 1 : 0;
  const mostrandoFin = Math.min(fin, total);
  document.getElementById("info-paginacion").textContent = 
    `Mostrando ${mostrandoInicio} - ${mostrandoFin} de ${total}`;
}

// Eventos de paginación
document.getElementById("prev").addEventListener("click", () => {
  if (paginaActual > 1) {
    paginaActual--;
    mostrarTablaPaginada();
  }
});

document.getElementById("next").addEventListener("click", () => {
  if (paginaActual * porPagina < suscripcionesFiltrados.length) {
    paginaActual++;
    mostrarTablaPaginada();
  }
});

// busqueda en tiempo real
document.addEventListener("DOMContentLoaded", () => {
  const buscador = document.getElementById("buscador");
  buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase();

    if (texto === "") {
      
      suscripcionesFiltrados = suscripcionesData;
    } else {
      suscripcionesFiltrados = suscripcionesData.filter(s =>
        s.nombreApellido.toLowerCase().includes(texto) ||
        s.correo.toLowerCase().includes(texto)
      );
    }

    paginaActual = 1; 
    mostrarTablaPaginada();
  });
});

window.onload = cargarDashboard;

// navbar
const userBtn = document.getElementById("user-menu-button");
const dropdown = document.getElementById("user-dropdown");

if (userBtn) {
  userBtn.addEventListener("click", () => {
    dropdown.classList.toggle("hidden");
  });

  // Cerrar sesión
  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("usuario"); 
    window.location.href = "../docs/index.html"; 
  });

  // Cerrar dropdown si hago click fuera
  window.addEventListener("click", (e) => {
    if (!userBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });
}

let orden = { columna: null, asc: true }; 
let filtrosPlanes = ["basico", "intermedio", "premium"];
let filtroFechas = { inicio: null, fin: null };

// ignorando la hora
function soloFecha(d) {
  const f = new Date(d);
  return new Date(f.getFullYear(), f.getMonth(), f.getDate());
}

// Cabecera (event click)
document.querySelectorAll("th[data-col]").forEach(th => {
  th.addEventListener("click", () => {
    const col = th.dataset.col;

    if (col === "plan") {
      document.getElementById("modal-planes").classList.remove("hidden");
    } else if (col === "fecha") {
      document.getElementById("modal-fechas").classList.remove("hidden");
    } else {
      if (orden.columna === col) {
        orden.asc = !orden.asc;
      } else {
        orden.columna = col;
        orden.asc = true;
      }
      aplicarFiltrosYOrden();
    }
  });
});

// --- MODAL PLANES ---
document.getElementById("aplicar-plan").addEventListener("click", () => {
  const checks = document.querySelectorAll("#modal-planes input[type=checkbox]");
  filtrosPlanes = Array.from(checks)
    .filter(c => c.checked)
    .map(c => c.value);
  document.getElementById("modal-planes").classList.add("hidden");
  aplicarFiltrosYOrden();
});
document.getElementById("cerrar-plan").addEventListener("click", () => {
  document.getElementById("modal-planes").classList.add("hidden");
});

// --- MODAL FECHAS ---
document.getElementById("aplicar-fecha").addEventListener("click", () => {
  filtroFechas.inicio = document.getElementById("fecha-inicio").value 
    ? soloFecha(document.getElementById("fecha-inicio").value) 
    : null;
  filtroFechas.fin = document.getElementById("fecha-fin").value 
    ? soloFecha(document.getElementById("fecha-fin").value) 
    : null;
  document.getElementById("modal-fechas").classList.add("hidden");
  aplicarFiltrosYOrden();
});
document.getElementById("cerrar-fecha").addEventListener("click", () => {
  document.getElementById("modal-fechas").classList.add("hidden");
});


function aplicarFiltrosYOrden() {
  // aplicar filtro por planes
  let datos = suscripcionesData.filter(s => filtrosPlanes.includes(s.plan));

  // aplicar filtro por fechas 
  if (filtroFechas.inicio || filtroFechas.fin) {
    datos = datos.filter(s => {
      const f = soloFecha(s.fechaRegistro);
      return (!filtroFechas.inicio || f >= filtroFechas.inicio) &&
             (!filtroFechas.fin || f <= filtroFechas.fin);
    });
  }

  // ordenar
  if (orden.columna) {
    datos.sort((a, b) => {
      let v1, v2;
      if (orden.columna === "codigo") {
        v1 = a.codigo || "";
        v2 = b.codigo || "";
      } else if (orden.columna === "nombre") {
        v1 = a.nombreApellido.toLowerCase();
        v2 = b.nombreApellido.toLowerCase();
      } else if (orden.columna === "correo") {
        v1 = a.correo.toLowerCase();
        v2 = b.correo.toLowerCase();
      }
      if (v1 < v2) return orden.asc ? -1 : 1;
      if (v1 > v2) return orden.asc ? 1 : -1;
      return 0;
    });
  }

  suscripcionesFiltrados = datos;
  paginaActual = 1;
  mostrarTablaPaginada();
}

