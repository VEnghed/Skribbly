let nameField = document.getElementById("name");
let roomField = document.getElementById("room");
let welcomeForm = document.getElementById("welcomeform");
let welcomeSubmit = document.getElementById("welcomesubmit");
welcomeSubmit.disabled = true;

welcomeForm.addEventListener('input', checkValidInputs);

function checkValidInputs() {
    if (nameField.value.length > 0 && roomField.value.length > 0)
        welcomeSubmit.disabled = false;
    else
        welcomeSubmit.disabled = true;
}