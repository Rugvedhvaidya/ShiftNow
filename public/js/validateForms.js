//Javascript file for validating forms in the web application.

(function () {
    'use strict'

    bsCustomFileInput.init()

    const forms = document.querySelectorAll('.validated-form')

    Array.from(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
})()