document.addEventListener("DOMContentLoaded", function() {
    document.querySelector("#loginForm").addEventListener("submit", function(event) {
        event.preventDefault();
        Login();
    });
});

async function Login() {
    const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: document.querySelector("#email").value,
            password: document.querySelector("#password").value
        })
    });

    if (!response.ok) {
        console.error(`Erreur lors de la connexion : ${response.status}`);
        return;
    }

    const user = await response.json();
    console.log(user);
    localStorage.setItem("authToken", user.token);
    window.location.href = "index.html";
}

