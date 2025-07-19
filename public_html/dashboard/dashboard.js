// public_html/dashboard/dashboard.js

function mapEventToCardData(event) {
  // Map backend event fields to the card structure
  let departments = [];
  let department = "";
  let departmentTagClass = "";
  try {
    departments = event.departments ? JSON.parse(event.departments) : [];
    department = departments[0] ? departments[0].toUpperCase() : "";
    departmentTagClass = departments[0]
      ? "tag-" + departments[0].toLowerCase()
      : "";
  } catch (e) {
    department = "";
    departmentTagClass = "";
  }
  return {
    id: event.id,
    icon: "📅", // You can customize this or use event.cover_image
    title: event.title,
    department,
    departmentTagClass,
    subtitle: event.description || "",
    date: event.event_date,
    time: event.event_time,
    location: event.location,
    registered: "", // Add registration info if available
    description: event.description,
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

function renderUpcomingEvents(events) {
  const eventsSection = document.querySelector(".events-section");
  if (!eventsSection) return;

  // Remove all existing .event-card elements
  eventsSection
    .querySelectorAll(".event-card")
    .forEach((card) => card.remove());

  // Render each event
  events.forEach((event) => {
    const card = document.createElement("div");
    card.className = "event-card";
    card.innerHTML = `
      <div class="event-icon">${event.icon}</div>
      <div class="event-content">
        <a href=""><h3 class="event-title">
          ${event.title}
          <span class="department-tag ${event.departmentTagClass}">${
      event.department
    }</span>
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
        ${event.actions
          .map(
            (action) =>
              `<button class="btn ${action.class}"><a href="${
                action.link || "#"
              }">${action.label}</a></button>`
          )
          .join("")}
      </div>
    `;
    eventsSection.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You must be logged in to view events.");
      // Optionally redirect to login page
      window.location.href = "../login/";
      return;
    }
  
    fetch("http://localhost/USJ_Events_Calender/api/get-events.php", {
      headers: {
        "Authorization": "Bearer " + token
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped = data.map(mapEventToCardData);
          console.log("DATA", mapped);
          renderUpcomingEvents(mapped);
        } else {
          renderUpcomingEvents(mockUpcomingEvents);
        }
      })
      .catch((err) => {
        console.error("Failed to load events from backend:", err);
        renderUpcomingEvents(mockUpcomingEvents);
      });
  });
