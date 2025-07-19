// public_html/dashboard/dashboard.js

document.addEventListener("DOMContentLoaded", function () {
  const eventsSection = document.querySelector(".events-section");
  if (!eventsSection || typeof mockUpcomingEvents === "undefined") return;

  // Remove all existing .event-card elements
  eventsSection
    .querySelectorAll(".event-card")
    .forEach((card) => card.remove());

  // Render each event
  mockUpcomingEvents.forEach((event) => {
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
          <span>👥 ${event.registered} registered</span>
        </div>
      </div>
      <div class="event-actions">
        ${event.actions
          .map(
            (action) =>
              `<button class="btn ${action.class}"><a href="${action.link}">${action.label}</a></button>`
          )
          .join("")}
      </div>
    `;
    eventsSection.appendChild(card);
  });
});
