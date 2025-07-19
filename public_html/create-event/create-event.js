document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".event-register-form");
  const submitBtn = document.querySelector(".register-btn");
  
  // Configuration
  const API_BASE_URL = window.location.protocol === 'https:' 
    ? 'https://your-domain.com/api' 
    : 'http://localhost/USJ_Events_Calender/api';
  
  const REQUEST_TIMEOUT = 30000; // 30 seconds

  // Check authentication
  const token = localStorage.getItem("token");
  if (!token) {
    showError("Please login to create events");
    window.location.href = "../login/";
    return;
  }

  // Improved error display
  function showError(message, isFieldError = false) {
    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
      background-color: #fee2e2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 12px;
      border-radius: 4px;
      margin: 10px 0;
      font-size: 14px;
    `;
    errorDiv.textContent = message;
    
    form.insertBefore(errorDiv, form.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }

  function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
      background-color: #dcfce7;
      border: 1px solid #bbf7d0;
      color: #166534;
      padding: 12px;
      border-radius: 4px;
      margin: 10px 0;
      font-size: 14px;
    `;
    successDiv.textContent = message;
    
    form.insertBefore(successDiv, form.firstChild);
  }

  // Enhanced form validation
  function validateForm(formData) {
    const errors = [];
    
    const title = formData.get("event-title");
    const date = formData.get("event-date");
    const time = formData.get("event-time");
    const location = formData.get("event-location");
    const departments = formData.getAll("department[]");
    
    // Required field validation
    if (!title || title.trim().length < 3) {
      errors.push("Event title must be at least 3 characters long");
    }
    
    if (!date) {
      errors.push("Event date is required");
    } else {
      // Check if date is not in the past
      const eventDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        errors.push("Event date cannot be in the past");
      }
    }
    
    if (!time) {
      errors.push("Event time is required");
    }
    
    if (!location || location.trim().length < 2) {
      errors.push("Location must be at least 2 characters long");
    }
    
    if (departments.length === 0) {
      errors.push("At least one department must be selected");
    }
    
    // Registration validation
    const registrationNeeded = formData.get("registration-needed");
    if (registrationNeeded === "yes") {
      const registrationLink = formData.get("registration-link");
      if (!registrationLink || !isValidURL(registrationLink)) {
        errors.push("Valid registration link is required when registration is needed");
      }
    }
    
    // File validation
    const coverImage = formData.get("cover-image");
    if (coverImage && coverImage.size > 0) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      if (coverImage.size > maxSize) {
        errors.push("Cover image must be less than 5MB");
      }
      
      if (!allowedTypes.includes(coverImage.type)) {
        errors.push("Cover image must be JPEG, PNG, GIF, or WebP format");
      }
    }
    
    return errors;
  }

  function isValidURL(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Enhanced fetch with timeout and retry logic
  async function fetchWithTimeout(url, options, timeout = REQUEST_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      throw error;
    }
  }

  // Form submission handler
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    
    // Clear previous messages
    const existingMessages = document.querySelectorAll('.error-message, .success-message');
    existingMessages.forEach(msg => msg.remove());

    // Show loading state
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Event...";

    try {
      // Get and validate form data
      const formData = new FormData(form);
      const validationErrors = validateForm(formData);
      
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      console.log("Submitting form data:", Object.fromEntries(formData));

      // Send request to API with timeout
      const response = await fetchWithTimeout(`${API_BASE_URL}/create-event.php`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData,
      });

      let result;
      try {
        result = await response.json();
        console.log(result);
        
      } catch (parseError) {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        // Handle specific HTTP status codes
        switch (response.status) {
          case 401:
            localStorage.removeItem("token");
            throw new Error("Session expired. Please login again.");
          case 403:
            throw new Error("You don't have permission to create events");
          case 413:
            throw new Error("File too large. Please choose a smaller image.");
          case 429:
            throw new Error("Too many requests. Please wait and try again.");
          default:
            throw new Error(result.error || `Server error (${response.status})`);
        }
      }

      // Success handling
      showSuccess("Event created successfully!");
      
      // Reset form
      form.reset();
      updateRegLink(); // Reset registration link visibility
      
      // Redirect after a brief delay to show success message
      // setTimeout(() => {
      //   window.location.href = "../dashboard/";
      // }, 2000);
      
    } catch (error) {
      console.error("Error creating event:", error);
      
      // Handle different types of errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showError("Network error. Please check your connection and try again.");
      } else if (error.message.includes("Session expired")) {
        showError(error.message);
        setTimeout(() => {
          // window.location.href = "../login/";
        }, 2000);
      } else {
        showError(error.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  // Registration link visibility logic (existing code)
  const radios = document.getElementsByName("registration-needed");
  const regLinkGroup = document.querySelector(".registration-link-group");
  const regLinkInput = document.getElementById("registration-link");
  const regLinkAsterisk = regLinkGroup.querySelector(".required");

  function updateRegLink() {
    const checkedRadio = document.querySelector('input[name="registration-needed"]:checked');
    if (checkedRadio && checkedRadio.value === "yes") {
      regLinkGroup.style.display = "block";
      regLinkInput.required = true;
      regLinkAsterisk.style.display = "inline";
    } else {
      regLinkGroup.style.display = "none";
      regLinkInput.required = false;
      regLinkAsterisk.style.display = "none";
      regLinkInput.value = ""; // Clear value when hidden
    }
  }

  radios.forEach((radio) => {
    radio.addEventListener("change", updateRegLink);
  });
  updateRegLink();

  // Enhanced field validation
  const titleInput = document.getElementById("event-title");
  const dateInput = document.getElementById("event-date");
  const locationInput = document.getElementById("event-location");
  const coverImageInput = document.getElementById("cover-image");

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;

  function validateField(input, minLength = 1, customValidator = null) {
    const value = input.value.trim();
    let isValid = value.length >= minLength;
    
    if (customValidator) {
      isValid = isValid && customValidator(value);
    }

    // Visual feedback
    input.style.borderColor = isValid ? "#10b981" : "#ef4444";
    input.style.boxShadow = isValid 
      ? "0 0 0 1px #10b981" 
      : "0 0 0 1px #ef4444";

    return isValid;
  }

  // Real-time validation
  titleInput.addEventListener("input", () => validateField(titleInput, 3));
  locationInput.addEventListener("input", () => validateField(locationInput, 2));
  
  // File size validation
  if (coverImageInput) {
    coverImageInput.addEventListener("change", function() {
      const file = this.files[0];
      if (file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        let isValid = true;
        let errorMsg = "";
        
        if (file.size > maxSize) {
          isValid = false;
          errorMsg = "File size must be less than 5MB";
        } else if (!allowedTypes.includes(file.type)) {
          isValid = false;
          errorMsg = "Please select a valid image file (JPEG, PNG, GIF, or WebP)";
        }
        
        this.style.borderColor = isValid ? "#10b981" : "#ef4444";
        
        // Remove existing file error message
        const existingError = this.parentNode.querySelector('.file-error');
        if (existingError) {
          existingError.remove();
        }
        
        if (!isValid) {
          const errorSpan = document.createElement('span');
          errorSpan.className = 'file-error';
          errorSpan.style.cssText = 'color: #dc2626; font-size: 12px; display: block; margin-top: 4px;';
          errorSpan.textContent = errorMsg;
          this.parentNode.appendChild(errorSpan);
          this.value = ""; // Clear invalid file
        }
      }
    });
  }

  // Add connection status indicator
  function updateConnectionStatus() {
    if (!navigator.onLine) {
      showError("No internet connection. Please check your connection.");
    }
  }

  window.addEventListener('online', () => {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => {
      if (msg.textContent.includes('internet connection')) {
        msg.remove();
      }
    });
  });

  window.addEventListener('offline', updateConnectionStatus);
});