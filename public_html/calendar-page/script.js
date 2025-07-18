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
  }
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

  return mockEvents.filter(event =>
    (selectedDepartment === "all" || event.department === selectedDepartment) &&
    event.date === dateKey
  );
}

// Updated function to handle background selection with unique events
function getBackgroundClassForEvents(dayEvents) {
  if (dayEvents.length === 0) {
    return "bg-calendar-default";
  }
  
  // Get unique departments from all events
  const uniqueDepartments = [...new Set(dayEvents.map(event => event.department))];
  
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
    view === "month" ? "btn-default btn-sm" : "btn-ghost btn-sm";
  document.getElementById("weekBtn").className =
    view === "week" ? "btn-default btn-sm" : "btn-ghost btn-sm";
  document.getElementById("dayBtn").className =
    view === "day" ? "btn-default btn-sm" : "btn-ghost btn-sm";
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
    html += `<div class="day-header ${isWeekend ? 'weekend' : ''}">${dayName}</div>`;
  });

  days.forEach(day => {
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
    
    dayEvents.forEach(event => {
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
          ${uniqueEvents.slice(0, 2).map(evt => `
            <div class="event-title ${evt.color}"
                 title="${evt.title}">
              ${evt.title}
            </div>
          `).join("")}
          ${uniqueEvents.length > 2
            ? `<div class="text-xs text-gray-500">+${uniqueEvents.length - 2} more</div>`
            : ""}
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

  let html = `<div class="flex flex-col">
    <div class="grid grid-cols-8 gap-1 mb-2">
      <div class="p-2"></div>`;

  weekDays.forEach(day => {
    const isToday = day.toDateString() === new Date().toDateString();
    html += `<div class="p-2 text-center font-semibold ${
      isToday ? "bg-blue-100 text-blue-600" : "bg-gray-50 text-gray-600"
    }">
      <div class="text-sm">${day.toLocaleDateString("en-US", { weekday: "short" })}</div>
      <div class="text-lg">${day.getDate()}</div>
    </div>`;
  });

  html += `</div><div class="grid grid-cols-8 gap-1 max-h-96 overflow-y-auto">`;

  hours.forEach(hour => {
    html += `<div class="contents">
      <div class="p-2 text-xs text-gray-500 bg-gray-50 text-right">${formatHour(hour)}</div>`;

    weekDays.forEach(day => {
      const dayEvents = getEventsForDate(day).filter(event => {
        const eventStart = parseInt(event.startTime.split(":")[0], 10);
        const eventEnd = parseInt(event.endTime.split(":")[0], 10);
        return hour >= eventStart && hour < eventEnd;
      });

      html += `<div class="p-1 h-12 border border-gray-100 bg-calendar-cell">`;

      dayEvents.forEach(event => {
        html += `<div class="text-xs p-1 rounded text-white truncate ${event.color}"
                 title="${event.title} - ${formatTime(event.startTime)}">${event.title}</div>`;
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

  let html = `<div class="space-y-4">
    <div class="text-center p-4 bg-gray-50 rounded-lg">
      <h3 class="text-lg font-semibold">${formatDate(currentDate)}</h3>
      <p class="text-sm text-gray-600">${dayEvents.length} events scheduled</p>
    </div>
    <div class="grid grid-cols-1 gap-1 max-h-96 overflow-y-auto">`;

  hours.forEach(hour => {
    const hourEvents = dayEvents.filter(event => {
      const eventStart = parseInt(event.startTime.split(":")[0], 10);
      const eventEnd = parseInt(event.endTime.split(":")[0], 10);
      return hour >= eventStart && hour < eventEnd;
    });

    html += `<div class="flex border-b border-gray-100">
      <div class="w-20 p-2 text-sm text-gray-500 bg-gray-50">${formatHour(hour)}</div>
      <div class="flex-1 p-2 min-h-16">`;

    hourEvents.forEach(event => {
      html += `<div class="event-card mb-2">
        <div class="card-content p-3">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="font-semibold text-sm">${event.title}</h4>
              <div class="flex items-center gap-4 mt-1 text-xs text-gray-600">
                <span class="flex items-center gap-1">
                  <span class="icon">&#128337;</span>
                  ${formatTime(event.startTime)} - ${formatTime(event.endTime)}
                </span>
                <span class="flex items-center gap-1">
                  <span class="icon">&#128205;</span>
                  ${event.location}
                </span>
                <span class="flex items-center gap-1">
                  <span class="icon">&#128101;</span>
                  ${event.attendees}/${event.maxAttendees}
                </span>
              </div>  
            </div>
            <span class="badge badge-secondary">${event.department}</span>
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

  document.getElementById("departmentFilter").onchange = e =>
    changeDepartmentFilter(e.target.value);

  renderCalendar();
});


