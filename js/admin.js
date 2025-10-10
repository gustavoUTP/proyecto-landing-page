let suscripcionesData = [];
let suscripcionesFiltrados = [];
let paginaActual = 1;
const porPagina = 10;
let graficoActual = 1;
const totalGraficos = 2;

// Función principal que carga los datos y renderiza el dashboard
async function cargarDashboard() {
    try {
        // Fetch de datos de la API
        const res = await fetch("http://localhost:3001/api/suscripciones");
        const data = await res.json();
        suscripcionesData = data;
        suscripcionesFiltrados = data;

        // Mostrar total de suscriptores y tabla
        document.getElementById("total-suscriptores").textContent = data.length;
        mostrarTablaPaginada();

        // Creación de gráficos
        crearGraficoPlanes(data);
        crearGraficoNuevosSuscriptores(data);

        // Inicializar el carrusel de gráficos
        alternarGrafico(1);

    } catch (err) {
        console.error("Error cargando suscripciones:", err);
    }
}

// Función para obtener el conteo de suscripciones por plan
function obtenerConteoPlanes(data) {
    const conteoPlanes = { basico: 0, intermedio: 0, premium: 0 };
    data.forEach(s => {
        if (conteoPlanes[s.plan] !== undefined) conteoPlanes[s.plan]++;
    });
    return conteoPlanes;
}

// Función para crear el Gráfico de Barras
function crearGraficoPlanes(data) {
    const conteo = obtenerConteoPlanes(data);

    const ctx = document.getElementById("chartPlanes").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Básico", "Intermedio", "Premium"],
            datasets: [{
                label: "Cantidad de Suscripciones",
                data: [conteo.basico, conteo.intermedio, conteo.premium],
                backgroundColor: ["#3498db", "#f39c12", "#2ecc71"]
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });
}

// Función para crear el Gráfico de Pastel
function crearGraficoNuevosSuscriptores(data) {
    const conteo = obtenerConteoPlanes(data);

    const ctx = document.getElementById("chartNuevosSuscriptores").getContext("2d");
    new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Básico", "Intermedio", "Premium"],
            datasets: [{
                label: "Distribución por Plan",
                data: [conteo.basico, conteo.intermedio, conteo.premium],
                backgroundColor: [
                    '#3498db',
                    '#f39c12',
                    '#2ecc71'
                ],
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            aspectRatio: 2,
            plugins: {
                legend: { position: 'bottom' },
                title: { display: false }
            }
        }
    });
}


// --- LÓGICA DEL CARRUSEL DE GRÁFICOS ---
// Función que maneja la alternancia de gráficos en el carrusel
function alternarGrafico(index) {
    const pages = [
        document.getElementById('chart-page-1'),
        document.getElementById('chart-page-2')
    ];
    const title = document.getElementById('chart-title');
    const indexSpan = document.getElementById('chart-index');

    pages.forEach(p => p.classList.add('hidden'));

    const currentPage = document.getElementById(`chart-page-${index}`);
    if (currentPage) {
        currentPage.classList.remove('hidden');
    }

    if (index === 1) {
        title.textContent = "Total de Suscripciones por Plan";
    } else if (index === 2) {
        title.textContent = "Monto Total por Suscripcion";
    }

    indexSpan.textContent = `${index} / ${totalGraficos}`;
    graficoActual = index;
}

// Evento para retroceder en el carrusel de gráficos
document.getElementById("prev-chart").addEventListener("click", () => {
    if (graficoActual > 1) {
        alternarGrafico(graficoActual - 1);
    }
});

// Evento para avanzar en el carrusel de gráficos
document.getElementById("next-chart").addEventListener("click", () => {
    if (graficoActual < totalGraficos) {
        alternarGrafico(graficoActual + 1);
    }
});

// --- FUNCIÓN PARA RECORRER DATOS DE TABLA ---
// Función de ejemplo para iterar sobre las filas de la tabla
function recorrerDatosTabla() {
    const tabla = document.getElementById("tabla-suscripciones");
    const filas = tabla.querySelectorAll("tr");

    filas.forEach((fila, index) => {
        const celdas = fila.querySelectorAll("td");
        if (celdas.length > 0) {
            console.log(`Fila ${index + 1}: Código: ${celdas[0].textContent}, Nombre: ${celdas[1].textContent}, Plan: ${celdas[4].textContent}`);
        }
    });
}

