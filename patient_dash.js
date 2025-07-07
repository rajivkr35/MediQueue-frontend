// const baseURL = "https://mediqueue-production.up.railway.app";

document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");

  // 🔐 Redirect if not logged in
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  // ✅ Verify role from backend
  fetch("https://mediqueue-production.up.railway.app/verify", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.role !== "patient") {
        window.location.href = "index.html";
      } else {
        // ✅ Show email
        const userInfo = document.getElementById("userInfo");
        if (userInfo) userInfo.innerText = "👋 Logged in as: " + data.email;
      }
    })
    .catch(err => {
      console.error("Verification failed:", err);
      window.location.href = "index.html";
    });

  const patientForm = document.getElementById("patientForm");
  const queueTable = document.getElementById("queueTableBody");
  const waitTimeDiv = document.getElementById("waitTime");

  // 📥 Load existing queue
  fetch("https://mediqueue-production.up.railway.app/get_queue", {
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      queueTable.innerHTML = "";
      data.queue.forEach((patient) => addRowToTable(patient));
    })
    .catch((err) => console.error("Queue load error:", err));

  // ➕ Handle patient form submit
  patientForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const age = parseInt(document.getElementById("age").value);
    const gender = parseInt(document.getElementById("gender").value);
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const problem = document.getElementById("problem").value;
    const problem_code = parseInt(problem);
    const hour = new Date().getHours();
    const queue_length = queueTable.children.length;

    const patientData = { name, age, gender, phone, address, problem };

    fetch("https://mediqueue-production.up.railway.app/add_patient", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(patientData),
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.message === "Patient added") {
          const newPatient = { _id: response.id, ...patientData };
          addRowToTable(newPatient);

          // ⏱️ Predict wait time using ML
          fetch("https://mediqueue-production.up.railway.app/predict_wait_time", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify({ age, gender, problem_code, queue_length, hour }),
          })
            .then((res) => res.json())
            .then((data) => {
              waitTimeDiv.innerText = "⏱️ Estimated wait time: " + data.predicted_wait_time + " minutes";
            })
            .catch((err) => {
              console.error("Prediction error:", err);
              waitTimeDiv.innerText = "";
            });
        } else {
          alert("Failed to add patient.");
        }
      })
      .catch((err) => {
        console.error("Add patient error:", err);
      });
  });

  // 🧾 Add patient row to table
  function addRowToTable(patient) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="p-2">${patient.name}</td>
      <td class="p-2">${patient.age}</td>
      <td class="p-2">${patient.gender == 0 ? "Male" : "Female"}</td>
      <td class="p-2">${patient.problem}</td>
      <td class="p-2">
        <button class="removeBtn bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded" data-id="${patient._id}">
          Remove
        </button>
      </td>
    `;
    queueTable.appendChild(row);

    // ❌ Remove patient button
    row.querySelector(".removeBtn").addEventListener("click", function () {
      const id = this.dataset.id;
      fetch(`https://mediqueue-production.up.railway.app/remove_patient/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      })
        .then((res) => res.json())
        .then(() => {
          row.remove();
          waitTimeDiv.innerText = "";
        })
        .catch((err) => {
          console.error("Delete error:", err);
        });
    });
  }

  // 🔒 Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Do you really want to log out?")) {
        localStorage.removeItem("token");
        window.location.href = "index.html";
      }
    });
  }
});
