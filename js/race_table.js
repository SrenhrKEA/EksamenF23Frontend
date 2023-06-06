const formContestants = document.getElementById('formContestants');
const modalTitleContestants = document.getElementById('modalTitleContestants');
const modalTitlePositions = document.getElementById('modalTitlePositions');
const selectElement = document.getElementById('inpBoats');
const modalContestantCloseBtn = document.querySelector("#modalContestants .close");
const modalPositionsCloseBtn = document.querySelector("#modalPositions .close");
const modalResultsCloseBtn = document.querySelector("#modalResults .close");
const tablePositions = document.getElementById('tablePositions')
const tableResults = document.getElementById('tableResults');


/* -- GENERATE TABLE -- */
// Get the current date
const currentDate = new Date();
fetch('http://localhost:8080/race/list')
    .then(response => response.json())
    .then(races => {
        let tableBody = document.getElementById('tableBody');
        races.forEach(function (race) {
            // Get the race date
            const raceDate = new Date(race.date);

            let row = document.createElement('tr');

            // Extract boat names from race.boats and format as a string
            const boatNames = race.boats.map(boat => boat.name).join(', ');

            row.innerHTML = `
        <td>${race.raceId}</td>
        <td>${race.classification}</td>
        <td>${race.date}</td>
        <td>${boatNames}</td>
        <td>
          <button class="signUpOrWithdrawBtn" onclick="signUpOrWithdraw('${encodeURIComponent(JSON.stringify(race))}')">Tilmeld/Afmeld Både</button>
          <button class="logPositionBtn" onclick="logPositions('${encodeURIComponent(JSON.stringify(race))}')">Indtast Placeringer</button>
          <button onclick="showResult(${race.raceId})">Se Resultat</button>
        </td>
      `;

            // Hide signUpOrWithdrawBtn button if raceDate is before currentDate
            const signUpOrWithdrawBtn = row.querySelector('.signUpOrWithdrawBtn');
            const logPositionBtn = row.querySelector('.logPositionBtn');
            if (raceDate < currentDate) {
                signUpOrWithdrawBtn.style.display = 'none';
                logPositionBtn.style.display = 'none';
            }

            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error fetching races:', error);
    });


/*-- SIGNUP/WITHDRAW BUTTON -- */
function signUpOrWithdraw(obj) {
    console.log(JSON.parse(decodeURIComponent(obj)))

    let race = JSON.parse(decodeURIComponent(obj))

    document.getElementById('inpId').value = race.raceId
    document.getElementById("inpBoats").value = race.boats

    modalTitleContestants.textContent = 'Tilmeld/Afmeld Både'
    formContestants.action = 'http://localhost:8080/race/edit';
    openModalContestants(race.classification)
}

/*--LOG POSITIONS--*/
function logPositions(obj) {
    modalTitlePositions.textContent = 'Placeringer'
    openModalPositions(obj)
}

/*--SHOW RESULTS--*/
function showResult(obj) {
    modalTitlePositions.textContent = 'Resultater'
    openModalResults(obj)
}

/* -- CONTESTANTS MODAL-- */
function openModalContestants(obj) {
    populateDropdown(obj)
    // Display the modal
    document.getElementById('modalContestants').style.display = 'block';
}

// Modal close button
function closeModalContestants() {
    document.getElementById('modalContestants').style.display = 'none';
    // Clear the dropdown menu options
    selectElement.innerHTML = '';
}

/* --POSITIONS MODAL -- */
function openModalPositions(obj) {
    renderPositionsTable(obj);
    console.log("OpenModal: " + obj)
    // Display the modal
    document.getElementById('modalPositions').style.display = 'block';
}

// Modal close button
function closeModalPositions() {
    let modal = document.getElementById("modalPositions");
    modal.style.display = "none";
}

/* -- RESULTS MODAL-- */
function openModalResults(obj) {
    fetchResults(obj)
    // Display the modal
    document.getElementById('modalResults').style.display = 'block';
}

// Modal close button
function closeModalResults() {
    document.getElementById('modalResults').style.display = 'none';
    // Clear the dropdown menu options
    selectElement.innerHTML = '';
}

// Assign click event listener to the close button
modalContestantCloseBtn.addEventListener("click", closeModalContestants);
modalPositionsCloseBtn.addEventListener("click", closeModalPositions);
modalResultsCloseBtn.addEventListener("click", closeModalResults);


/*--POPULATE DROPDOWN MENU --*/
function populateDropdown(obj) {
    fetch('http://localhost:8080/boat/list/' + obj)
        .then(response => response.json())
        .then(data => {
            data.forEach(boat => {
                const option = document.createElement('option');
                option.value = JSON.stringify(boat);
                option.textContent = boat.name;
                selectElement.appendChild(option);
                console.log("boatID:" + boat.boatId)
            });
        })
        .catch(error => console.error(error));
}

/*-- CONTESTANT FORM SUBMIT -- */
formContestants.addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent form submission

    console.log("nu er vi i submit")

    const URL = formContestants.action;
    const id = document.getElementById('inpId').value
    const selectElement = document.getElementById('inpBoats')
    const selectedOptions = Array.from(selectElement.selectedOptions);
    const selectedValues = selectedOptions.map(option => option.value);

    const boats = selectedValues.map(str => JSON.parse(str));

    console.log(boats)

    const data = {
        raceId: id,
        boats: boats
    };

    console.log(data)

    const options = {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        mode: 'cors',
        body: JSON.stringify(data)
    };
    await fetch(URL, options)
        .then((res) => {
            console.log(res)
            window.location.href = 'race_table.html'
            window.location.reload();
        })
        .catch(console.error);

    console.log('Form submitted:', formContestants.id);
})

