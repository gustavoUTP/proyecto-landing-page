function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "flex";
    setTimeout(() => {
        modal.classList.add("show");
    }, 10); // pequeño delay para activar la transición
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove("show");
    setTimeout(() => {
        modal.style.display = "none";
    }, 300); // espera que termine la animación
}

// Toggle menú móvil
const btn = document.getElementById("menu-btn");
const menuMobile = document.getElementById("menu-mobile");

btn.addEventListener("click", () => {
    menuMobile.classList.toggle("hidden");
});
