document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    const signupForm = document.querySelector("#signupForm");
    console.log('signupForm:', signupForm);
    let isSubmitting = false;

    const nameEl = document.getElementById("signupName");
    const emailEl = document.getElementById("signupEmail");
    const passwordEl = document.getElementById("signupPassword");
    console.log('Elements:', nameEl, emailEl, passwordEl);

    signupForm.onsubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        isSubmitting = true;

        if (!nameEl || !nameEl.value || !emailEl || !emailEl.value || !passwordEl || !passwordEl.value) {
            swal("Error", "Please fill all fields correctly", "error");
            isSubmitting = false;
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: nameEl.value,
                    email: emailEl.value,
                    password: passwordEl.value
                })
            });

            const data = await response.json();

            if (data.success) {
                // Redirect to index with view parameter
                window.location.href = `index.html?view=${data.employee._id}`;
            } else {
                swal("❌ Error", data.message, "error");
            }
        } catch (err) {
            console.error('Login error:', err);
            swal("Error", "Error occurred while logging in", "error");
        } finally {
            isSubmitting = false;
        }
    };
});
