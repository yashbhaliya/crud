console.log("login.js loaded");

const form = document.getElementById("loginForm");

form.onsubmit = async (e) => {
    e.preventDefault();

    try {
        const res = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                password: document.getElementById("password").value
            })
        });

        const data = await res.json();

        if (!res.ok) {
            swal("Login Failed", data.message || "Login error", "error");
            return;
        }

        localStorage.setItem("loggedEmployee", JSON.stringify(data.employee));

        swal("Success", "Login successful", "success")
            .then(() => {
                window.location.href = "index.html";
            });

    } catch (err) {
        console.error("LOGIN FETCH ERROR:", err);
        swal("Error", "Server not running or API error", "error");
    }
};
