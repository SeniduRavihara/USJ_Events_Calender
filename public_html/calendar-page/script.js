// Mock Events Data
const mockEvents = [
  {
    id: 1,
    title: "AI Workshop Series",
    department: "IS",
    date: "2025-06-11",
    startTime: "14:00",
    endTime: "16:00",
    location: "Lab 301",
    attendees: 45,
    maxAttendees: 50,
    type: "Workshop",
    color: "legend-blue",
  },
  {
    id: 2,
    title: "Software Architecture Seminar",
    department: "SE",
    date: "2025-06-28",
    startTime: "10:00",
    endTime: "12:00",
    location: "Auditorium A",
    attendees: 32,
    maxAttendees: 100,
    type: "Seminar",
    color: "legend-blue",
  },
  {
    id: 3,
    title: "Database Design Competition",
    department: "IS",
    date: "2025-07-18",
    startTime: "09:00",
    endTime: "17:00",
    location: "Computer Lab 2",
    attendees: 28,
    maxAttendees: 30,
    type: "Competition",
    color: "legend-purple",
  },
  {
    id: 4,
    title: "Team Meeting",
    department: "CS",
    date: "2025-06-25",
    startTime: "10:00",
    endTime: "11:00",
    location: "Room 205",
    attendees: 12,
    maxAttendees: 15,
    type: "Meeting",
    color: "legend-orange",
  },
  {
    id: 5,
    title: "Project Presentation",
    department: "SE",
    date: "2025-06-26",
    startTime: "15:30",
    endTime: "17:30",
    location: "Main Hall",
    attendees: 67,
    maxAttendees: 80,
    type: "Presentation",
    color: "legend-red",
  },
  {
    id: 6,
    title: "Normal Presentation and Viva",
    department: "CS",
    date: "2025-06-26",
    startTime: "15:30",
    endTime: "17:30",
    location: "Main Hall",
    attendees: 67,
    maxAttendees: 80,
    type: "Presentation",
    color: "legend-red",
  },
  {
    id: 6,
    title: "Normal Presentation and Viva",
    department: "IS",
    date: "2025-06-26",
    startTime: "15:30",
    endTime: "17:30",
    location: "Main Hall",
    attendees: 67,
    maxAttendees: 80,
    type: "Presentation",
    color: "legend-red",
  },
];

// Global Variables
let currentDate = new Date(2025, 5, 25); // June 25, 2025 (month is 0-indexed)
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

  return mockEvents.filter(
    (event) =>
      (selectedDepartment === "all" ||
        event.department === selectedDepartment) &&
      event.date === dateKey
  );
}

// Updated function to handle background selection with unique events
function getBackgroundClassForEvents(dayEvents) {
  if (dayEvents.length === 0) {
    return "bg-calendar-default";
  }

  // Get unique departments from all events
  const uniqueDepartments = [
    ...new Set(dayEvents.map((event) => event.department)),
  ];

  // If multiple departments are involved, use multi background
  if (uniqueDepartments.length > 1) {
    return "bg-multi";
  }

  // Single department - use department-specific background
  const dept = uniqueDepartments[0].toLowerCase(); // "cs","se","is"
  const map = { cs: "bg-cs", se: "bg-se", is: "bg-is" };
  return map[dept] || "bg-calendar-default";
}

// Main render function
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

// Update the renderMonthView function - replace the day headers section
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

  // UPDATED: Enhanced day headers with colors and rounded borders
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

    // Group events by title to show unique titles only
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
        class="${imageClass} p-1 h-24 cursor-pointer hover:bg-gray-50 flex flex-col
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
            .slice(0, 2)
            .map(
              (evt) => `
            <div class="event-title ${evt.color}"
                 title="${evt.title}">
              ${evt.title}
            </div>
          `
            )
            .join("")}
          ${
            uniqueEvents.length > 2
              ? `<div class="text-xs text-gray-500">+${
                  uniqueEvents.length - 2
                } more</div>`
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
        const deptClass = event.department
          ? event.department.toLowerCase()
          : "";
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
      const deptClass = event.department ? event.department.toLowerCase() : "";
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
            <span>${event.department}</span>
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

// Use local year, month, date to avoid timezone shifts
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

// Initialize Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("prevBtn").onclick = navigatePrevious;
  document.getElementById("nextBtn").onclick = navigateNext;
  document.getElementById("todayBtn").onclick = goToToday;

  document.getElementById("monthBtn").onclick = () => changeView("month");
  document.getElementById("weekBtn").onclick = () => changeView("week");
  document.getElementById("dayBtn").onclick = () => changeView("day");

  document.getElementById("departmentFilter").onchange = (e) =>
    changeDepartmentFilter(e.target.value);

  renderCalendar();
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
