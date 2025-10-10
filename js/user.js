// --- Variables Globales ---
let cursosData = [];
let cursosCompletados = 0;
let cursosEnProgreso = 0;


// --- Cargar Panel del Usuario ---
async function cargarPanelUsuario() {
    try {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario) {
            alert("Por favor, inicia sesión primero.");
            window.location.href = "../docs/index.html";
            return;
        }

        // ✅ Obtener todos los cursos
        const res = await fetch(`http://localhost:3001/api/cursos`);
        const data = await res.json();

        cursosData = data;

        mostrarCursos(data);
        calcularProgreso(data);
        crearGraficoProgreso();
    } catch (err) {
        console.error("Error cargando cursos:", err);
    }
}


// --- Mostrar Cursos en Tarjetas ---
function mostrarCursos(cursos) {
    const contenedor = document.getElementById("lista-cursos");
    contenedor.innerHTML = "";

    if (cursos.length === 0) {
        contenedor.innerHTML = `<p class="text-gray-600 text-center col-span-full">No hay cursos disponibles por el momento.</p>`;
        return;
    }

    cursos.forEach(curso => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden";

        card.innerHTML = `
            <img src="${curso.imagen || '../img/curso_default.jpg'}" alt="Curso" class="w-full h-40 object-cover">
            <div class="p-4">
                <h3 class="font-semibold text-lg mb-1 text-gray-800">${curso.titulo}</h3>
                <p class="text-gray-600 text-sm mb-3">${curso.descripcion}</p>
                <div class="flex justify-between items-center">
                    <span class="text-sm font-medium text-indigo-600">${curso.nivel}</span>
                    <button class="bg-indigo-500 text-white px-3 py-1 rounded-md hover:bg-indigo-600 text-sm" onclick="verCurso('${curso.id}')">
                        Ver Curso
                    </button>
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

// --- Calcular Progreso ---
function calcularProgreso(data) {
    cursosCompletados = data.filter(c => c.estado === "completado").length;
    cursosEnProgreso = data.filter(c => c.estado === "en progreso").length;

    document.getElementById("cursos-completados").textContent = cursosCompletados;
    document.getElementById("cursos-progreso").textContent = cursosEnProgreso;
    document.getElementById("total-cursos").textContent = data.length;
}

// --- Gráfico de Progreso ---
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
            maintainAspectRatio: false, // 👈 importante
            plugins: {
                legend: { position: "bottom" },
                title: { display: false }
            }
        }
    });
}


// --- Ver Curso ---
function verCurso(id) {
    const curso = cursosData.find(c => c.id === id);
    if (!curso) return;

    alert(`📖 Estás viendo el curso: "${curso.titulo}"`);
    // En producción: window.location.href = `curso.html?id=${id}`;
}

// --- Navbar Usuario ---
const userBtn = document.getElementById("user-menu-button");
const dropdown = document.getElementById("user-dropdown");

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

// --- Inicialización ---
window.onload = cargarPanelUsuario;
