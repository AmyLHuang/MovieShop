let payment_form = $("#payment_form");

/**
 * Handle the data returned by Payment Servlet
 * @param resultData jsonObject
 */
function handleResult(resultData) {
    if (resultData["status"] === "success") {
        window.location.replace("confirmation.html");
    } else {
        jQuery("#payment_error_msg").text(resultData["message"]);
    }
}

function handleResult2(resultData) {
    jQuery("#totalPrice").text("Total Price: $" + resultData["totalPrice"]);
}

/**
 * Submit the form content with POST method
 * @param formSubmitEvent
 */
function submitPaymentForm(formSubmitEvent) {
    formSubmitEvent.preventDefault();
    jQuery.ajax({
        url: "api/payment",
        method: "POST",
        data: payment_form.serialize(),
        success: (resultData) => handleResult(resultData),
    });
}

jQuery.ajax({
    url: "api/payment",
    method: "GET",
    data: payment_form.serialize(),
    success: (resultData) => handleResult2(resultData),
});

payment_form.submit(submitPaymentForm);