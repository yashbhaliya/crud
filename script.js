const API = "http://localhost:3000/employees";
let isSubmitting = false;


const addbtn = document.querySelector("#add-btn");
const modal = document.querySelector(".modal");
const closeBtn = document.querySelector(".close-icon");

const nameEl = document.getElementById("Name");
const emailEl = document.getElementById("E-mail");
const passwordEl = document.getElementById("Password");
const viewPasswordEl = document.getElementById("view-Password");

const officecodeEl = document.getElementById("Office-Code");
const jobTitleEl = document.getElementById("Job-Title");
const profileInput = document.getElementById("profilePic");

const registerForm = document.querySelector("#registerForm");
const tableBody = document.querySelector("#table-data");

const searchEl = document.querySelector("#empId");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.querySelector(".f-button.clear");
const delAllBox = document.getElementById("del-all-box");

let userData = [];
let originalEmployee = null;

// -------------------- MODAL HANDLING --------------------
addbtn.onclick = () => {
    modal.classList.add("active");
    registerForm.reset();
};

closeBtn.onclick = () => modal.classList.remove("active");

document.querySelectorAll(".view-modal .close-icon").forEach(btn => {
    btn.onclick = () => {
        document.querySelector(".view-modal").classList.remove("active");
    };
});

// -------------------- FORM VALIDATION --------------------
function validateForm() {
    if (!nameEl.value || !emailEl.value || !passwordEl.value || !officecodeEl.value || !jobTitleEl.value) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value);
}

// -------------------- IMAGE COMPRESSION --------------------
function compressImage(file, width, height, callback) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            canvas.getContext("2d").drawImage(img, 0, 0, width, height);
            callback(canvas.toDataURL("image/jpeg", 0.6));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// -------------------- ADD EMPLOYEE --------------------
registerForm.onsubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    if (!validateForm()) {
        swal("Error", "Please fill all fields correctly", "error");
        isSubmitting = false;
        return;
    }

    const file = profileInput.files[0];
    if (!file) {
        swal("Error", "Please select profile image", "error");
        isSubmitting = false;
        return;
    }

    compressImage(file, 150, 150, async (img) => {
        try {
            const response = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: nameEl.value,
                    email: emailEl.value,
                    password: passwordEl.value,
                    officecode: officecodeEl.value,
                    jobTitle: jobTitleEl.value,
                    profile: img
                })
            });

            if (response.ok) {
                swal("Success!", "Employee added successfully", "success");
                modal.classList.remove("active");
                registerForm.reset();
                getDataFromDB();
            } else {
                swal("Error", "Failed to add employee", "error");
            }
        } catch (err) {
            swal("Error", "Error occurred while adding employee", "error");
        } finally {
            isSubmitting = false;
        }
    });
};

