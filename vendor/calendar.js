document.addEventListener('DOMContentLoaded', function() {
    const daysTag = document.querySelector("#calendar");
    const currentMonthYear = document.getElementById('current-month-year');
    const eventList = {
        3: {
            2: "Parents Meeting",
            4: "Opening Camp",
            5: "Opening Camp",
            22: "CEC",
            25: "Observed Holiday",
            29: "Easter Event"
        },
        4: {
            6: "Parents Meeting",
            22: "Midterm Exam Week",
            23: "Midterm Exam Week",
            24: "Midterm Exam Week",
            25: "Midterm Exam Week",
            26: "Midterm Exam Week"
        },
        5: {
            4: "Parents Meeting",
            11: "Spring Sport Day",
            31: "Field Trip"
        },
        6: {
            1: "Parents Meeting",
            10: "Dress Up Week",
            11: "Dress Up Week",
            12: "Dress Up Week",
            13: "Dress Up Week",
            14: "Dress Up Week"
        },
        7: {
            6: "Parents Meeting",
            15: "Final Exam Week",
            16: "Final Exam Week",
            17: "Final Exam Week",
            18: "Final Exam Week",
            26: "Closing Ceremony"
        },
        8: {
            19: "Intensive Week",
            20: "Intensive Week",
            21: "Intensive Week",
            22: "Intensive Week",
            23: "Intensive Week",
            24: "Intensive Week",
            25: "Intensive Week",
            26: "Intensive Week",
            27: "Intensive Week",
            28: "Intensive Week",
            29: "Intensive Week",
            30: "Intensive Week"
        },
        9: {
            2: "Opening Camp",
            3: "Opening Camp",
            7: "Parents Meeting",
            16: "Chuseok",
            17: "Chuseok",
            18: "Chuseok"
        },
        10: {
            5: "Parents Meeting",
            12: "Fall Sport Day",
            14: "Observed Holiday",
            21: "Midterm Exam Week",
            22: "Midterm Exam Week",
            23: "Midterm Exam Week",
            24: "Midterm Exam Week",
            25: "Midterm Exam Week",
        },
        11: {
            1: "Hallelujah Day",
            2: "Parents Meeting",
            25: "AASC",
            26: "AASC",
            27: "AASC",
            28: "AASC",
            29: "AASC"
        },
        12: {
            7: "Parents Meeting",
            20: "Secret Angels Day",
            21: "Christmas Concert",
            23: "Observed Holiday"
        },
        // Add all other months similarly up to January 2025
        1: { 
            4: "Parents Meeting",
            13: "Final Exam Week",
            14: "Final Exam Week",
            15: "Final Exam Week",
            16: "Final Exam Week",
            17: "Observed Holiday",
            24: "Closing Ceremony",
            25: "Graduation Ceremony"
        }
    };

    let date = new Date();
    let currYear = date.getFullYear();
    let currMonth = date.getMonth();

    const renderCalendar = () => {
        date.setDate(1);
        const monthDays = document.createDocumentFragment();
        const lastDay = new Date(currYear, currMonth + 1, 0).getDate();
        const prevLastDay = new Date(currYear, currMonth, 0).getDate();
        const firstDayIndex = date.getDay();
        const lastDayIndex = new Date(currYear, currMonth + 1, 0).getDay();
        const nextDays = 7 - lastDayIndex - 1;

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        currentMonthYear.textContent = `${months[currMonth]} ${currYear}`;

        // Creating day names
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
            const dayNameElement = document.createElement("div");
            dayNameElement.classList.add('day-name');
            dayNameElement.innerText = day;
            monthDays.appendChild(dayNameElement);
        });

        // Days of previous month
        for (let i = firstDayIndex; i > 0; i--) {
            const dayElement = document.createElement("div");
            dayElement.classList.add('day');
            dayElement.innerText = prevLastDay - i + 1;
            monthDays.appendChild(dayElement);
        }

        // Current month days
        for (let i = 1; i <= lastDay; i++) {
            const dayElement = document.createElement("div");
            dayElement.classList.add('day');
            dayElement.innerText = i;
            if (i === new Date().getDate() && currMonth === new Date().getMonth() && currYear === new Date().getFullYear()) {
                dayElement.classList.add('current-day');
            }

            // Adding events to the day
            if (eventList[currMonth + 1] && eventList[currMonth + 1][i]) {
                const eventDiv = document.createElement('div');
                eventDiv.className = 'event';
                eventDiv.textContent = eventList[currMonth + 1][i];
                dayElement.appendChild(eventDiv);
            }

            monthDays.appendChild(dayElement);
        }

        // Days of next month
        for (let i = 1; i <= nextDays; i++) {
            const dayElement = document.createElement("div");
            dayElement.classList.add('day');
            dayElement.innerText = i;
            monthDays.appendChild(dayElement);
        }

        daysTag.innerHTML = ''; // Clear previous content
        daysTag.appendChild(monthDays);
    }

    renderCalendar();

    document.getElementById('prev-month').addEventListener('click', () => {
        currMonth--;
        if (currMonth < 0) {
            currMonth = 11;
            currYear--;
        }
        renderCalendar();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currMonth++;
        if (currMonth > 11) {
            currMonth = 0;
            currYear++;
        }
        renderCalendar();
    });

    // Function to adjust calendar size based on window size
    function adjustCalendarSize() {
        const width = window.innerWidth;
        if (width < 600) {
            document.documentElement.style.setProperty('--day-height', '40px');
        } else {
            document.documentElement.style.setProperty('--day-height', '50px');
        }
    }

    // Event listeners for resizing and initial load
    window.addEventListener('resize', adjustCalendarSize);
    window.addEventListener('load', adjustCalendarSize);
});