/*--RENDER POSITIONS TABLE--*/
function renderPositionsTable(obj) {
    let race = JSON.parse(decodeURIComponent(obj));

    // Clear existing rows
    while (tablePositions.rows.length > 1) {
        tablePositions.deleteRow(1);
    }

    // Create new rows based on the list of boats
    for (let i = 0; i < race.boats.length; i++) {
        let boat = race.boats[i];

        // Create a new row
        let row = tablePositions.insertRow(i + 1);

        // Add boat id cell
        let boatIdCell = row.insertCell(0);
        boatIdCell.innerHTML = boat.boatId;

        // Add boat name cell
        let nameCell = row.insertCell(1);
        nameCell.innerHTML = boat.name;

        // Add position cell
        let positionCell = row.insertCell(2);
        positionCell.innerHTML = i + 1;

        let buttonsCell = row.insertCell(3);
        buttonsCell.innerHTML = `
                                    <p>Ikke startet</p>
                                    <input type="checkbox" name="notStarted" />
                                    <br>
                                    <p>For tidligt startet</p>
                                    <input type="checkbox" name="falseStart"/>
                                    <br>
                                    <p>Ikke fuldført</p>
                                    <input type="checkbox" name="notFinished"/>
                                `;
        let raceIdCell = row.insertCell(4);
        raceIdCell.innerHTML = race.raceId;


        // Add click event listener to move row one row down
        row.addEventListener("click", function (event) {
            let clickedCell = event.target.parentElement;
            let columnIndex = clickedCell.cellIndex;

            // Exclude column 4 (index 3) from the event listener
            if (columnIndex !== 3) {
                let currentIndex = this.rowIndex;

                // Swap current row with the row below
                if (currentIndex < tablePositions.rows.length - 1) {
                    tablePositions.rows[currentIndex].parentNode.insertBefore(
                        tablePositions.rows[currentIndex + 1],
                        tablePositions.rows[currentIndex]
                    );

                    // Update position numbers after the row is moved
                    updatePositionNumbers();
                }
            }
        })
    }


    // Function to update position numbers in the table
    function updatePositionNumbers() {
        let rows = tablePositions.rows;

        // Update position numbers based on row index
        for (let i = 1; i < rows.length; i++) {
            let positionCell = rows[i].cells[2];
            positionCell.innerHTML = i;
        }
    }
}

/*-- POSITION TABLE SUBMIT (Converts table data to JSON and submits)--*/
async function postPositions() {

    let URL = 'http://localhost:8080/score/save';
    let payload = JSON.stringify(saveTableData());

    fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: payload
    })
        .then(function (response) {
            if (response.ok) {
                console.log('Data successfully posted.');
                window.location.href = 'race_table.html'
                window.location.reload();
            } else {
                console.error('Error posting data:', response.status, response.statusText);
            }
        })
        .catch(function (error) {
            console.error('Error posting data:', error);
        });

    function saveTableData() {
        let data = [];
        let rows = tablePositions.rows;

        for (let i = 0; i < rows.length; i++) {
            if (i === 0) {
                continue;
            }

            let cols = rows[i].getElementsByTagName('td');
            let rowData = {};

            for (let j = 0; j < cols.length; j++) {
                if (j === 3) {
                    let checkboxes = cols[j].getElementsByTagName('input');
                    let checkboxData = {};
                    for (let k = 0; k < checkboxes.length; k++) {
                        let checkbox = checkboxes[k];
                        checkboxData[checkbox.name] = checkbox.checked;
                    }
                    rowData = {...rowData, ...checkboxData};
                } else {
                    let key;
                    switch (j) {
                        case 0:
                            key = 'boatId';
                            break;
                        case 1:
                            key = 'name';
                            break;
                        case 2:
                            key = 'position';
                            break;
                        case 4:
                            key = 'raceId';
                            break;
                        default:
                            key = '';
                            break;
                    }
                    if (key) {
                        rowData[key] = cols[j].innerText.trim();
                    }
                }
            }

            data.push(rowData);
        }

        console.log(data);
        return data;
    }
}

/*--FETCH RESULTS -- */
async function fetchResults(obj) {

    // Clear existing rows
    while (tableResults.rows.length > 1) {
        tableResults.deleteRow(1);
    }

    let URL = 'http://localhost:8080/score/list/race/' + obj;

    fetch(URL, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(scores => {
            scores.forEach(function (score) {

                let row = document.createElement('tr');

                row.innerHTML = `
        <td>${score.boat.name}</td>
        <td>${score.position}</td>
        <td>${score.points}</td>
      `;
                tableResults.appendChild(row);
            })
        })
        .catch(function (error) {
            console.error('Error retrieving data:', error);
        });
}






