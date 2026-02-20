document.addEventListener("DOMContentLoaded", () => {
    const esAdmin = localStorage.getItem("esAdmin");

    if (esAdmin === "true") {
        const nav = document.getElementById("nav-links");

        if (nav) {
            const adminLink = document.createElement("a");
            adminLink.href = "administrador.html";
            adminLink.textContent = "Administrador";

            nav.appendChild(adminLink);
        }
    }
});