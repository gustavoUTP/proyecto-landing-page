
const form = document.querySelector('#miFormulario');
const nombreInput = document.querySelector('#form-name');
const correoInput = document.querySelector('#form-email');
const mensajeInput = document.querySelector('#form-message');
const enviarBtn = document.querySelector('#btn-send');

const LIMITE_NOMBRE = 50;
const LIMITE_CORREO = 100;
const LIMITE_MENSAJE = 500;


function validarFormulario() {
    if (nombreInput.value.trim() === "") {
        alert("Por favor ingresa tu nombre.");
        return false;
    }

    if (nombreInput.value.length > LIMITE_NOMBRE) {
        alert(`El nombre no puede exceder los ${LIMITE_NOMBRE} caracteres.`);
        return false;
    }

    if (correoInput.value.trim() === "") {
        alert("Por favor ingresa tu correo.");
        return false;
    }

    if (correoInput.value.length > LIMITE_CORREO) {
        alert(`El correo no puede exceder los ${LIMITE_CORREO} caracteres.`);
        return false;
    }

    if (!validarCorreo(correoInput.value)) {
        alert("Por favor ingresa un correo electrónico válido.");
        return false;
    }

    if (mensajeInput.value.trim() === "") {
        alert("Por favor ingresa un mensaje.");
        return false;
    }

    if (mensajeInput.value.length > LIMITE_MENSAJE) {
        alert(`El mensaje no puede exceder los ${LIMITE_MENSAJE} caracteres.`);
        return false;
    }

    return true;
}

function validarCorreo(correo) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(correo);
}

enviarBtn.addEventListener("click", async function(event) {
    event.preventDefault();

    if (validarFormulario()) {
        const datos = {
            nombre: nombreInput.value,
            correo: correoInput.value,
            mensaje: mensajeInput.value
        };

        try {
            const respuesta = await fetch('http://localhost:3001/api/formulario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (respuesta.ok) {
                alert("Formulario enviado y guardado en la base de datos!");
                form.reset();
            } else {
                alert("Hubo un error al guardar los datos.");
            }
        } catch (error) {
            console.error('Error:', error);
            alert("No se pudo conectar con el servidor.");
        }
    }
});
