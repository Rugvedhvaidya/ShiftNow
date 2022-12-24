//Javascript file for validating password while signing up and resetting password.

function validator() {
    let p = document.getElementById("password").value;
    let cp = document.getElementById("confirm").value;
    if (p.length < 8 || !p.match(/[a-z]/g) || !p.match(/[A-Z]/g) || !p.match(/[0-9]/g) || !p.match(/[^a-zA-Z\d]/g)) {
        document.getElementById('message').innerHTML = "**password must contain minimum of 8 characters including One lowercase, One upppercase,One digit and One special character";
        return false;
    }
    if (p != cp) {
        document.getElementById('message').innerHTML = "**passwords do not match";
        return false;
    }
}