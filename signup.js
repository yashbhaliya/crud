const API = "http://localhost:3000/employees";
let isSubmitting = false;

const signupForm = document.querySelector("#signupForm");
const signupBtn = document.querySelector("#signupBtn");

const nameEl = document.getElementById("signupName");
const emailEl = document.getElementById("signupEmail");
const passwordEl = document.getElementById("signupPassword");
const officecodeEl = document.getElementById("signupOfficeCode");
const jobTitleEl = document.getElementById("signupJobTitle");
const profileInput = document.getElementById("signupProfilePic");

/* ================= VALIDATION ================= */
function validateForm() {
    if (!nameEl.value || !emailEl.value || !passwordEl.value || !officecodeEl.value || !jobTitleEl.value) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value);
}

/* ================= IMAGE COMPRESSION ================= */
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

/* ================= SIGN UP ================= */
signupForm.onsubmit = async (e) => {
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
                const data = await response.json();
                swal("Success!", "Account created successfully", "success").then(() => {
                    // Redirect to login or main page
                    window.location.href = "index.html";
                });
            } else {
                const errorData = await response.json();
                swal("Error", errorData.message || "Failed to create account", "error");
            }
        } catch (err) {
            swal("Error", "Error occurred while creating account", "error");
        } finally {
            isSubmitting = false;
        }
    });
};