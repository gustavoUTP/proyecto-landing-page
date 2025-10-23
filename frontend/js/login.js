// login.js
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginMsg = document.getElementById("loginMsg");

  if (!loginForm) return; // Previene errores si el formulario no existe

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    // 🔍 Validación rápida en el cliente
    if (!correo || !password) {
      showMessage("Por favor ingresa tu correo y contraseña", "red");
      return;
    }

    try {
      const response = await fetch("https://proyecto-landing-page.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Error del servidor (400 o 401)
        showMessage(data.message || "Credenciales incorrectas", "red");
        return;
      }

      // ✅ Éxito en el login
      showMessage("Inicio de sesión exitoso 🎉", "green");

      // Guarda usuario en localStorage
      localStorage.setItem("usuario", JSON.stringify({
        nombre: data.nombre,
        rol: data.rol,
        correo,
        token: data.token || null // opcional si tu backend genera JWT
      }));

      // Redirección por rol
      setTimeout(() => {
        const roleRoutes = {
          admin: "index_admin.html",
          user: "index_user.html",
        };
        window.location.href = roleRoutes[data.rol] || "index.html";
      }, 1200);

    } catch (error) {
      console.error("Error en login:", error);
      showMessage("No se pudo conectar al servidor 😢", "red");
    }
  });

  // 🧩 Función auxiliar para mostrar mensajes
  function showMessage(text, color) {
    loginMsg.style.color = color;
    loginMsg.textContent = text;
  }
});
