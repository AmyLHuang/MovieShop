/**
 * Handle the data returned by LoginServlet
 * @param resultDataJson jsonObject
 */
function handleResult(resultDataJson) {
    if (resultDataJson["status"] === "success") {
        window.location.replace("index.html");
    } else {
        $("#login-error-msg").text("ERROR: " + resultDataJson["message"]);
    }
}

/**
 * Handles the servlet call when the login button is clicked
 */
function submitLoginForm(formSubmitEvent) {
    formSubmitEvent.preventDefault();
    $.ajax({
        url: "api/login",
        method: "POST",
        data: loginForm.serialize(),
        success: (resultData) => handleResult(resultData),
    });
}

/**
 * Handles the servlet call when the signup button is clicked
 */
function submitSignupForm(formSubmitEvent) {
    formSubmitEvent.preventDefault();
    $.ajax({
        url: "api/signup",
        method: "POST",
        data: signupForm.serialize(),
        success: (resultData) => handleResult(resultData),
    });
}

/**
 * Handle the event in which the user toggles the eye icon on the password input field
 * @param eyeIcon HTMLElement
 * @param passwordInput HTMLElement
 */
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
let loginForm = $("#login-form");
loginForm.submit(submitLoginForm);

// Signup Btn Clicked
let signupForm = $("#signup-form");
signupForm.submit(submitSignupForm);

// EyeIcon for Login Clicked
let eyeIconLogin = document.getElementById("toggle-login-password");
let password = document.getElementById("password");
togglePasswordVisibility(eyeIconLogin, password);

// EyeIcon for Signup Clicked
let eyeIconSignup = document.getElementById("toggle-signup-password");
let newPassword = document.getElementById("new-password");
togglePasswordVisibility(eyeIconSignup, newPassword);