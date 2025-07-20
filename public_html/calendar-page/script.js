// Real Events Data - Will be loaded from database
let mockEvents = [];

// Function to fetch events from database
async function fetchEvents() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No authentication token found");
      return;
    }

    const response = await fetch("/USJ_Events_Calender/api/get-events.php", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Transform database events to match mock events structure exactly
    mockEvents = data.map((event) => {
      // Handle departments as JSON array or string
      let departments;
      if (typeof event.departments === "string") {
        try {
          departments = JSON.parse(event.departments);
        } catch (e) {
          // If it's not JSON, treat as comma-separated string
          departments = event.departments.split(",").map((d) => d.trim());
        }
      } else if (Array.isArray(event.departments)) {
        departments = event.departments;
      } else {
        departments = [];
      }

      return {
        id: event.id,
        title: event.title,
        department: departments, // Now it's always an array
        date: event.event_date,
        startTime: event.event_time,
        endTime: event.event_time, // Using same as start time
        location: event.location,
        attendees: 0, // Default value
        maxAttendees: 100, // Default value
        type: "Event", // Default type
        color: getEventColor(departments),
      };
    });

    console.log("Events loaded from database:", mockEvents);
    renderCalendar(); // Re-render calendar with new data
  } catch (error) {
    console.error("Error fetching events:", error);
    // Fallback to empty events array
    mockEvents = [];
  }
}

// Function to determine event color based on department
function getEventColor(departments) {
  if (!departments || !Array.isArray(departments) || departments.length === 0) {
    return "legend-blue";
  }

  const deptArray = departments.map((d) => d.trim().toUpperCase());

  if (deptArray.length > 1) {
    return "legend-purple"; // Multi-department
  }

  const dept = deptArray[0];
  switch (dept) {
    case "CS":
      return "legend-yellow";
    case "SE":
      return "legend-green";
    case "IS":
      return "legend-pink";
    default:
      return "legend-blue";
  }
}

// Global Variables
let currentDate = new Date(); // Current date (current month and year)
let view = "month";
let selectedDepartment = "all";

// Utility Functions
function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(time) {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function formatHour(hour) {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

// Return events filtered by date & department (uses local date parts)
function getEventsForDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const dateKey = `${y}-${m}-${d}`;

  return mockEvents.filter((event) => {
    // Check if event is on the specified date
    if (event.date !== dateKey) return false;

    // If no department filter is selected, show all events
    if (selectedDepartment === "all") return true;

    // Check if the event's departments include the selected department
    if (event.department && Array.isArray(event.department)) {
      return event.department.some(
        (dept) => dept.trim().toLowerCase() === selectedDepartment.toLowerCase()
      );
    }

    return false;
  });
}

function getBackgroundClassForEvents(dayEvents) {
  if (dayEvents.length === 0) {
    return "bg-calendar-default";
  }

  // Get all departments from all events (handle arrays)
  const allDepartments = [];
  dayEvents.forEach((event) => {
    if (event.department && Array.isArray(event.department)) {
      allDepartments.push(
        ...event.department.map((d) => d.trim().toLowerCase())
      );
    }
  });

  // Get unique departments
  const uniqueDepartments = [...new Set(allDepartments)];

  // If multiple departments are involved, use multi background
  if (uniqueDepartments.length > 1) {
    return "bg-multi";
  }

  // Single department - use department-specific background
  const dept = uniqueDepartments[0];
  const map = { cs: "bg-cs", se: "bg-se", is: "bg-is" };
  return map[dept] || "bg-calendar-default";
}

function renderCalendar() {
  const title = document.getElementById("calendarTitle");
  if (view === "month") {
    const monthYear = currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    title.innerHTML = `<span class="month-year-box">${monthYear}</span>`;
  } else if (view === "week") {
    title.textContent = `Week of ${currentDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  } else {
    title.textContent = formatDate(currentDate);
  }
  updateViewButtons();
  const content = document.getElementById("calendarContent");
  if (view === "month") {
    content.innerHTML = renderMonthView();
  } else if (view === "week") {
    content.innerHTML = renderWeekView();
  } else {
    content.innerHTML = renderDayView();
  }
}

function updateViewButtons() {
  document.getElementById("monthBtn").className =
    view === "month" ? "view-btn active" : "view-btn";
  document.getElementById("weekBtn").className =
    view === "week" ? "view-btn active" : "view-btn";
  document.getElementById("dayBtn").className =
    view === "day" ? "view-btn active" : "view-btn";
}

function renderMonthView() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  let html = `<div class="grid grid-cols-7 gap-2">`;
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  dayNames.forEach((dayName, index) => {
    const isWeekend = index === 0 || index === 6;
    html += `<div class="day-header ${
      isWeekend ? "weekend" : ""
    }">${dayName}</div>`;
  });

  days.forEach((day) => {
    if (!day) {
      html += `<div class="p-2 h-24" style="visibility: hidden;"></div>`;
      return;
    }
    const dayEvents = getEventsForDate(day);
    const isToday = day.toDateString() === new Date().toDateString();
    const bgClass = getBackgroundClassForEvents(dayEvents);
    const imageClass = `date-box ${bgClass}`;
    const uniqueEvents = [];
    const seenTitles = new Set();

    dayEvents.forEach((event) => {
      if (!seenTitles.has(event.title)) {
        seenTitles.add(event.title);
        uniqueEvents.push(event);
      }
    });
    html += `
      <div
        class="${imageClass} p-1 h-24 cursor-pointer flex flex-col
               ${isToday ? "today-glow" : ""}"
        onclick="onDayClick(${day.getFullYear()}, ${day.getMonth()}, ${day.getDate()})"
      >
        <div class="date-number
                    ${isToday ? "text-blue-600" : "text-gray-900"}
                    text-sm font-medium mb-1">
          ${day.getDate()}
        </div>
        <div class="flex-1 space-y-1 overflow-hidden">
          ${uniqueEvents
            .slice(0, 3)
            .map((evt) => {
              // Get department class for consistent styling
              let deptClass = "";
              if (evt.department && Array.isArray(evt.department)) {
                if (evt.department.length > 1) {
                  deptClass = "multi";
                } else if (evt.department.length === 1) {
                  deptClass = evt.department[0].toLowerCase();
                }
              }

              // Truncate long titles for better display
              const displayTitle =
                evt.title.length > 20
                  ? evt.title.substring(0, 20) + "..."
                  : evt.title;

              return `
                <div class="event-title ${deptClass}"
                     title="${evt.title} - ${formatTime(evt.startTime)}"
                     onclick="event.stopPropagation(); showEventModal(${JSON.stringify(
                       evt
                     ).replace(/"/g, "&quot;")})">
                  ${displayTitle}
                </div>
              `;
            })
            .join("")}
          ${
            uniqueEvents.length > 3
              ? `<div class="text-xs text-gray-500 font-medium">+${
                  uniqueEvents.length - 3
                } more events</div>`
              : ""
          }
        </div>
      </div>
    `;
  });
  html += `</div>`;
  return html;
}

