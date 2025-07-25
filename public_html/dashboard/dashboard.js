// public_html/dashboard/dashboard.js

let allEvents = []; // Store all events for filtering

function mapEventToCardData(event) {
  // Map backend event fields to the card structure
  let departments = [];
  let departmentTags = [];
  try {
    departments = event.departments ? JSON.parse(event.departments) : [];
    departmentTags = departments.map((dep) => ({
      name: dep.toUpperCase(),
      class: "tag-" + dep.toLowerCase(),
    }));
  } catch (e) {
    departments = [];
    departmentTags = [];
  }

  // Handle cover image URL
  let coverImageUrl = "";
  if (event.cover_image) {
    coverImageUrl = `../${event.cover_image}`;
  }

  return {
    id: event.id,
    icon: coverImageUrl ? coverImageUrl : "📅", // Use cover image or fallback to icon
    title: event.title,
    departments, // array of department codes
    departmentTags, // array of {name, class}
    subtitle: event.description || "",
    date: event.event_date,
    time: event.event_time,
    location: event.location,
    registered: event.registered_count || "", // Add registration count if available
    description: event.description,
    cover_image: coverImageUrl,
    registration_needed:
      event.registration_needed == 1 || event.registration_needed === true,
    registration_link: event.registration_link || "#",
    actions: [
      { label: "View Details", link: "", class: "btn-secondary" },
      event.registration_needed == 1 || event.registration_needed === true
        ? {
            label: "Register",
            link: event.registration_link,
            class: "btn-primary",
          }
        : null,
    ].filter(Boolean),
  };
}

function filterAndSearchEvents() {
  const searchInput = document.querySelector(".search-input");
  const filterSelect = document.querySelector(".filter-select");

  if (!searchInput || !filterSelect) return allEvents;

  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedDepartment = filterSelect.value;

  let filteredEvents = allEvents;

  // Apply department filter (case-insensitive for 'All Departments')
  if (
    selectedDepartment &&
    selectedDepartment.toLowerCase() !== "all departments"
  ) {
    filteredEvents = filteredEvents.filter((event) => {
      // event.departments is an array
      return (
        event.departments &&
        event.departments.some(
          (dep) => dep && dep.toLowerCase() === selectedDepartment.toLowerCase()
        )
      );
    });
  }

  // Apply search filter
  if (searchTerm) {
    filteredEvents = filteredEvents.filter((event) => {
      return (
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.location.toLowerCase().includes(searchTerm) ||
        (event.departments &&
          event.departments.some(
            (dep) => dep && dep.toLowerCase().includes(searchTerm)
          ))
      );
    });
  }

  return filteredEvents;
}

