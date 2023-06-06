let form = document.getElementById('form');
let addButton = document.getElementById('registerButton');
let modalTitle = document.getElementById('modalFormTitle');

/* -- GENERATE TABLE -- */
fetch('http://localhost:8080/boat/list')
    .then(response => response.json())
    .then(boats => {
        let tableBody = document.getElementById('tableBody');
        boats.forEach(function (boat) {
            let row = document.createElement('tr');
            row.innerHTML = `
        <td>${boat.boatId}</td>
        <td>${boat.name}</td>
        <td>${boat.length}</td>
        <td>${boat.classification}</td>
        <td>
          <button onclick="editBoat('${encodeURIComponent(JSON.stringify(boat))}')">Opdater</button>
          <button onclick="deleteBoat(${boat.boatId})">Slet</button>
        </td>
      `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error fetching boats:', error);
    });

/*-- REGISTER BUTTON -- */
addButton.addEventListener('click', function () { /*TODO: tilføjet nulstilling af values */
    document.getElementById('inpId').value = null
    document.getElementById("inpName").value = null
    document.getElementById("inpLength").value = null
    modalTitle.textContent = 'Registrer Båd'
    form.action = 'http://localhost:8080/boat/register';
    openModalForm()
});

/*-- EDIT BUTTON -- */
function editBoat(obj) {
    console.log(JSON.parse(decodeURIComponent(obj)))

    let boat = JSON.parse(decodeURIComponent(obj))

    document.getElementById('inpId').value = boat.boatId
    document.getElementById("inpName").value = boat.name
    document.getElementById("inpLength").value = boat.length
    modalTitle.textContent = 'Opdater'
    form.action = 'http://localhost:8080/boat/edit';
    openModalForm()
}

/*-- DELETE BUTTON -- */
function deleteBoat(id) {
    form.action = 'http://localhost:8080/boat/delete';
    document.getElementById('inpId').value = id
    // Create a new submit event
    let submitEvent = new Event('submit');

    // Dispatch the submit event on the form
    form.dispatchEvent(submitEvent);
}

/* -- MODAL -- */
function openModalForm() {
    // Display the modal
    document.getElementById('modalForm').style.display = 'block';
}

// Modal close button
const closeBtn = document.getElementsByClassName('close')[0];
closeBtn.onclick = function () {
    document.getElementById('modalForm').style.display = 'none';
};

/*-- FORM SUBMIT -- */
form.addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent form submission

    console.log("nu er vi i submit")

    const URL = form.action;
    let id = document.getElementById('inpId').value
    let name = document.getElementById("inpName").value;
    let length = document.getElementById("inpLength").value;

    const data = {
        boatId: id,
        name: name,
        length: length,
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
            window.location.href = 'boat_table.html'
            window.location.reload();
        })
        .catch(console.error);

    console.log('Form submitted:', form.id);
})


