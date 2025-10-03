// login.js
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginMsg = document.getElementById("loginMsg");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password })
      });

      const data = await res.json();

      if (res.ok) {
        loginMsg.style.color = "green";
        loginMsg.textContent = data.message;

        if (data.rol === "admin") {
          window.location.href = "index_admin.html";
        } else {
          // para que no se vuelva a loguear si cierra y entra
          localStorage.setItem("usuario", JSON.stringify({
            nombre: data.nombre,
            rol: data.rol,
            correo: correo
          }));
          window.location.href = "index.html"; 
        }

      } else {
        loginMsg.style.color = "red";
        loginMsg.textContent = data.message;
      }

    } catch (err) {
      loginMsg.style.color = "red";
      loginMsg.textContent = "Error de conexión con servidor";
      console.error(err);
    }
  });
});
