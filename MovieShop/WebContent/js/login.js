let login_form = $("#login_form");

/**
 * Handle the data returned by LoginServlet
 * @param resultDataJson jsonObject
 */
function handleResult(resultDataJson) {
    console.log("@Login.js Response received: " + resultDataJson);

    if (resultDataJson["status"] === "success") {
        window.location.replace("index.html");
    } else {
        console.log("login error: " + resultDataJson["message"]);
        $("#login_error_msg").text(resultDataJson["message"]);
    }
}

function submitLoginForm(formSubmitEvent) {
    formSubmitEvent.preventDefault();
    jQuery.ajax({
        url: "api/login",
        method: "POST",
        data: login_form.serialize(),
        success: (resultData) => handleResult(resultData),
    });
}

login_form.submit(submitLoginForm);