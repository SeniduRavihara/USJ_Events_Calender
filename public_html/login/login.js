    // Wait for DOM content to load
    document.addEventListener("DOMContentLoaded", function () {
      const loginForm = document.getElementById("login-form");
      const loginBtn = document.getElementById("login-btn");
      const emailInput = document.getElementById("login-email");
      const passwordInput = document.getElementById("login-password");
      const rememberMeCheckbox = document.getElementById("remember-me");
      const forgotPasswordLink = document.getElementById("forgot-password");
      const messageContainer = document.getElementById("message-container");

      // Initialize form
      initializeForm();

      // Login button click handler
      loginBtn.addEventListener("click", async function (e) {
        e.preventDefault();
        await handleLogin();
      });

      // Allow Enter key to submit form
      [emailInput, passwordInput].forEach((input) => {
        input.addEventListener("keypress", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            handleLogin();
          }
        });
      });

      // Real-time validation
      emailInput.addEventListener("blur", function() {
        validateEmail(emailInput.value.trim());
      });

      passwordInput.addEventListener("blur", function() {
        validatePassword(passwordInput.value.trim());
      });

      // Clear validation on input
      emailInput.addEventListener("input", function() {
        clearFieldError("email-error");
        emailInput.classList.remove("error");
      });

      passwordInput.addEventListener("input", function() {
        clearFieldError("password-error");
        passwordInput.classList.remove("error");
      });

      // Forgot password handler
      if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", function (e) {
          e.preventDefault();
          showMessage("Password reset functionality will be available soon. Please contact your system administrator.", "info");
        });
      }

      // Initialize form with remembered data
      function initializeForm() {
        const rememberMe = localStorage.getItem("rememberMe");
        if (rememberMe === "true") {
          const savedEmail = localStorage.getItem("savedEmail");
          if (savedEmail) {
            emailInput.value = savedEmail;
            rememberMeCheckbox.checked = true;
          }
        }
      }

      // Main login handler
      async function handleLogin() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Clear previous errors
        clearAllErrors();

        // Validate inputs
        const emailValid = validateEmail(email);
        const passwordValid = validatePassword(password);

        if (!emailValid || !passwordValid) {
          return;
        }

        // Show loading state
        setLoadingState(true);

        try {
          const response = await fetch("/USJ_Events_Calender/api/login.php", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (response.ok && data.token) {
            // Store token
            localStorage.setItem("token", data.token);
            
            // Handle remember me functionality
            if (rememberMeCheckbox.checked) {
              localStorage.setItem("rememberMe", "true");
              localStorage.setItem("savedEmail", email);
            } else {
              localStorage.removeItem("rememberMe");
              localStorage.removeItem("savedEmail");
            }
            
            showMessage("Login successful! Redirecting...", "success");
            
            // Clear form
            clearForm();
            
            // Redirect after success
            setTimeout(() => {
              // Try different redirect methods
              if (typeof showSection === 'function') {
                showSection("dashboard");
              } else if (typeof loadProfile === 'function') {
                loadProfile();
              } else {
                // Default redirect to dashboard
                window.location.href = "../dashboard/";
              }
            }, 1500);
          } else {
            // Handle specific API errors
            handleLoginError(data, response.status);
          }
        } catch (error) {
          console.error("Login error:", error);
          if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showMessage("Unable to connect to the server. Please check your internet connection and try again.", "error");
          } else {
            showMessage("An unexpected error occurred. Please try again later.", "error");
          }
        } finally {
          setLoadingState(false);
        }
      }

      // Handle login errors from API
      function handleLoginError(data, status) {
        let errorMessage = "An error occurred during login.";
        
        if (data && data.error) {
          switch (data.error.toLowerCase()) {
            case "missing fields":
              errorMessage = "Please fill in all required fields.";
              break;
            case "invalid credentials":
              errorMessage = "Invalid email or password. Please check your credentials and try again.";
              break;
            case "user not found":
              errorMessage = "No account found with this email address.";
              break;
            case "account disabled":
              errorMessage = "Your account has been disabled. Please contact support.";
              break;
            case "too many attempts":
              errorMessage = "Too many failed login attempts. Please try again later.";
              break;
            default:
              errorMessage = data.error;
          }
        } else {
          switch (status) {
            case 400:
              errorMessage = "Bad request. Please check your input and try again.";
              break;
            case 401:
              errorMessage = "Invalid credentials. Please check your email and password.";
              break;
            case 403:
              errorMessage = "Access forbidden. Your account may be suspended.";
              break;
            case 500:
              errorMessage = "Server error. Please try again later.";
              break;
            default:
              errorMessage = `Login failed with status ${status}. Please try again.`;
          }
        }
        
        showMessage(errorMessage, "error");
      }

      // Email validation
      function validateEmail(email) {
        const emailError = document.getElementById("email-error");
        
        if (!email) {
          showFieldError("email-error", "Email is required");
          emailInput.classList.add("error");
          return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          showFieldError("email-error", "Please enter a valid email address");
          emailInput.classList.add("error");
          return false;
        }
        
        // Optional: Check for university domain
        // if (!email.includes("university.edu")) {
        //   showFieldError("email-error", "Please use your university email address");
        //   emailInput.classList.add("error");
        //   return false;
        // }
        
        return true;
      }

      // Password validation
      function validatePassword(password) {
        const passwordError = document.getElementById("password-error");
        
        if (!password) {
          showFieldError("password-error", "Password is required");
          passwordInput.classList.add("error");
          return false;
        }
        
        if (password.length < 6) {
          showFieldError("password-error", "Password must be at least 6 characters long");
          passwordInput.classList.add("error");
          return false;
        }
        
        return true;
      }

      // Show general message
      function showMessage(message, type) {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        messageContainer.innerHTML = "";
        messageContainer.appendChild(messageElement);
        
        // Trigger animation
        setTimeout(() => {
          messageElement.classList.add("show");
        }, 10);
        
        // Auto-hide after delay (except for success messages)
        if (type !== "success") {
          setTimeout(() => {
            hideMessage(messageElement);
          }, 5000);
        }
      }

      // Hide message
      function hideMessage(messageElement) {
        messageElement.classList.remove("show");
        setTimeout(() => {
          if (messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
          }
        }, 300);
      }

      // Show field-specific error
      function showFieldError(errorId, message) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
          errorElement.textContent = message;
          errorElement.classList.add("show");
        }
      }

      // Clear field-specific error
      function clearFieldError(errorId) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
          errorElement.classList.remove("show");
          errorElement.textContent = "";
        }
      }

      // Clear all errors
      function clearAllErrors() {
        messageContainer.innerHTML = "";
        clearFieldError("email-error");
        clearFieldError("password-error");
        emailInput.classList.remove("error");
        passwordInput.classList.remove("error");
      }

      // Set loading state
      function setLoadingState(isLoading) {
        if (isLoading) {
          loginBtn.innerHTML = '<span class="loading-spinner"></span>Logging in...';
          loginBtn.disabled = true;
        } else {
          loginBtn.innerHTML = 'Log In';
          loginBtn.disabled = false;
        }
      }

      // Clear form
      function clearForm() {
        if (!rememberMeCheckbox.checked) {
          emailInput.value = "";
        }
        passwordInput.value = "";
        clearAllErrors();
      }
    });