// Función para renderizar los datos de la tabla con paginación
function mostrarTablaPaginada() {
    const inicio = (paginaActual - 1) * porPagina;
    const fin = inicio + porPagina;
    const paginaDatos = suscripcionesFiltrados.slice(inicio, fin);

    const tabla = document.getElementById("tabla-suscripciones");
    tabla.innerHTML = "";

    // Rellenar la tabla 
    paginaDatos.forEach((s, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="border p-2">${s.codigo || "-"}</td>
            <td class="border p-2">${s.nombreApellido}</td>
            <td class="border p-2">${s.correo}</td>
            <td class="border p-2">${s.telefono}</td>
            <td class="border p-2">${s.plan}</td>
            <td class="border p-2">${new Date(s.fechaRegistro).toLocaleString()}</td>
        `;

        // evento para detalles
        row.addEventListener("click", () => mostrarDetalleSus(s));
        row.classList.add("hover:bg-gray-100", "cursor-pointer", "transition");

        tabla.appendChild(row);
    });

    const total = suscripcionesFiltrados.length;
    const mostrandoInicio = total > 0 ? inicio + 1 : 0;
    const mostrandoFin = Math.min(fin, total);
    document.getElementById("info-paginacion").textContent =
        `Mostrando ${mostrandoInicio} - ${mostrandoFin} de ${total}`;
}

//evento para mostrar detalles
function mostrarDetalleSus(s) {
    const info = document.getElementById("info-sus");
    const detalle = document.getElementById("detalle-sus");
    info.innerHTML = `
        <p><strong>Código:</strong> ${s.codigo}</p>
        <p><strong>Nombre:</strong> ${s.nombreApellido}</p>
        <p><strong>Correo:</strong> ${s.correo}</p>
        <p><strong>Teléfono:</strong> ${s.telefono}</p>
        <p><strong>Plan:</strong> ${s.plan}</p>
        <p><strong>Precio:</strong> $${s.precio || obtenerPrecio(s.plan)}</p>
        <p><strong>Fecha de Registro:</strong> ${new Date(s.fechaRegistro).toLocaleString()}</p>
    `;
    detalle.classList.remove("hidden");
}

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

// Búsqueda en tiempo real
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

// Lógica de navegación y autenticación
const userBtn = document.getElementById("user-menu-button");
const dropdown = document.getElementById("user-dropdown");

// Manejo del menú desplegable del usuario
if (userBtn) {
    userBtn.addEventListener("click", () => {
        dropdown.classList.toggle("hidden");
    });

    const logoutBtn = document.getElementById("logout-btn");
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("usuario");
        window.location.href = "../docs/index.html";
    });

    window.addEventListener("click", (e) => {
        if (!userBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add("hidden");
        }
    });
}

let orden = { columna: null, asc: true };
let filtrosPlanes = ["basico", "intermedio", "premium"];
let filtroFechas = { inicio: null, fin: null };

function soloFecha(d) {
    const f = new Date(d);
    return new Date(f.getFullYear(), f.getMonth(), f.getDate());
}

// Manejo de eventos de click en las cabeceras de la tabla
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
// Aplicar filtros de planes
document.getElementById("aplicar-plan").addEventListener("click", () => {
    const checks = document.querySelectorAll("#modal-planes input[type=checkbox]");
    filtrosPlanes = Array.from(checks)
        .filter(c => c.checked)
        .map(c => c.value);
    document.getElementById("modal-planes").classList.add("hidden");
    aplicarFiltrosYOrden();
});

// Cerrar modal de planes
document.getElementById("cerrar-plan").addEventListener("click", () => {
    document.getElementById("modal-planes").classList.add("hidden");
});

// --- MODAL FECHAS ---
// Aplicar filtros de fechas
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

// Cerrar modal de fechas
document.getElementById("cerrar-fecha").addEventListener("click", () => {
    document.getElementById("modal-fechas").classList.add("hidden");
});


// Filtros y Ordenar Datos
function aplicarFiltrosYOrden() {
    let datos = suscripcionesData.filter(s => filtrosPlanes.includes(s.plan));
    if (filtroFechas.inicio || filtroFechas.fin) {
        datos = datos.filter(s => {
            const f = soloFecha(s.fechaRegistro);
            return (!filtroFechas.inicio || f >= filtroFechas.inicio) &&
                (!filtroFechas.fin || f <= filtroFechas.fin);
        });
    }

    // Aplicar ordenamiento
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
            } else if (orden.columna === "fecha") {
                v1 = new Date(a.fechaRegistro).getTime();
                v2 = new Date(b.fechaRegistro).getTime();
            }
            if (v1 < v2) return orden.asc ? -1 : 1;
            if (v1 > v2) return orden.asc ? 1 : -1;
            return 0;
        });
    }

    // Actualizar datos filtrados y reiniciar paginación
    suscripcionesFiltrados = datos;
    paginaActual = 1;
    mostrarTablaPaginada();
}

// --- EXPORTAR TABLA A PDF ---
document.getElementById("btn-pdf").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título principal
    doc.setFontSize(16);
    doc.text("Recuento de Suscripciones", 14, 20);

    // Generar tabla a partir de los datos filtrados actuales (toda la lista, no solo la página)
    const datos = suscripcionesFiltrados.map((s, index) => [
        s.codigo || index + 1,
        s.nombreApellido,
        s.correo,
        s.telefono,
        s.plan,
        new Date(s.fechaRegistro).toLocaleString()
    ]);

    // Cabecera de la tabla
    const cabecera = ["#", "Nombre", "Correo", "Teléfono", "Plan", "Fecha"];

    // Insertar tabla con autoTable
    doc.autoTable({
        head: [cabecera],
        body: datos,
        startY: 30,
        styles: { fontSize: 10, halign: "center" },
        headStyles: { fillColor: [66, 99, 235], textColor: 255 },
        margin: { left: 10, right: 10 },
    });

    // Total de suscripciones
    const total = datos.length;
    doc.setFontSize(12);
    doc.text(`Total de suscripciones: ${total}`, 14, doc.lastAutoTable.finalY + 10);

    // Guardar el archivo
    doc.save("recuento_suscripciones.pdf");
});
// --- EXPORTAR DATOS DEL SUSCRIPTOR ---
document.getElementById("btn-exportar-suscriptor").addEventListener("click", () => {
    const detalle = document.getElementById("info-sus");

    // Verificar si hay datos visibles
    if (!detalle || detalle.innerHTML.trim() === "") {
        alert("Primero selecciona un suscriptor de la tabla.");
        return;
    }

    // Obtener los datos del HTML
    const lineas = detalle.querySelectorAll("p");
    const datos = Array.from(lineas).map(p => p.innerText);

    // Crear el PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Detalles del Suscriptor", 14, 20);
    doc.setFontSize(12);

    let y = 35;
    datos.forEach(linea => {
        doc.text(linea, 14, y);
        y += 10;
    });

    // Guardar PDF
    doc.save("detalle_suscriptor.pdf");
});

