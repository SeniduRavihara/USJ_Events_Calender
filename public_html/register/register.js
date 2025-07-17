document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("signup-form");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  
  if (form) {
    form.addEventListener("submit", register);
  }

  // Password toggle functionality
  document.querySelectorAll(".toggle-password").forEach((eyeIcon) => {
    eyeIcon.addEventListener("click", () => {
      const targetId = eyeIcon.getAttribute("data-target");
      const input = document.getElementById(targetId);

      if (input.type === "password") {
        input.type = "text";
        eyeIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M9.879 9.88a3 3 0 0 0 4.242 4.242M6.228 6.228C4.936 7.566 3.78 9.33 3 12c1.292 3.338 5.31 6.5 9 6.5a8.956 8.956 0 0 0 3.272-.6M14.121 14.122L21 21M17.772 17.772A10.45 10.45 0 0 0 21 12c-1.292-3.338-5.31-6.5-9-6.5a8.96 8.96 0 0 0-3.273.6" /></svg>';
      } else {
        input.type = "password";
        eyeIcon.innerHTML = "&#128065;";
      }
    });
  });

  // Real-time password match validation
  confirmPasswordInput.addEventListener("input", validatePasswordMatch);
  passwordInput.addEventListener("input", validatePasswordMatch);

  function validatePasswordMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword && password !== confirmPassword) {
      confirmPasswordInput.setCustomValidity("Passwords do not match");
      confirmPasswordInput.classList.add("error");
    } else {
      confirmPasswordInput.setCustomValidity("");
      confirmPasswordInput.classList.remove("error");
    }
  }

  // Student ID format validation
  document.getElementById("studentId").addEventListener("input", function(e) {
    const value = e.target.value.toUpperCase();
    // Allow only letters and numbers, format like FC221XXX
    if (value && !value.match(/^[A-Z]{2}\d{3}[A-Z0-9]*$/)) {
      e.target.setCustomValidity("Student ID should be in format FC221XXX");
    } else {
      e.target.setCustomValidity("");
    }
  });
});

async function register(e) {
  e.preventDefault();
  
  // Clear any previous messages
  showMessage("regResult", "", "");
  
  // Get form values
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const department = document.getElementById("department").value;
  const studentId = document.getElementById("studentId").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const agreeTerms = document.getElementById("agreeTerms").checked;

  // Combine first and last name
  const fullName = `${firstName} ${lastName}`;

  console.log("Registration attempt:", {
    name: fullName,
    email,
    department,
    studentId,
    passwordLength: password.length
  });

  // Client-side validation
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    showMessage("regResult", "Name, email, and password are required", "error");
    return;
  }

  if (!agreeTerms) {
    showMessage("regResult", "You must agree to the Terms of Service and Privacy Policy", "error");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("regResult", "Passwords do not match", "error");
    return;
  }

  if (password.length < 8) {
    showMessage("regResult", "Password must be at least 8 characters long", "error");
    return;
  }

  // Email validation (basic email check)
  if (!email.includes('@') || !email.includes('.')) {
    showMessage("regResult", "Please enter a valid email address", "error");
    return;
  }

  // Show loading state
  const submitButton = document.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  submitButton.textContent = "Creating Account...";
  submitButton.disabled = true;

  try {
    const res = await fetch("/USJ_Events_Calender/api/register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name: fullName, 
        email, 
        password,
        department: department || null,
        studentId: studentId || null
      }),
    });

    const data = await res.json();

    console.log("API Response:", data);
    
    if (res.ok) {
      // Success response
      showMessage("regResult", data.message || "Registration successful! Redirecting to login...", "success");
      setTimeout(() => {
        window.location.href = "../login/";
      }, 2000);
    } else {
      // Error response - handle specific error cases
      let errorMessage = data.error || "Registration failed. Please try again.";
      
      // Handle specific error cases for better UX
      if (res.status === 409) {
        if (errorMessage.includes("Email")) {
          errorMessage = "This email is already registered. Please use a different email or try logging in.";
        } else if (errorMessage.includes("Student ID")) {
          errorMessage = "This Student ID is already registered. Please check your Student ID or contact support.";
        }
      } else if (res.status === 400) {
        if (errorMessage.includes("email format")) {
          errorMessage = "Please enter a valid email address.";
        }
      }
      
      showMessage("regResult", errorMessage, "error");
    }
  } catch (error) {
    console.error("Registration error:", error);
    showMessage("regResult", "Network error. Please check your connection and try again.", "error");
  } finally {
    // Reset button state
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
  }
}

function showMessage(elementId, message, type) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = `message-display ${type}`;
  
  // Auto-hide success messages after 3 seconds
  if (type === "success") {
    setTimeout(() => {
      element.textContent = "";
      element.className = "message-display";
    }, 3000);
  }
}