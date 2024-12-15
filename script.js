dataInput = document.getElementById("dailies").value;
reasonInput = document.getElementById("dailies-description").value;
let settingButton = document.querySelectorAll(".setting");
let dataField = dataInput = document.getElementById("dailies");
let reasonField = document.getElementById("dailies-description");
let inputMode = "us";
let selectedDate = null;
let selectedDateReformat = null;
let tutorialButton = document.getElementById("tutorialButton");
let habitLog = document.getElementById("log");
let contributeGraph = document.getElementById("tracker");
let lineGraph = document.getElementById("line-graph");
let lineTab = document.getElementById("2");
let contributeTab = document.getElementById("1");
let logTab = document.getElementById("3");
let tutorial = document.getElementById("tutorial");
let colorCensor = document.getElementById("intro");
let introVisible = true;
const savedValues = {};

for (let year = 0; year < 300; year++) {
    for (let month = 1; month <= 12; month++) {
        for (let day = 1; day <= 31; day++) {
            const dateKey = String(day).padStart(2, '0') + String(month).padStart(2, '0');
            if (new Date(year + 2000, month - 1, day).getMonth() === (month - 1)) {
                savedValues[dateKey] = null;
            }
        }
    }
}

document.getElementById('adjustdate').addEventListener('change', function() {
    selectedDate = new Date(this.value + 'T00:00:00');
    const selectedDay = String(selectedDate.getDate()).padStart(2, '0');
    const selectedMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
    selectedDateReformat = `${selectedDay}${selectedMonth}`;
});

document.getElementById("dailies").addEventListener('input', function() {
    dataInput = this.value;
    valueIndex();
    habitTracker();
});

document.getElementById("dailies-description").addEventListener('input', function() {
    reasonInput = this.value;
    valueIndex();
    habitTracker();
});

