document.addEventListener('DOMContentLoaded', function() {
    const daysTag = document.querySelector("#calendar");
    const currentMonthYear = document.getElementById('current-month-year');
    let eventList = {};

    // Fetching events from JSON
    fetch('https://raw.githubusercontent.com/mangostin2010/mangostin2010.github.io/main/assets/eventList.json')
    .then(response => response.json())
    .then(data => {
        eventList = data;
        renderCalendar(); // Render calendar after fetching data
    });

    let date = new Date();
    let currYear = date.getFullYear();
    let currMonth = date.getMonth();

    const renderCalendar = () => {
        date.setDate(1); // Set date to the first day of the current month
        const monthDays = document.createDocumentFragment();
        const lastDay = new Date(currYear, currMonth + 1, 0).getDate(); // Last day of the month
        const firstDayIndex = date.getDay(); // First day index
        const lastDayIndex = new Date(currYear, currMonth + 1, 0).getDay(); // Last day index
        const prevLastDay = new Date(currYear, currMonth, 0).getDate(); // Last day of previous month
        const nextDays = 7 - lastDayIndex - 1; // Days from next month

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        currentMonthYear.textContent = `${months[currMonth]} ${currYear}`;

        // Day names
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
            const dayNameElement = document.createElement("div");
            dayNameElement.classList.add('day-name');
            dayNameElement.innerText = day;
            monthDays.appendChild(dayNameElement);
        });

        // Previous month days (grayed out)
        for (let i = firstDayIndex; i > 0; i--) {
            const dayElement = document.createElement("div");
            dayElement.classList.add('day', 'prev-month-day', 'grayed-out');
            dayElement.innerText = prevLastDay - i + 1;
            monthDays.appendChild(dayElement);
        }

        // Current month days
        for (let i = 1; i <= lastDay; i++) {
            const dayElement = document.createElement("div");
            dayElement.classList.add('day');
            dayElement.innerText = i;

            // Highlight current day
            if (i === new Date().getDate() && currMonth === new Date().getMonth() && currYear === new Date().getFullYear()) {
                dayElement.classList.add('current-day');
            }

            // Check if events exist for the day
            if (eventList[currMonth + 1] && eventList[currMonth + 1][i]) {
                const eventDiv = document.createElement('div');
                eventDiv.className = 'event';
                eventDiv.textContent = eventList[currMonth + 1][i][0]; // Event name
                eventDiv.style.backgroundColor = eventList[currMonth + 1][i][1] || '#3d9fac'; // Event color
                dayElement.appendChild(eventDiv);
            }

            monthDays.appendChild(dayElement);
        }

        // Next month days (grayed out)
        for (let i = 1; i <= nextDays; i++) {
            const dayElement = document.createElement("div");
            dayElement.classList.add('day', 'next-month-day', 'grayed-out');
            dayElement.innerText = i;
            monthDays.appendChild(dayElement);
        }

        daysTag.innerHTML = ''; // Clear previous content
        daysTag.appendChild(monthDays);
    };

    // Initial render
    renderCalendar();

    // Navigation buttons
    document.getElementById('prev-month').addEventListener('click', () => {
        currMonth--;
        if (currMonth < 0) {
            currMonth = 11;
            currYear--;
        }
        date = new Date(currYear, currMonth, 1);
        renderCalendar();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currMonth++;
        if (currMonth > 11) {
            currMonth = 0;
            currYear++;
        }
        date = new Date(currYear, currMonth, 1);
        renderCalendar();
    });

    // Adjust calendar size based on window size
    function adjustCalendarSize() {
        const width = window.innerWidth;
        if (width < 600) {
            document.documentElement.style.setProperty('--day-height', '40px');
        } else {
            document.documentElement.style.setProperty('--day-height', '50px');
        }
    }

    // Resize events
    window.addEventListener('resize', adjustCalendarSize);
    window.addEventListener('load', adjustCalendarSize);
});