function renderWeekView() {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    weekDays.push(d);
  }
  const hours = Array.from({ length: 24 }, (_, i) => i);

  let html = `<div class="week-view-container">
    <div class="week-header">
      <div class="week-header-cell" style="background: transparent; box-shadow: none;"></div>`;

  weekDays.forEach((day) => {
    const isToday = day.toDateString() === new Date().toDateString();
    html += `<div class="week-header-cell ${isToday ? "today" : ""}">
      <div class="day-name">${day.toLocaleDateString("en-US", {
        weekday: "short",
      })}</div>
      <div class="day-number">${day.getDate()}</div>
    </div>`;
  });

  html += `</div>
    <div class="week-grid">
      <div class="time-column">`;

  hours.forEach((hour) => {
    html += `<div class="time-slot">${formatHour(hour)}</div>`;
  });

  html += `</div>`;

  weekDays.forEach((day) => {
    html += `<div class="day-column">`;
    hours.forEach((hour) => {
      const dayEvents = getEventsForDate(day).filter((event) => {
        const eventStart = parseInt(event.startTime.split(":")[0], 10);
        return hour === eventStart;
      });

      const hasEvents = dayEvents.length > 0;
      html += `<div class="hour-slot ${hasEvents ? "has-events" : ""}">`;

      dayEvents.forEach((event) => {
        // Get the first department for CSS class (or use 'multi' if multiple)
        let deptClass = "";
        if (event.department && Array.isArray(event.department)) {
          if (event.department.length > 1) {
            deptClass = "multi";
          } else if (event.department.length === 1) {
            deptClass = event.department[0].toLowerCase();
          }
        }

        html += `<div class="event-item ${deptClass}" 
                 onclick="showEventModal(${JSON.stringify(event).replace(
                   /"/g,
                   "&quot;"
                 )})"
                 title="${event.title} - ${formatTime(event.startTime)}">
          ${event.title}
        </div>`;
      });
      html += `</div>`;
    });
    html += `</div>`;
  });
  html += `</div></div>`;
  return html;
}