const now = new Date();
const formattedDate = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}`;

function getCell() {
    if (selectedDate == null) {
        // if selectedDate is null, default to today's date
        return document.querySelector(`td[label="${formattedDate}"]`);
    } else {
        return document.querySelector(`td[label="${selectedDateReformat}"]`);
    }
}

function getColor(value) {
    if (value === null) return "";
    return value <= 15 ? "#00509D" : value < 30 ? "#80BFFA" : "#FDC500";
}

function habitTracker() {
    const cell = getCell();
    const color = getColor(dataInput);
    if (cell.style.backgroundColor !== color) {
        cell.style.backgroundColor = color;
    }
}

const tableDays = document.querySelectorAll(".day");
tableDays.forEach(day => {
    day.addEventListener("mouseover", function() {
        const dateValue = day.getAttribute("label");
        const dateValue1 = dateValue.slice(0, 2);
        const dateValue2 = dateValue.slice(2, 4);
        const hoverDate = day.querySelector(".selectedDate");
        hoverDate.innerHTML = inputMode === "eu" ? `${dateValue1}/${dateValue2}` : `${dateValue2}/${dateValue1}`;
    });
});
displayText = document.getElementById("display");

function eu() {
    inputMode = "eu";
    displayText.innerText = "Display set to European Format (DD/MM)";
    setTimeout(clearDisplayMessage, 5000);
}

function us() {
    inputMode = "us";
    displayText.innerText = "Display set to USA Format (MM/DD)";
    setTimeout(clearDisplayMessage, 5000);
}

function clearDisplayMessage() {
    displayText.innerText = "";
}

function valueIndex() {
    const key = selectedDate == null ? formattedDate : selectedDateReformat;
    savedValues[key] = Number(dataInput);
    savedValues[`${key}_reason`] = reasonInput;

    const cell = getCell();
    const displayValue = cell.querySelector(".storedinput");
    const displayReason = cell.querySelector(".storedreason");
    displayValue.innerHTML = dataInput;
    displayReason.innerHTML = reasonInput;
    saveToLocalStorage();
}

function adjustDateInput() {
    const newDateValue = document.getElementById("adjustdate").value;

    if (newDateValue) {
        //reformat date to retrieve matching label from the table
        const dateObject = new Date(newDateValue);
        const formattedDate = `${String(dateObject.getDate()).padStart(2, '0')}${String(dateObject.getMonth() + 1).padStart(2, '0')}`;
    } else {
        console.log("No date selected");
    }
}

function saveToLocalStorage() {
    localStorage.setItem('savedValues', JSON.stringify(savedValues));
}


function updateUIFromSavedValues() {
    const tableDays = document.querySelectorAll(".day");
    tableDays.forEach(day => {
        const dateLabel = day.getAttribute("label");
        if (dateLabel in savedValues) {
            const displayValue = day.querySelector(".storedinput");
            displayValue.innerHTML = savedValues[dateLabel];
            const displayReason = day.querySelector(".storedreason");
            displayReason.innerHTML = savedValues[`${dateLabel}_reason`] || '';
        }
    });
}


function updateColors() {
    const tableDays = document.querySelectorAll(".day");
    tableDays.forEach(day => {
        const dateLabel = day.getAttribute("label");
        const value = savedValues[dateLabel];
 if (value !== null) {
            const color = getColor(value);
            if (day.style.backgroundColor !== color) {
                day.style.backgroundColor = color;
            }
        } else {
            if (themeChoice === "light" ){
            day.style.backgroundColor = "#EFEFD0";
            day.style.borderColor = "#003F88";
        } else if (themeChoice === "dark" ){
            day.style.backgroundColor = "#10102f";
            day.style.borderColor = "#0062ff";
        } else if (themeChoice === "nyx" ){
            day.style.backgroundColor = "#10102f";
            day.style.borderColor = "#6A5CC2";
        }
        }
    });
}

function loadFromLocalStorage() {
    const storedValues = localStorage.getItem('savedValues');
    if (storedValues) {
        Object.assign(savedValues, JSON.parse(storedValues));
        updateUIFromSavedValues();
        updateColors();
    }
}

document.addEventListener('DOMContentLoaded', loadFromLocalStorage);

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    createChart();
});

// chart.js demo
Chart.defaults.font.family = "Itim";
Chart.defaults.font.size = 16;
Chart.defaults.color = "#00296B";

function createChart() {
    const savedData = JSON.parse(localStorage.getItem('savedValues'));
    const reasonData = {};

    for (const key in savedData) {
        if (savedData.hasOwnProperty(key) && !key.endsWith('_reason')) {
            const reason = savedData[`${key}_reason`];
            if (reason) {
                if (!reasonData[reason]) {
                    reasonData[reason] = [];
                }
                reasonData[reason].push(savedData[key]);
            }
        }
    }

    const chartLabels = Object.keys(reasonData).slice(0, 5); // limit chart to 5 reasons
    const colorsArray = ["#80BFFA", "#FDC500", "#00509D", "#FFD500", "#00296B"];
    const datasets = chartLabels.map((reason, index) => ({
        label: reason,
        data: reasonData[reason],
        borderColor: colorsArray[index],
        backgroundColor: colorsArray[index] + '1A',
    }));

    new Chart("myChart", {
        type: "radar",
        data: {
            labels: chartLabels,
            datasets: datasets,
        },

        options: {
            plugins: {
                legend: {
                    display: true,
                    position: 'left',
                    labels: {
                        font: {
                            size: 15,
                        }
                    }
                }
            }
        }
    });
}

// end chart.js demo

tutorialButton.addEventListener("click", function() {
    introVisible = false;
    localStorage.setItem('introStatus', introVisible);
    nukeIntro();
});

// allows tutorial to never appear again after first unique visit

function nukeIntro() {
    introVisible = localStorage.getItem('introStatus');
    if (introVisible) {
        tutorial.remove();
        colorCensor.remove();
    } else {
        return
    }
};

document.addEventListener('DOMContentLoaded', nukeIntro());

logTab.addEventListener("click", function() {
    contributeGraph.style.display = "none";
    lineGraph.style.display = "none";
    habitLog.style.display = "block";
});

lineTab.addEventListener("click", function() {
    contributeGraph.style.display = "none";
    lineGraph.style.display = "block";
    habitLog.style.display = "none";
});

contributeTab.addEventListener("click", function() {
    contributeGraph.style.display = "block";
    lineGraph.style.display = "none";
    habitLog.style.display = "none";
});

let habitLogEntries = JSON.parse(localStorage.getItem('habitLogEntries')) || [];
let logHabitLineItem = document.querySelector(".line-item")

let motivate = document.querySelector(".motivation");

let logEntry;
let list = document.getElementById("list");
function habitLogData() {
    let li = document.createElement("li");
    let logDate;
    if (inputMode === "eu" && selectedDate == null) {
        logDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getFullYear())}`;
    } else if (inputMode === "us" && selectedDate == null) {
        logDate = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${String(now.getFullYear())}`;
    }
    if (inputMode === "eu" && selectedDate !== null) {
        logDate = `${String(selectedDate.getDate()).padStart(2, '0')}/${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${String(selectedDate.getFullYear())}`;
    } else if (inputMode === "us" && selectedDate !== null) {
        logDate = `${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${String(selectedDate.getDate()).padStart(2, '0')}/${String(selectedDate.getFullYear())}`;
    }

    // let logEntry = {
    //     date: logDate,
    //     reason: reasonInput,
    //     duration: dataInput
    // };

    // habitLogEntries.push(logEntry);
    // localStorage.setItem('habitLogEntries', JSON.stringify(habitLogEntries));
    li.setAttribute('id', document.getElementById("dailies-description").value);
    let newLine = document.createElement("p");
    let removeButton = document.createElement("button");
    removeButton.setAttribute("id", "delete");
    removeButton.setAttribute("class", document.getElementById("dailies-description").value);
    removeButton.textContent = "x";
    newLine.textContent = `${logDate}- ${reasonInput} for ${dataInput} minute(s)`;
    newLine.style.marginTop = "-30px";
    li.append(removeButton, newLine);
    list.appendChild(li);
    removeButton.addEventListener('click', processDeletion);
    if (dataInput < 50) {
        motivate.innerText = "Keep it up! 💪";
    } else if (dataInput > 49 && dataInput < 150) {
        motivate.innerText = "Wow! 👏🎉";
    } else if (dataInput > 149 && dataInput < 300) {
        motivate.innerText = "How awesome can you get!? 🤩";
    } else if (dataInput > 299) {
        motivate.innerText = "You're AMAZING! ️‍🔥💯";
    }
}



function unlog() {
    let latestEntry = list.lastElementChild;
    list.removeChild(latestEntry);
    console.log("removed item");
    // habitLogEntries.pop(logEntry);
    // localStorage.setItem('habitLogEntries', JSON.stringify(habitLogEntries));
    
    // console.log(habitLogEntries)
}


function processDeletion() {
    unlog();
}

// function loadHabitLogEntries() {
//     const savedEntries = JSON.parse(localStorage.getItem('habitLogEntries')) || [];
//     savedEntries.forEach(entry => {
//         logHabitLineItem.innerHTML += `<p>${entry.date}- ${entry.reason} for ${entry.duration} minute(s)`;
//     });
// }

// document.addEventListener('DOMContentLoaded', loadHabitLogEntries);

// stretch goals: habit log saved to localstorage

let calendarButtonClicks = 0;
let calendarEdit = document.querySelector(".calendar-tt-text");

function modifyCalendarDate() {
    calendarButtonClicks++;
    if (calendarButtonClicks === 1) {

        calendarEdit.style.visibility = "visible";
    } else if (calendarButtonClicks > 1) {
        calendarButtonClicks = 0;
        calendarEdit.style.visibility = "hidden";
    }
}

let themeChoice;

document.addEventListener('DOMContentLoaded', function() { 
let colorsMenu = document.getElementById("colorThemes");

colorsMenu.addEventListener('change', function() {
    
    themeChoice = colorsMenu.value;
    colorThemes(themeChoice);
    console.log(themeChoice)
});
});

function colorThemes(colorInput) {
    // remove button color needs to change with theme
    let colorsMenu = document.getElementById("colorThemes");
    let tdCells = document.querySelectorAll("td");
    let logo = document.getElementById("logo").querySelectorAll("path");

    if (colorInput === "light"){
        logo.forEach(logo => {
            if (logo.id !== "brain") {
                logo.setAttribute('fill', "#00286A");
            }
        });
        settingButton.forEach(settingButton => {
            settingButton.style.backgroundColor = "#003F88";
        }
        )
        tdCells.forEach(function(tdCells) {
            tdCells.style.backgroundColor = "#EFEFD0";
            tdCells.style.borderColor = "#003F88";
            });
        revertToDefaultStyles();
    }

    if (colorInput === "dark"){
    document.body.style.backgroundImage = "";
     document.body.style.backgroundColor = "#000315";
     document.body.style.color = "#ffd694";
     lineTab.style.color = "#ffd694";
     lineTab.style.borderColor = "#ffd694";
     contributeTab.style.color = "#ffd694";
     contributeTab.style.borderColor = "#ffd694";
     logTab.style.color = "#ffd694";
     logTab.style.borderColor = "#ffd694";
     tdCells.forEach(function(tdCells) {
     tdCells.style.backgroundColor = "#10102f";
     tdCells.style.borderColor = "#0062ff";
     });
     dataField.style.color = "white";
     reasonField.style.color = "white";
     logo.forEach(logo => {
        if (logo.id !== "brain") {
            logo.setAttribute('fill', "#ffd694");
        }
        settingButton.forEach(settingButton => {
            settingButton.style.backgroundColor = "#0062ff";
        }
        )
    });
    habitLog.style.backgroundColor = "#0062ff14";
    lineGraph.style.backgroundColor = "#0062ff14";
    }
     else if (colorInput === "nyx"){
        document.body.style.backgroundImage = "url('stars.png')";
        document.body.style.backgroundRepeat = "repeat";
        document.body.style.backgroundSize = "100%";
        document.body.style.color = "#EDE0FE";
        lineTab.style.color = "#EDE0FE";
        lineTab.style.borderColor = "#EDE0FE";
        contributeTab.style.color = "#EDE0FE";
        contributeTab.style.borderColor = "#EDE0FE";
        logTab.style.color = "#EDE0FE";
        logTab.style.borderColor = "#EDE0FE";
        tdCells.forEach(function(tdCells) {
        tdCells.style.backgroundColor = "#10102f";
        tdCells.style.borderColor = "#6A5CC2";
        });
        dataField.style.color = "white";
        dataField.style.borderColor = "#EDE0FE";
        reasonField.style.color = "white";
        reasonField.style.borderColor = "#EDE0FE";
        settingButton.forEach(settingButton => {
            settingButton.style.backgroundColor = "#6A5CC2";
        }
        )
        
        logo.forEach(logo => {
           if (logo.id !== "brain") {
               logo.setAttribute('fill', "#EDE0FE");
           }
       });

       habitLog.style.backgroundColor = "#6A5CC273";
       lineGraph.style.backgroundColor = "#6A5CC273";
       
}
colorsMenu.style.color = "#00296B";
updateColors();
}

const styleItems = [
    { element: 'document.body', styles: ['backgroundColor', 'backgroundImage', 'color'] }, 
    { element: 'logTab', styles: ['color', 'borderColor'] },
    { element: 'lineTab', styles: ['color', 'borderColor'] },
    { element: 'contributeTab', styles: ['color', 'borderColor'] },
    { element: 'lineGraph', styles: ['backgroundColor']},
    { element: 'habitLog', styles: ['backgroundColor']},
    { element: 'dataField', styles: ['borderColor', 'color']},
    { element: 'reasonField', styles: ['borderColor', 'color']},
  ];
  
  const defaultStyles = {};
  
  function storeDefaultStyles() {
    styleItems.forEach(item => {
        const element = eval(item.element);
        if (!defaultStyles[item.element]) {
            defaultStyles[item.element] = {};
        }
        item.styles.forEach(style => {
            defaultStyles[item.element][style] = element.style[style];
        });
    });
  }

  storeDefaultStyles();

  function revertToDefaultStyles() {
    for (let element in defaultStyles) {
        const domElement = eval(element);
        for (let style in defaultStyles[element]) {
            domElement.style[style] = defaultStyles[element][style];
        }
    }
  }
  
