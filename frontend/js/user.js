let cursosData = [];
let cursosCompletados = 0;
let cursosEnProgreso = 0;

// --- Inicialización ---
window.onload = async function () {
    await cargarPanelUsuario();
    inicializarMenuUsuario(); 
};

// --- Cargar Panel del Usuario ---
async function cargarPanelUsuario() {
    try {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario) {
            alert("Por favor, inicia sesión primero.");
            window.location.href = "../index.html";
            return;
        }

        const res = await fetch("https://proyecto-landing-page.onrender.com/api/cursos");
        const data = await res.json();

        cursosData = data;
        calcularProgreso(data);
        crearGraficoProgreso();
        mostrarCursosPorEstado(data);
    } catch (err) {
        console.error("Error cargando cursos:", err);
    }
}

// --- Mostrar Cursos Dinámicamente por Estado ---
function mostrarCursosPorEstado(cursos) {
    const contenedor = document.getElementById("contenedorCursos");
    contenedor.innerHTML = "";

    const categorias = {
        "en progreso": [],
        "completado": [],
        "pendiente": [],
        "recomendado": []
    };

    cursos.forEach(curso => {
        if (categorias[curso.estado]) {
            categorias[curso.estado].push(curso);
        }
    });

    for (const [estado, lista] of Object.entries(categorias)) {
        if (lista.length > 0) {
            const titulo =
                estado === "en progreso" ? "Cursos en Progreso" :
                estado === "completado" ? "Cursos Completados" :
                estado === "pendiente" ? "Cursos Pendientes" :
                "Cursos Recomendados";

            const seccion = document.createElement("section");
            seccion.className = "mb-16";

            const h2 = document.createElement("h2");
            h2.className = "text-2xl font-semibold mb-6 text-white";
            h2.textContent = titulo;
            seccion.appendChild(h2);

            const grid = document.createElement("div");
            grid.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8";

            lista.forEach(curso => {
                const card = document.createElement("div");
                card.className =
                    "bg-[#1A1A1A] p-6 rounded-2xl shadow-[0_0_25px_rgba(255,102,0,0.2)] hover:shadow-[0_0_35px_rgba(255,102,0,0.4)] transition transform hover:-translate-y-2";

                let extraHTML = "";

                if (estado === "en progreso") {
                    const progreso = curso.progreso || 50;
                    extraHTML = `
                        <div class="w-full bg-gray-700 rounded-full h-3 mb-3">
                            <div class="bg-[#FF6600] h-3 rounded-full" style="width: ${progreso}%;"></div>
                        </div>
                        <p class="text-sm text-gray-400 mb-4">${progreso}% completado</p>
                        <button class="bg-[#FF6600] text-white px-4 py-2 rounded-md hover:bg-[#ff8533] transition">
                            Continuar curso
                        </button>
                    `;
                } else if (estado === "completado") {
                    extraHTML = `
                        <span class="inline-block bg-[#FF6600]/20 text-[#FF6600] px-3 py-1 rounded-full text-sm mb-2">
                            100% completado
                        </span>
                        <p class="text-gray-400 mb-3">Finalizado recientemente</p>
                        <button class="border border-[#FF6600] text-[#FF6600] px-4 py-2 rounded-md hover:bg-[#FF6600] hover:text-white transition">
                            Ver certificado
                        </button>
                    `;
                } else {
                    extraHTML = `
                        <p class="text-gray-400 mb-4">${curso.descripcion}</p>
                        <button class="bg-[#FF6600] text-white px-4 py-2 rounded-md hover:bg-[#ff8533] transition">
                            Empezar ahora
                        </button>
                    `;
                }

                card.innerHTML = `
                    <img src="${curso.imagen || '../img/curso_default.png'}" alt="${curso.titulo}" class="w-full h-40 object-cover mb-3 rounded-lg">
                    <h3 class="text-xl font-bold text-white mb-2">${curso.titulo}</h3>
                    ${extraHTML}
                `;
                grid.appendChild(card);
            });

            seccion.appendChild(grid);
            contenedor.appendChild(seccion);
        }
    }
}

// --- Calcular Progreso ---
function calcularProgreso(data) {
    cursosCompletados = data.filter(c => c.estado === "completado").length;
    cursosEnProgreso = data.filter(c => c.estado === "en progreso").length;

    document.getElementById("cursos-completados").textContent = cursosCompletados;
    document.getElementById("cursos-progreso").textContent = cursosEnProgreso;
}

// --- Gráfico ---
function crearGraficoProgreso() {
    const ctx = document.getElementById("chartProgreso").getContext("2d");
    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Completados", "En progreso", "Pendientes"],
            datasets: [{
                data: [
                    cursosCompletados,
                    cursosEnProgreso,
                    Math.max(0, cursosData.length - (cursosCompletados + cursosEnProgreso))
                ],
                backgroundColor: ["#2ecc71", "#f1c40f", "#e0e0e0"],
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom", labels: { color: "#fff" } },
            }
        }
    });
}

// --- Manejo del menú desplegable del usuario ---
function inicializarMenuUsuario() {
    const userBtn = document.getElementById("user-menu-button");
    const dropdown = document.getElementById("user-dropdown");

    if (userBtn && dropdown) {
        userBtn.addEventListener("click", () => {
            dropdown.classList.toggle("hidden");
        });

        const logoutBtn = document.getElementById("logout-btn");
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("usuario");
            window.location.href = "../index.html";
        });

        window.addEventListener("click", (e) => {
            if (!userBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add("hidden");
            }
        });
    }
}

// (Estos objetos y funciones adicionales se dejan tal cual)
let orden = { columna: null, asc: true };
let filtrosPlanes = ["basico", "intermedio", "premium"];
let filtroFechas = { inicio: null, fin: null };

function soloFecha(d) {
    const f = new Date(d);
    return new Date(f.getFullYear(), f.getMonth(), f.getDate());
}

document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario && usuario.nombre) {
        const span = document.getElementById("user-name");
        if (span) {
            span.innerText = usuario.nombre; 
            span.classList.remove("hidden");
        }
    }
});