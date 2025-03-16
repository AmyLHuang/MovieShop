let paymentForm = $(".payment-form");

function handlePostResult(resultData) {
    if (resultData["status"] === "success") {
        window.location.replace("confirmation.html");
    } else {
        $(".error-msg").text(resultData["message"]);
    }
}

function handleGetResult(resultData) {
    $("#totalPrice").text("Total Price: $" + resultData["totalPrice"]);
}

function submitPaymentForm(formSubmitEvent) {
    formSubmitEvent.preventDefault();
    $.ajax({
        url: "api/payment",
        method: "POST",
        data: paymentForm.serialize(),
        success: (resultData) => handlePostResult(resultData),
    });
}

$.ajax({
    url: "api/payment",
    method: "GET",
    data: paymentForm.serialize(),
    success: (resultData) => handleGetResult(resultData),
});

paymentForm.submit(submitPaymentForm);
