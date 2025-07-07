// frontend/script.js

// const baseURL = "https://mediqueue-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
  if (typeof pageType === "undefined") return;

  // 🔵 Register Page Logic
  if (pageType === "register") {
    const form = document.getElementById("registerForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const age = parseInt(document.getElementById("age").value.trim());
      const gender = document.getElementById("gender").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const address = document.getElementById("address").value.trim();

      const msgBox = document.getElementById("registerMsg");

      try {
        const res = await fetch("https://mediqueue-production.up.railway.app/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            age,
            gender,
            phone,
            address
          }),
        });

        const data = await res.json();

        if (res.ok) {
          msgBox.style.color = "green";
          msgBox.textContent = "✅ Registered successfully! Redirecting to login...";
          setTimeout(() => (window.location.href = "login.html"), 1500);
        } else {
          msgBox.style.color = "red";
          msgBox.textContent = data.detail || "❌ Registration failed.";
        }
      } catch (error) {
        msgBox.style.color = "red";
        msgBox.textContent = "⚠️ Server error. Try again later.";
        console.error(error);
      }
    });
  }

  // 🟢 Login Page Logic
  if (pageType === "login") {
    const form = document.getElementById("loginForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const msgBox = document.getElementById("loginMsg");

      try {
        const res = await fetch("https://mediqueue-production.up.railway.app/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("token", data.access_token);
          msgBox.style.color = "green";
          msgBox.textContent = "✅ Login successful! Redirecting...";
          setTimeout(() => (window.location.href = "index.html"), 1500);
        } else {
          msgBox.style.color = "red";
          msgBox.textContent = data.detail || "❌ Login failed.";
        }
      } catch (error) {
        msgBox.style.color = "red";
        msgBox.textContent = "⚠️ Server error. Try again later.";
        console.error(error);
      }
    });
  }
});
