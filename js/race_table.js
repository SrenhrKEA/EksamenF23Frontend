const form = document.getElementById('form');
const modalFormTitle = document.getElementById('modalFormTitle');
const modalTitle = document.getElementById('modalTitle');
const selectElement = document.getElementById('inpBoats');
const modalFormCloseBtn = document.querySelector("#modalForm .close");
const scoreboardModalCloseBtn = document.querySelector("#scoreboardModal .close"); /*TODO: sammenfat modalknapperne*/


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
          <button onclick="givePoints('${encodeURIComponent(JSON.stringify(race))}')">Give Points</button>
          <button onclick="showResult(${race.raceId})">Se Resultat</button>
        </td>
      `;

            // Hide signUpOrWithdrawBtn button if raceDate is before currentDate
            const signUpOrWithdrawBtn = row.querySelector('.signUpOrWithdrawBtn');
            if (raceDate < currentDate) {
                signUpOrWithdrawBtn.style.display = 'none';
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

    modalFormTitle.textContent = 'Tilmeld/Afmeld Både'
    form.action = 'http://localhost:8080/race/edit';
    openModalForm(race.classification)
}

/*--GIVE POINTS--*/
function givePoints(obj) {

    modalTitle.textContent = 'Scoreboard'
    /*
        form.action = 'http://localhost:8080/race/edit';
    */
    openModal(obj)
}

/*--SHOW RESULTS--*/
function showResult() {
    /*TODO: MANGLER AT LAVE FÆRDIG*/
}

/* -- MODAL FORM-- */
function openModalForm(obj) {
    populateDropdown(obj)
    // Display the modal
    document.getElementById('modalForm').style.display = 'block';
}

// Modal close button
function closeModalForm() {
    document.getElementById('modalForm').style.display = 'none';
    // Clear the dropdown menu options
    selectElement.innerHTML = '';
}

/* --SCOREBOARD MODAL -- */
function openModal(obj) {
    createScoreboard(obj);
    console.log("OpenModal: " + obj)
    // Display the modal
    document.getElementById('scoreboardModal').style.display = 'block';
}

function closeModal() {
    var modal = document.getElementById("scoreboardModal");
    modal.style.display = "none";
}

// Assign click event listener to the close button
modalFormCloseBtn.addEventListener("click", closeModalForm);
scoreboardModalCloseBtn.addEventListener("click", closeModal);

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

/*-- FORM SUBMIT -- */
form.addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent form submission

    console.log("nu er vi i submit")

    const URL = form.action;
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

    console.log('Form submitted:', form.id);
})

/*--RENDER SCOREBOARD--*/
function createScoreboard(obj) {
    let race = JSON.parse(decodeURIComponent(obj));
    let scoreboard = document.getElementById("scoreboard");

    // Clear existing rows
    while (scoreboard.rows.length > 1) {
        scoreboard.deleteRow(1);
    }

    // Create new rows based on the list of boats
    for (let i = 0; i < race.boats.length; i++) {
        let boat = race.boats[i];

        // Create a new row
        let row = scoreboard.insertRow(i + 1);

        // Add boat name cell
        let nameCell = row.insertCell(0);
        nameCell.innerHTML = boat.name;

        // Add position cell
        let positionCell = row.insertCell(1);
        positionCell.innerHTML = i + 1;

        // Add click event listener to move row one row down
        row.addEventListener("click", function () {
            let currentIndex = this.rowIndex;

            // Swap current row with the row below
            if (currentIndex < scoreboard.rows.length - 1) {
                scoreboard.rows[currentIndex].parentNode.insertBefore(
                    scoreboard.rows[currentIndex + 1],
                    scoreboard.rows[currentIndex]
                );

                // Update position numbers after the row is moved
                updatePositionNumbers();
            }
        });
    }

    // Function to update position numbers in the table
    function updatePositionNumbers() {
        let rows = scoreboard.rows;

        // Update position numbers based on row index
        for (let i = 1; i < rows.length; i++) {
            let positionCell = rows[i].cells[1];
            positionCell.innerHTML = i;
        }
    }
}





