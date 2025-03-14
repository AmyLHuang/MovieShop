// Function to get query parameters by name
export function getParameterByName(target) {
    let url = window.location.href;
    target = target.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + target + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Function to handle cart array and display it
function handleCartArray(resultArray) {
    let item_list = $("#item_list");
    let res = "<ul>";
    for (let i = 0; i < resultArray.length; i++)
        res += "<li>" + resultArray[i] + "</li>";
    res += "</ul>";
    item_list.html("");
    item_list.append(res);
}

// Submit handler for the 'add-to-cart' button
export function initAddToCartSubmit() {
    $(document).on('submit', '.add-to-cart-button form', function(event) {
        event.preventDefault(); // Prevent the form from submitting the default way

        const formData = $(this).serialize(); // Serialize form data
        const params = new URLSearchParams(formData);
        const mTitle = params.get('movieTitle'); // Get movie title from form

        // AJAX call to submit data
        jQuery.ajax({
            method: 'POST',
            url: 'api/cart', // Assuming 'api/cart' is your server endpoint
            data: formData,
            success: resultDataString => {
                let resultDataJson = JSON.parse(resultDataString);
                handleCartArray(resultDataJson["previousItems"]); // Update cart array
                window.alert("Successfully added " + mTitle); // Show success message
            }
        });
    });
}