//Javascript file for functionality of filtering houses using appropriate filters.

function outputUpdate(vol) {
    document.querySelector('#volume').value = vol + "K";
}

function changeButton(id_of_button) {
    if (!(document.getElementById(id_of_button).style.backgroundColor === "green")) {
        document.getElementById(id_of_button).style.backgroundColor = "green";
    }
    else {
        document.getElementById(id_of_button).style.backgroundColor = "rgb(42, 44, 43)";
    }
}