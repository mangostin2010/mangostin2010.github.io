document.addEventListener('DOMContentLoaded', function() {
    const daysTag = document.querySelector("#calendar");
    const currentMonthYear = document.getElementById('current-month-year');
    const eventList = {
        3: {
            2: ["Parents Meeting", "#3d9fac"],
            4: ["Opening Camp", "#3d9fac"],
            5: ["Opening Camp", "#3d9fac"],
            22: ["CEC", "#3d9fac"],
            25: ["Observed Holiday", "rgb(233 89 89)"], // No school event marked in red
            29: ["Easter Event", "#3d9fac"]
        },
        4: {
            6: ["Parents Meeting", "#3d9fac"],
            22: ["Midterm Exam Week", "#3d9fac"],
            23: ["Midterm Exam Week", "#3d9fac"],
            24: ["Midterm Exam Week", "#3d9fac"],
            25: ["Midterm Exam Week", "#3d9fac"],
            26: ["Midterm Exam Week", "#3d9fac"]
        },
        5: {
            4: ["Parents Meeting", "#3d9fac"],
            11: ["Spring Sport Day", "#3d9fac"],
            31: ["Field Trip", "#3d9fac"]
        },
        6: {
            1: ["Parents Meeting", "#3d9fac"],
            10: ["Dress Up Week", "#3d9fac"],
            11: ["Dress Up Week", "#3d9fac"],
            12: ["Dress Up Week", "#3d9fac"],
            13: ["Dress Up Week", "#3d9fac"],
            14: ["Dress Up Week", "#3d9fac"]
        },
        7: {
            6: ["Parents Meeting", "#3d9fac"],
            15: ["Final Exam Week", "#3d9fac"],
            16: ["Final Exam Week", "#3d9fac"],
            17: ["Final Exam Week", "#3d9fac"],
            18: ["Final Exam Week", "#3d9fac"],
            26: ["Closing Ceremony", "#3d9fac"]
        },
        8: {
            19: ["Intensive Week", "#3d9fac"],
            20: ["Intensive Week", "#3d9fac"],
            21: ["Intensive Week", "#3d9fac"],
            22: ["Intensive Week", "#3d9fac"],
            23: ["Intensive Week", "#3d9fac"],
            24: ["Intensive Week", "#3d9fac"],
            25: ["Intensive Week", "#3d9fac"],
            26: ["Intensive Week", "#3d9fac"],
            27: ["Intensive Week", "#3d9fac"],
            28: ["Intensive Week", "#3d9fac"],
            29: ["Intensive Week", "#3d9fac"],
            30: ["Intensive Week", "#3d9fac"]
        },
        9: {
            2: ["Opening Camp", "#3d9fac"],
            3: ["Opening Camp", "#3d9fac"],
            7: ["Parents Meeting", "#3d9fac"],
            16: ["Chuseok", "rgb(233 89 89)"], // No school event marked in red
            17: ["Chuseok", "rgb(233 89 89)"], // No school event marked in red
            18: ["Chuseok", "rgb(233 89 89)"]  // No school event marked in red
        },
        10: {
            5: ["Parents Meeting", "#3d9fac"],
            12: ["Fall Sport Day", "#3d9fac"],
            14: ["Observed Holiday", "rgb(233 89 89)"], // No school event marked in red
            21: ["Midterm Exam Week", "#3d9fac"],
            22: ["Midterm Exam Week", "#3d9fac"],
            23: ["Midterm Exam Week", "#3d9fac"],
            24: ["Midterm Exam Week", "#3d9fac"],
            25: ["Midterm Exam Week", "#3d9fac"]
        },
        11: {
            1: ["Hallelujah Day", "#3d9fac"],
            2: ["Parents Meeting", "#3d9fac"],
            25: ["AASC", "#3d9fac"],
            26: ["AASC", "#3d9fac"],
            27: ["AASC", "#3d9fac"],
            28: ["AASC", "#3d9fac"],
            29: ["AASC", "#3d9fac"]
        },
        12: {
            7: ["Parents Meeting", "#3d9fac"],
            20: ["Secret Angels Day", "#3d9fac"],
            21: ["Christmas Concert", "#3d9fac"],
            23: ["Observed Holiday", "rgb(233 89 89)"] // No school event marked in red
        },
        1: { 
            4: ["Parents Meeting", "#3d9fac"],
            13: ["Final Exam Week", "#3d9fac"],
            14: ["Final Exam Week", "#3d9fac"],
            15: ["Final Exam Week", "#3d9fac"],
            16: ["Final Exam Week", "#3d9fac"],
            17: ["Observed Holiday", "rgb(233 89 89)"], // No school event marked in red
            24: ["Closing Ceremony", "#3d9fac"],
            25: ["Graduation Ceremony", "#3d9fac"]
        }
    };

    let date = new Date();
    let currYear = date.getFullYear();
    let currMonth = date.getMonth();

    const renderCalendar = () => {
        date.setDate(1); // Set date to the first day of the current month
        const monthDays = document.createDocumentFragment();
        const lastDay = new Date(currYear, currMonth + 1, 0).getDate(); // Get the last day of the current month
        const firstDayIndex = date.getDay(); // Get the weekday of the first day of the current month
        const lastDayIndex = new Date(currYear, currMonth + 1, 0).getDay(); // Get the weekday of the last day of the current month
        const prevLastDay = new Date(currYear, currMonth, 0).getDate(); // Get the last day of the previous month
        const nextDays = 7 - lastDayIndex - 1; // Calculate the number of days to display from the next month

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        currentMonthYear.textContent = `${months[currMonth]} ${currYear}`;

        // Creating day names
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
            const dayNameElement = document.createElement("div");
            dayNameElement.classList.add('day-name');
            dayNameElement.innerText = day;
            monthDays.appendChild(dayNameElement);
        });

        // Days of previous month (grayed out)
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
            if (i === new Date().getDate() && currMonth === new Date().getMonth() && currYear === new Date().getFullYear()) {
                dayElement.classList.add('current-day');
            }

            // Adding events to the day
            if (eventList[currMonth + 1] && eventList[currMonth + 1][i]) {
                const eventDiv = document.createElement('div');
                eventDiv.className = 'event';
                eventDiv.textContent = eventList[currMonth + 1][i][0]; // Set event name
                eventDiv.style.backgroundColor = eventList[currMonth + 1][i][1] || '#3d9fac'; // Set event color, defaulting to #3d9fac
                dayElement.appendChild(eventDiv);
            }

            monthDays.appendChild(dayElement);
        }

        // Days of next month (grayed out)
        for (let i = 1; i <= nextDays; i++) {
            const dayElement = document.createElement("div");
            dayElement.classList.add('day', 'next-month-day', 'grayed-out');
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
