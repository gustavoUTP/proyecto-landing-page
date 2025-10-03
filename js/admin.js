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

    // 1. Contador total
    document.getElementById("total-suscriptores").textContent = data.length;

    // 2. Mostrar tabla inicial con paginación
    mostrarTablaPaginada();

    // 3. Gráfico por plan
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

// 🔎 Filtro en tiempo real
document.addEventListener("DOMContentLoaded", () => {
  const buscador = document.getElementById("buscador");
  buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase();

    if (texto === "") {
      // si está vacío, mostramos todos
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
