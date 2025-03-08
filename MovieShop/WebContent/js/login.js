/**
 * Handle the data returned by LoginServlet
 * @param resultDataJson jsonObject
 */
function handleResult(resultDataJson) {
    if (resultDataJson["status"] === "success") {
        window.location.replace("index.html");
    } else {
        $("#login_error_msg").text(resultDataJson["message"]);
    }
}

/** Executes when Login Btn is Clicked */
function submitLoginForm(formSubmitEvent) {
    formSubmitEvent.preventDefault();
    jQuery.ajax({
        url: "api/login",
        method: "POST",
        data: {
            action: "login",
            username: $('#login_form input[name="username"]').val(),
            password: $('#login_form input[name="password"]').val()
        },
        success: (resultData) => handleResult(resultData),
    });
}

/** Executes when Signup Btn is Clicked */
function submitSignupForm(formSubmitEvent) {
    formSubmitEvent.preventDefault();
    jQuery.ajax({
        url: "api/login",
        method: "POST",
        data: {
            action: "signup",

        },
        success: (resultData) => handleResult(resultData),
    });
}

/** Executes when Eye Icon for Password Input is Clicked */
function togglePasswordVisibility(eyeIcon, passwordInput) {
    eyeIcon.addEventListener('click', function() {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeIcon.classList.add("active");
        } else {
            passwordInput.type = "password";
            eyeIcon.classList.remove("active");
        }
    });
}

// Login Btn Clicked
$("#login_form").submit(submitLoginForm);

// Signup Btn Clicked
// $("#signup_form").submit(submitSignupForm);

// Toggle Password Visibility
let eyeIconLogin = document.getElementById("toggle-login-password");
let password = document.getElementById("password");
togglePasswordVisibility(eyeIconLogin, password);
let eyeIconSignup = document.getElementById("toggle-signup-password");
let newPassword = document.getElementById("new-password");
togglePasswordVisibility(eyeIconSignup, newPassword);