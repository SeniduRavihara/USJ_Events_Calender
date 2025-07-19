document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".event-register-form");
  const submitBtn = document.querySelector(".register-btn");

  // Check if user is authenticated
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to create events");
    window.location.href = "../login/";
    return;
  }

  // Form submission handler
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Event...";

    try {
      // Get form data
      const formData = new FormData(form);

      // Validate required fields
      const title = formData.get("event-title");
      const date = formData.get("event-date");
      const time = formData.get("event-time");
      const location = formData.get("event-location");
      const departments = formData.getAll("department[]");

      if (!title || !date || !time || !location || departments.length === 0) {
        throw new Error("Please fill in all required fields");
      }

      // Validate registration link if needed
      const registrationNeeded = formData.get("registration-needed");
      if (registrationNeeded === "yes") {
        const registrationLink = formData.get("registration-link");
        if (!registrationLink) {
          throw new Error(
            "Registration link is required when registration is needed"
          );
        }
      }

      // Send request to API
      const response = await fetch("../api/create-event.php", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create event");
      }

      // Success
      alert("Event created successfully!");
      window.location.href = "../dashboard/";
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "An error occurred while creating the event");
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Event";
    }
  });

  // Show/hide registration link input based on radio selection
  const radios = document.getElementsByName("registration-needed");
  const regLinkGroup = document.querySelector(".registration-link-group");
  const regLinkInput = document.getElementById("registration-link");
  const regLinkAsterisk = regLinkGroup.querySelector(".required");

  function updateRegLink() {
    if (
      document.querySelector('input[name="registration-needed"]:checked')
        .value === "yes"
    ) {
      regLinkGroup.style.display = "block";
      regLinkInput.required = true;
      regLinkAsterisk.style.display = "inline";
    } else {
      regLinkGroup.style.display = "none";
      regLinkInput.required = false;
      regLinkAsterisk.style.display = "none";
    }
  }

  radios.forEach((radio) => {
    radio.addEventListener("change", updateRegLink);
  });
  updateRegLink(); // Initial call

  // Add some basic validation
  const titleInput = document.getElementById("event-title");
  const dateInput = document.getElementById("event-date");
  const timeInput = document.getElementById("event-time");
  const locationInput = document.getElementById("event-location");

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;

  // Real-time validation feedback
  function validateField(input, minLength = 1) {
    const value = input.value.trim();
    const isValid = value.length >= minLength;

    if (isValid) {
      input.style.borderColor = "#10b981";
    } else {
      input.style.borderColor = "#ef4444";
    }

    return isValid;
  }

  titleInput.addEventListener("input", () => validateField(titleInput, 3));
  locationInput.addEventListener("input", () =>
    validateField(locationInput, 2)
  );
});