// Update rendering to show all department tags
function renderUpcomingEvents(events) {
  const eventsSection = document.querySelector(".events-section");
  if (!eventsSection) return;

  // Hide loading message
  const loadingMsg = document.getElementById("loading-message");
  if (loadingMsg) loadingMsg.style.display = "none";

  // Remove all existing .event-card elements
  eventsSection
    .querySelectorAll(".event-card")
    .forEach((card) => card.remove());

  // Remove any previous no-events message
  eventsSection
    .querySelectorAll(".no-events-message")
    .forEach((msg) => msg.remove());

  // Show message if no events
  if (events.length === 0) {
    const noEventsMessage = document.createElement("div");
    noEventsMessage.className = "no-events-message";
    noEventsMessage.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #64748b;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📅</div>
        <h3>No events found</h3>
        <p>Try adjusting your search or filter criteria.</p>
      </div>
    `;
    eventsSection.appendChild(noEventsMessage);
    return;
  }

  // Modal elements
  const modal = document.getElementById("event-modal");
  const modalBody = document.getElementById("event-modal-body");
  const modalClose = document.getElementById("event-modal-close");
  if (modalClose) {
    modalClose.onclick = () => {
      modal.classList.remove("show");
    };
  }
  window.onclick = function (event) {
    if (event.target === modal) modal.classList.remove("show");
  };

  // Render each event
  events.forEach((event) => {
    const card = document.createElement("div");
    card.className = "event-card";

    // Create event icon/image HTML
    let eventIconHtml = "";
    if (event.cover_image && event.cover_image !== "📅") {
      eventIconHtml = `<img src="${event.cover_image}" alt="${event.title}" class="event-card-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                       <div class="event-icon fallback-icon" style="display: none;">📅</div>`;
    } else {
      eventIconHtml = `<div class="event-icon">${event.icon}</div>`;
    }

    // Render all department tags
    let departmentTagsHtml = "";
    if (event.departmentTags && event.departmentTags.length) {
      departmentTagsHtml = event.departmentTags
        .map(
          (tag) =>
            `<span class="department-tag ${tag.class}">${tag.name}</span>`
        )
        .join(" ");
    }

    card.innerHTML = `
      ${eventIconHtml}
      <div class="event-content">
        <a href="#"><h3 class="event-title">
          ${event.title}
          ${departmentTagsHtml}
        </h3></a>
        <p class="event-subtitle">${event.subtitle}</p>
        <div class="event-details">
          <span>📅 ${event.date} at ${event.time}</span>
          <span>📍 ${event.location}</span>
          ${
            event.registered
              ? `<span>👥 ${event.registered} registered</span>`
              : ""
          }
        </div>
      </div>
      <div class="event-actions">
        <button class="btn btn-secondary view-details-btn">View Details</button>
        ${
          event.registration_needed
            ? `<button class="btn btn-primary register-btn"><a href="${
                event.registration_link || "#"
              }">Register</a></button>`
            : ""
        }
      </div>
    `;
    eventsSection.appendChild(card);

    // Add click handler for View Details
    card.querySelector(".view-details-btn").onclick = () => {
      // Build modal content
      let coverImgHtml = "";
      if (event.cover_image && event.cover_image !== "📅") {
        coverImgHtml = `<img src="${event.cover_image}" alt="Cover" class="event-modal-cover" />`;
      }
      modalBody.innerHTML = `
        ${coverImgHtml}
        <h2>${event.title}</h2>
        <div style="margin: 0.5rem 0;"><strong>Date:</strong> ${
          event.date
        } at ${event.time}</div>
        <div style="margin: 0.5rem 0;"><strong>Location:</strong> ${
          event.location
        }</div>
        <div style="margin: 0.5rem 0;"><strong>Departments:</strong> ${departmentTagsHtml}</div>
        <div style="margin: 1rem 0;">
          <strong>Description:</strong><br>
          ${event.description || event.subtitle || "No description available."}
        </div>
        ${
          event.registration_needed
            ? `<div style="margin-top: 1.5rem;"><a href="${event.registration_link}" target="_blank" class="btn btn-primary">Register for Event</a></div>`
            : ""
        }
      `;
      modal.classList.add("show");
    };
  });
}

function setupSearchAndFilter() {
  const searchInput = document.querySelector(".search-input");
  const filterSelect = document.querySelector(".filter-select");

  if (searchInput) {
    // Debounce search input
    let searchTimeout;
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const filteredEvents = filterAndSearchEvents();
        renderUpcomingEvents(filteredEvents);
      }, 300);
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", () => {
      const filteredEvents = filterAndSearchEvents();
      renderUpcomingEvents(filteredEvents);
    });
  }
}

function updateDepartmentStats(events) {
  // Count events by department (CS, SE, IS only)
  const departmentCounts = { CS: 0, SE: 0, IS: 0 };
  events.forEach((event) => {
    if (event.departments && Array.isArray(event.departments)) {
      event.departments.forEach((dep) => {
        const depCode = dep.toUpperCase();
        if (departmentCounts.hasOwnProperty(depCode)) {
          departmentCounts[depCode] += 1;
        }
      });
    }
  });

  // Update department widget
  const departmentItems = document.querySelectorAll(".department-item");
  departmentItems.forEach((item) => {
    const departmentName = item
      .querySelector(".department-name")
      .textContent.trim();
    const eventCountSpan = item.querySelector(".event-count");

    let count = 0;
    if (departmentName.includes("Computer Science"))
      count = departmentCounts["CS"];
    else if (departmentName.includes("Software Engineering"))
      count = departmentCounts["SE"];
    else if (departmentName.includes("Information Systems"))
      count = departmentCounts["IS"];

    if (eventCountSpan) {
      eventCountSpan.textContent = `${count} events`;
    }
  });

  // Update stats cards
  const upcomingEventsCard = document.querySelector(".upcoming-events h3");
  const activeEventsCard = document.querySelector(".registrations h3");

  if (upcomingEventsCard) {
    upcomingEventsCard.textContent = events.length;
  }

  if (activeEventsCard) {
    const activeEvents = events.filter(
      (event) => event.registration_needed
    ).length;
    activeEventsCard.textContent = activeEvents;
  }
}

// Fetch and set the logged-in user's name in the welcome message
function updateWelcomeUserName() {
  const token = localStorage.getItem("token");
  if (!token) return;
  fetch("http://localhost/USJ_Events_Calender/api/profile.php", {
    headers: { Authorization: "Bearer " + token },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data && data.name) {
        const welcomeTitle = document.querySelector(".welcome-title");
        if (welcomeTitle) {
          welcomeTitle.innerHTML = `Welcome back, <span id="user-name">${data.name}</span>! <span class="new-events-badge">● <span id="new-events-count">3</span> new events</span>`;
        }
      }
    })
    .catch((err) => {
      // Optionally handle error
    });
}

// --- User Dropdown Menu Logic ---
document.addEventListener("DOMContentLoaded", function () {
  const userMenu = document.getElementById("userMenu");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");
  const profileBtn = document.getElementById("profileBtn");

  if (userMenu && userDropdown && logoutBtn) {
    // Toggle dropdown on icon click
    userMenu.addEventListener("click", function (e) {
      e.stopPropagation();
      userMenu.classList.toggle("open");
    });

    // Logout logic
    // logoutBtn.addEventListener("click", function (e) {
    //   e.preventDefault();
    //   localStorage.clear();
    //   window.location.href = "../login/";
    // });

    // Profile logic (for now, just close the dropdown)
    if (profileBtn) {
      profileBtn.addEventListener("click", function (e) {
        e.preventDefault();
        userMenu.classList.remove("open");
        console.log("FILLAFDM");

        window.location.href = "../user-profile";
        // You can add profile navigation here
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
      if (userMenu.classList.contains("open")) {
        userMenu.classList.remove("open");
      }
    });
  }
});

// --- Simple Account Dropdown Logic ---
document.addEventListener("DOMContentLoaded", function () {
  const accountBtn = document.getElementById("accountBtn");
  const accountDropdown = document.getElementById("accountDropdown");
  const logoutSimple = document.getElementById("logoutSimple");
  const profileSimple = document.getElementById("profileSimple");

  if (accountBtn && accountDropdown) {
    accountBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      accountDropdown.style.display =
        accountDropdown.style.display === "block" ? "none" : "block";
    });
    document.addEventListener("click", function () {
      accountDropdown.style.display = "none";
    });
    if (logoutSimple) {
      logoutSimple.addEventListener("click", function (e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "../login/";
      });
    }
    if (profileSimple) {
      profileSimple.addEventListener("click", function (e) {
        e.preventDefault();
        accountDropdown.style.display = "none";
        window.location.href = "../user-profile";
      });
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to view events.");
    // Optionally redirect to login page
    window.location.href = "../login/";
    return;
  }

  // Setup search and filter functionality
  setupSearchAndFilter();

  fetch("http://localhost/USJ_Events_Calender/api/get-events.php", {
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        allEvents = data.map(mapEventToCardData);
        console.log("EVENT DATA", allEvents);
        renderUpcomingEvents(allEvents);
        updateDepartmentStats(allEvents);
      } else {
        console.error("Invalid data format:", data);
        // Fallback to mock data if available
        if (typeof mockUpcomingEvents !== "undefined") {
          allEvents = mockUpcomingEvents;
          renderUpcomingEvents(allEvents);
        }
      }
    })
    .catch((err) => {
      console.error("Failed to load events from backend:", err);
      // Fallback to mock data if available
      if (typeof mockUpcomingEvents !== "undefined") {
        allEvents = mockUpcomingEvents;
        renderUpcomingEvents(allEvents);
      }
    });
  updateWelcomeUserName();
});
