/**
 * Handle the items in cart list
 * @param resultData jsonObject
 */
function handleCartArray(resultData) {
    $("#cart_table_body tr").remove();
    let cartTableBodyElement = $("#cart_table_body");
    let overallTotalPrice = 0;
    for (let i = 0; i < resultData["previousItems"].length; i++) {
        let html = "";
        html += '<tr>';
        html += '    <td><a href="movie.html?id=' + resultData["previousItems"][i] + '">' + resultData["previousTitles"][i] + '</a></td>';
        html += '    <td>'
        html += '        <button class="quantity-button decrease-quantity">-</button>';
        html += '        <span style="margin: auto 5px;" class="quantity-display" data-movie-id=' + resultData["previousItems"][i] + '>' + resultData["previousCounts"][i] + '</span>';
        html += '        <button class="quantity-button increase-quantity">+</button>';
        html += '    </td>';
        html += '    <td><button class="delete-button" value=' + resultData["previousItems"][i] + '>Delete</button></td>';
        html += '    <td>$42</td>';
        html += '    <td>$'  + (42 * resultData["previousCounts"][i]) + '</td>';
        html += '</tr>';
        overallTotalPrice += 42 * resultData["previousCounts"][i];
        cartTableBodyElement.append(html);
    }

    let checkoutBtnElement = jQuery("#checkout_btn");
    if (overallTotalPrice > 0) {
        let overallTotalRow = '<tr><td colspan="5" style="text-align: right;" id="overall-total">Total Price: $' + overallTotalPrice + '</td></tr>';
        cartTableBodyElement.append(overallTotalRow);
        checkoutBtnElement.html("<button class='checkout-button'>Proceed to Payment</button>");
    }
    else {
        let overallTotalRow = "<tr><td colspan='5'>Cart is Empty.</td></tr>";
        cartTableBodyElement.append(overallTotalRow);
        checkoutBtnElement.html("<button disabled class='checkout-button'>Proceed to Payment</button>");
    }
}

jQuery.ajax({
    dataType: "json",
    method: "GET",
    url: "api/cart?",
    data: {},
    success: (resultData) => {handleCartArray(resultData);}
});

$(document).on('click', '.quantity-button', function () {
    const quantityDisplay = $(this).siblings('.quantity-display');
    const movieId = quantityDisplay.data('movie-id');
    let currentAmount = parseInt(quantityDisplay.text(), 10);

    if ($(this).hasClass('decrease-quantity')) {
        if (currentAmount > 1) {
            currentAmount--;
        }
    } else if ($(this).hasClass('increase-quantity')) {
        currentAmount++;
    }
    jQuery.ajax({
        method: 'GET',
        url: 'api/cart',
        data: {
            amount: currentAmount,
            movieId : movieId,
            action: "modifyAmount"
        },
        success: (resultDatas) => {
            let resultData = JSON.parse(resultDatas);
            handleCartArray(resultData["previousItems"], resultData["previousTitles"], resultData["previousCounts"]);
        }
    });
});

$(document).on('click', '.delete-button', function () {
    const movieId = $(this).val();
    $.ajax({
        method: 'GET',
        url: 'api/cart',
        data: {
            movieId : movieId,
            action: "deleteMovie"
        },
        success: (resultDatas) => {
            let resultData = JSON.parse(resultDatas);
            handleCartArray(resultData["previousItems"], resultData["previousTitles"], resultData["previousCounts"]);
        }
    });
});

$(document).on('click', '.checkout-button', function () {
    console.log("Success: proceeding to checkout");
    window.location.replace("payment.html");
});

