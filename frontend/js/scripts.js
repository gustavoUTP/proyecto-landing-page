// ==================== Registro de Usuario ====================
const registerForm = document.getElementById('registerForm');
const registerMsg = document.getElementById('msg');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre_log').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const res = await fetch('http://localhost:3001/api/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, correo, password })
        });

        const data = await res.json();

        if (res.ok) {
            registerMsg.style.color = 'green';
            registerMsg.textContent = data.message;
            registerForm.reset();
        } else {
            registerMsg.style.color = 'red';
            registerMsg.textContent = data.message;
        }

    } catch (err) {
        registerMsg.style.color = 'red';
        registerMsg.textContent = 'Error al conectar con el servidor';
        console.error(err);
    }
});

// ==================== Registro de Suscripción ====================
const susForm = document.getElementById("form-suscripcion");

susForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const nombreApellido = document.getElementById("nombre_sus").value;
    const correo = document.getElementById("email").value;
    const telefono = document.getElementById("telefono").value;
    const plan = document.getElementById("plan").value;

    if (!nombreApellido || !correo || !telefono || !plan) {
        alert("Por favor completa todos los campos.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3001/api/suscripciones", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombreApellido, correo, telefono, plan })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Suscripción registrada con éxito");
            susForm.reset();
            closeModal('modal-suscripcion');
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error("Error en la suscripción:", error);
        alert("No se pudo enviar la suscripción");
    }
});

// ==================== Animaciones de Scroll ====================
const revealSections = document.querySelectorAll('.reveal-section');

const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    revealSections.forEach(section => {
        const top = section.getBoundingClientRect().top;
        if (top < windowHeight - 100) {
            section.classList.remove('opacity-0', 'translate-y-10');
            section.classList.add('opacity-100', 'translate-y-0');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