// -------------------- FETCH EMPLOYEES --------------------
async function getDataFromDB() {
    try {
        const res = await fetch(API);
        userData = await res.json();

        tableBody.innerHTML = "";
        userData.forEach((emp, index) => {
            tableBody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td><img src="${emp.profile}" width="40" style="border-radius:50%"></td>
                    <td>${emp._id}</td>
                    <td>${emp.name}</td>
                    <td>${emp.email}</td>
                    <td>*****</td>
                    <td>${emp.officecode}</td>
                    <td>${emp.jobTitle}</td>
                    <td>
                        <i class="fa fa-eye view-btn"></i>
                        <i class="fa fa-edit edit-btn"></i>
                        <i class="fa fa-trash del-btn"></i>
                    </td>
                </tr>`;
        });

        setupDeleteButtons();
        setupActionButtons();
    } catch (err) {
        console.error("Error fetching employees:", err);
    }
}

getDataFromDB();

// -------------------- DELETE EMPLOYEE --------------------
function setupDeleteButtons() {
    document.querySelectorAll(".del-btn").forEach(btn => {
        btn.onclick = async function () {
            const id = this.closest("tr").cells[2].textContent;
            if (!confirm("Are you sure you want to delete this employee?")) return;
            await fetch(`${API}/${id}`, { method: "DELETE" });
            swal("Deleted!", "Employee removed", "success");
            getDataFromDB();
        };
    });
}

// -------------------- VIEW / EDIT EMPLOYEE --------------------
function setupActionButtons() {
    document.querySelectorAll(".view-btn").forEach(btn => {
        btn.onclick = () => {
            const id = btn.closest("tr").cells[2].textContent;
            const emp = userData.find(e => e._id == id);
            if (!emp) return;
            openViewModal(emp, false);
        };
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.onclick = () => {
            const id = btn.closest("tr").cells[2].textContent;
            const emp = userData.find(e => e._id == id);
            if (!emp) return;
            originalEmployee = { ...emp };
            openViewModal(emp, true);
        };
    });
}

const viewUpdateBtn = document.querySelector("#view-update-btn");
const viewNameEl = document.getElementById("view-Name");
const viewEmailEl = document.getElementById("view-E-mail");
const viewOfficeEl = document.getElementById("view-Office-Code");
const viewJobEl = document.getElementById("view-Job-Title");
const viewProfileInput = document.getElementById("view-profilePic");
const viewProfileImg = document.getElementById("view-profile");

viewUpdateBtn.onclick = async () => {
    const id = document.getElementById("view-Id").value;
    const updatedData = {};

    if (viewNameEl.value !== originalEmployee.name) updatedData.name = viewNameEl.value;
    if (viewEmailEl.value !== originalEmployee.email) updatedData.email = viewEmailEl.value;
    if (viewPasswordEl.value) updatedData.password = viewPasswordEl.value;
    if (viewOfficeEl.value !== originalEmployee.officecode) updatedData.officecode = viewOfficeEl.value;
    if (viewJobEl.value !== originalEmployee.jobTitle) updatedData.jobTitle = viewJobEl.value;

    if (viewProfileInput.files[0]) {
        compressImage(viewProfileInput.files[0], 150, 150, async (img) => {
            updatedData.profile = img;
            await updateEmployee(id, updatedData);
        });
    } else {
        if (Object.keys(updatedData).length > 0) {
            await updateEmployee(id, updatedData);
        } else {
            swal("No changes", "No fields were modified", "info");
        }
    }
};

async function updateEmployee(id, updatedData) {
    try {
        const res = await fetch(`${API}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData)
        });

        if (res.ok) {
            swal("Updated!", "Employee updated successfully", "success");
            document.querySelector(".view-modal").classList.remove("active");
            getDataFromDB();
        } else {
            const errorText = await res.text();
            swal("Error!", `Failed to update employee: ${errorText}`, "error");
        }
    } catch (err) {
        swal("Error!", "Error occurred while updating employee", "error");
    }
}

// -------------------- SEARCH --------------------
searchEl.oninput = () => {
    const filter = searchEl.value.toLowerCase();
    tableBody.querySelectorAll("tr").forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none";
    });
};

// -------------------- DELETE ALL --------------------
clearBtn.onclick = async () => {
    if (!delAllBox.checked) {
        swal("Warning", "Check the box first", "warning");
        return;
    }
    if (!confirm("Are you sure you want to delete ALL employees?")) return;

    await fetch(API, { method: "DELETE" });
    swal("Deleted!", "All employees removed", "success");
    delAllBox.checked = false;
    getDataFromDB();
};

delAllBox.onclick = () => {
    if (delAllBox.checked) swal("Warning", "You are about to delete ALL employee records", "warning");
};

// -------------------- PASSWORD TOGGLE --------------------
const toggleEye = document.getElementById("togglePassword");
toggleEye.onclick = () => {
    if (viewPasswordEl.type === "password") {
        viewPasswordEl.type = "text";
        toggleEye.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        viewPasswordEl.type = "password";
        toggleEye.classList.replace("fa-eye-slash", "fa-eye");
    }
};

// -------------------- OPEN VIEW/EDIT MODAL --------------------
function openViewModal(emp, isEdit = false) {
    document.getElementById("view-Id").value = emp._id;
    document.getElementById("view-Name").value = emp.name;
    document.getElementById("view-E-mail").value = emp.email;

    // IMPORTANT: password field EMPTY
    document.getElementById("view-Password").value = emp.password;
    document.getElementById("view-Password").type = "password";

    document.getElementById("view-Office-Code").value = emp.officecode;
    document.getElementById("view-Job-Title").value = emp.jobTitle;
    document.getElementById("view-profile").src = emp.profile;

    document.getElementById("view-Name").disabled = !isEdit;
    document.getElementById("view-E-mail").disabled = !isEdit;
    document.getElementById("view-Password").disabled = !isEdit;
    document.getElementById("view-Office-Code").disabled = !isEdit;
    document.getElementById("view-Job-Title").disabled = !isEdit;

    document.getElementById("view-profilePic").style.display = isEdit ? "block" : "none";
    document.getElementById("view-update-btn").style.display = isEdit ? "block" : "none";

    document.querySelector(".view-modal").classList.add("active");
}


// -------------------- ON LOAD --------------------
window.onload = getDataFromDB;
window.addEventListener("DOMContentLoaded", () => {
    const emp = JSON.parse(localStorage.getItem("loggedEmployee"));

    if (emp) {
        openViewModal(emp, false);   // open view modal
        localStorage.removeItem("loggedEmployee");
    }
});