function renderDayView() {
  const dayEvents = getEventsForDate(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  let html = `<div class="week-view-container">
    <div class="day-header-info">
      <h3 class="day-title">${formatDate(currentDate)}</h3>
      <p class="day-subtitle">${dayEvents.length} events scheduled</p>
    </div>
    <div class="day-timeline">`;

  hours.forEach((hour) => {
    const hourEvents = dayEvents.filter((event) => {
      const eventStart = parseInt(event.startTime.split(":")[0], 10);
      return hour === eventStart;
    });

    const hasEvents = hourEvents.length > 0;
    html += `<div class="timeline-hour ${hasEvents ? "has-events" : ""}">
      <div class="time-label">${formatHour(hour)}</div>
      <div class="events-container">`;

    hourEvents.forEach((event) => {
      // Get the first department for CSS class (or use 'multi' if multiple)
      let deptClass = "";
      if (event.department && Array.isArray(event.department)) {
        if (event.department.length > 1) {
          deptClass = "multi";
        } else if (event.department.length === 1) {
          deptClass = event.department[0].toLowerCase();
        }
      }

      // Format departments for display
      const deptDisplay =
        event.department && Array.isArray(event.department)
          ? event.department.join(", ")
          : "";

      html += `<div class="event-card ${deptClass}" onclick="showEventModal(${JSON.stringify(
        event
      ).replace(/"/g, "&quot;")})">
        <div class="event-card-header">
          <h4 class="event-title">${event.title}</h4>
          <span class="event-time">${formatTime(event.startTime)}</span>
        </div>
        <div class="event-card-body">
          <div class="event-detail">
            <i class="fas fa-map-marker-alt"></i>
            <span>${event.location}</span>
          </div>
          <div class="event-detail">
            <i class="fas fa-users"></i>
            <span>${deptDisplay}</span>
          </div>
        </div>
      </div>`;
    });
    html += `</div></div>`;
  });
  html += `</div></div>`;
  return html;
}

// Event Handlers
function onDayClick(year, month, date) {
  currentDate = new Date(year, month, date);
  view = "day";
  renderCalendar();
}
function navigatePrevious() {
  if (view === "month") {
    currentDate.setMonth(currentDate.getMonth() - 1);
  } else if (view === "week") {
    currentDate.setDate(currentDate.getDate() - 7);
  } else {
    currentDate.setDate(currentDate.getDate() - 1);
  }
  renderCalendar();
}
function navigateNext() {
  if (view === "month") {
    currentDate.setMonth(currentDate.getMonth() + 1);
  } else if (view === "week") {
    currentDate.setDate(currentDate.getDate() + 7);
  } else {
    currentDate.setDate(currentDate.getDate() + 1);
  }
  renderCalendar();
}
function goToToday() {
  currentDate = new Date();
  renderCalendar();
}
function changeView(newView) {
  view = newView;
  renderCalendar();
}
function changeDepartmentFilter(department) {
  selectedDepartment = department;
  renderCalendar();
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to view the calendar.");
    window.location.href = "../login/";
    return;
  }
  fetch("http://localhost/USJ_Events_Calender/api/get-events.php", {
    headers: { Authorization: "Bearer " + token },
  })
    .then((res) => res.json())
    .then((events) => {
      realEvents = events.map((ev) => ({
        id: ev.id,
        title: ev.title,
        department: Array.isArray(ev.departments)
          ? ev.departments[0] || ""
          : ev.departments || "",
        date: ev.event_date,
        startTime: ev.event_time ? ev.event_time.slice(0, 5) : "00:00",
        endTime: ev.event_time ? ev.event_time.slice(0, 5) : "23:59",
        location: ev.location,
        attendees: ev.registered_count || 0,
        maxAttendees: 100,
        type: "Event",
        color: "legend-blue",
      }));
      renderCalendar();
    });
  document.getElementById("prevBtn").onclick = navigatePrevious;
  document.getElementById("nextBtn").onclick = navigateNext;
  document.getElementById("todayBtn").onclick = goToToday;
  document.getElementById("monthBtn").onclick = () => changeView("month");
  document.getElementById("weekBtn").onclick = () => changeView("week");
  document.getElementById("dayBtn").onclick = () => changeView("day");

  document.getElementById("departmentFilter").onchange = (e) =>
    changeDepartmentFilter(e.target.value);

  // Fetch events from database and then render calendar
  fetchEvents()
    .then(() => {
      renderCalendar();
    })
    .catch((error) => {
      console.error("Failed to fetch events:", error);
      renderCalendar(); // Render with empty events
    });
});

// Modal Functions
function showEventModal(event) {
  const modal = document.getElementById("eventModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");

  modalTitle.textContent = event.title;

  modalBody.innerHTML = `
    <div class="event-details">
      <div class="detail-item">
        <i class="fas fa-clock"></i>
        <span><strong>Time:</strong> ${formatTime(
          event.startTime
        )} - ${formatTime(event.endTime)}</span>
      </div>
      <div class="detail-item">
        <i class="fas fa-map-marker-alt"></i>
        <span><strong>Location:</strong> ${event.location}</span>
      </div>
      <div class="detail-item">
        <i class="fas fa-users"></i>
        <span><strong>Department:</strong> ${event.department}</span>
      </div>
      ${
        event.description
          ? `
        <div class="detail-item">
          <i class="fas fa-info-circle"></i>
          <span><strong>Description:</strong> ${event.description}</span>
        </div>
      `
          : ""
      }
    </div>
  `;

  modal.style.display = "block";
}

function closeEventModal() {
  const modal = document.getElementById("eventModal");
  modal.style.display = "none";
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById("eventModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};
