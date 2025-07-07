// const baseURL = "https://mediqueue-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // 🔐 Redirect if not logged in
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const userInfo = document.getElementById("userInfo");
  const patientTable = document.getElementById("patientTable");
  const logoutBtn = document.getElementById("logoutBtn");

  // 🔍 Verify token and show admin info
  fetch("https://mediqueue-production.up.railway.app/verify", {
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Token verification failed");
      return res.json();
    })
    .then((data) => {
      if (data.role !== "admin") {
        window.location.href = "login.html";
        return;
      }

      userInfo.innerText = `Logged in as Admin: ${data.email} (${data.hospital_name || "Unknown Hospital"})`;
      fetchPatientList(); // 📥 Load patient data after verification
    })
    .catch((err) => {
      console.error("Access denied:", err);
      window.location.href = "login.html";
    });

  // 📥 Fetch and render all registered patients
  function fetchPatientList() {
    fetch("https://mediqueue-production.up.railway.app/admin/patients", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch patients");
        return res.json();
      })
      .then((data) => {
        renderPatients(data.patients);
      })
      .catch((err) => {
        console.error("Failed to load patients:", err);
        patientTable.innerHTML = `
          <tr><td colspan="7" class="p-2 text-center text-red-500">⚠️ Could not load patient data</td></tr>
        `;
      });
  }

  // 🧾 Render patient rows and attach remove button handlers
  function renderPatients(patients) {
    patientTable.innerHTML = "";
    patients.forEach((p) => {
      const patientId = p._id;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="p-2">${p.name}</td>
        <td class="p-2">${p.email || "-"}</td>
        <td class="p-2">${p.phone || "-"}</td>
        <td class="p-2">${p.gender || "-"}</td>
        <td class="p-2">${p.age || "-"}</td>
        <td class="p-2">${p.address || "-"}</td>
        <td class="p-2">
          <button class="bg-red-500 text-white px-2 py-1 rounded removeBtn" data-id="${p._id}">
            Remove
          </button>
        </td>
      `;
      patientTable.appendChild(row);

      // ❌ Attach Remove button handler for each row
      const removeBtn = row.querySelector(".removeBtn");
      removeBtn.addEventListener("click", () => {
        const id = removeBtn.dataset.id;
        if (confirm("Are you sure you want to remove this patient?")) {
          fetch(`https://mediqueue-production.up.railway.app/admin/remove_patient/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: "Bearer " + token,
            },
          })
            .then((res) => res.json())
            .then(() => {
              row.remove();
            })
            .catch((err) => {
              console.error("Failed to remove patient:", err);
              alert("Error removing patient.");
            });
        }
      });
    });
  }

  // 🚪 Logout
  logoutBtn.addEventListener("click", () => {
    if (confirm("Do you really want to logout?")) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
    }
  });
});
