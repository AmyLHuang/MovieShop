/**
 * Handle the items in cart list
 * @param resultItems jsonObject, movie IDs
 * @param resultTitles jsonObject, movie Titles
 * @param resultCounts jsonObject, quantity of movie in cart
 */
function handleResult(resultItems, resultTitles, resultCounts) {
    $("#cart-table-body tr").remove();
    let cartTableBodyElement = $("#cart-table-body");
    let overallTotalPrice = 0;
    for (let i = 0; i < resultItems.length; i++) {
        let html = "";
        html += '<tr>';
        html += '    <td><a href="movie.html?id=' + resultItems[i] + '">' + resultTitles[i] + '</a></td>';
        html += '    <td>'
        html += '        <button class="quantity-btn decrease-quantity">&minus;</button>';
        html += '        <span class="quantity-display" data-movie-id=' + resultItems[i] + '>' + resultCounts[i] + '</span>';
        html += '        <button class="quantity-btn increase-quantity">&plus;</button>';
        html += '    </td>';
        html += '    <td>$'  + (20 * resultCounts[i]) + '</td>';
        html += '    <td><button class="delete-btn" value=' + resultItems[i] + '>&times;</button></td>';
        html += '</tr>';
        overallTotalPrice += 20 * resultCounts[i];
        cartTableBodyElement.append(html);
    }

    if (overallTotalPrice > 0) {
        let overallTotalRow = '<tr><td colspan="5" id="overall-total">Total Price: $' + overallTotalPrice + '</td></tr>';
        cartTableBodyElement.append(overallTotalRow);
        $(".checkout-btn").disabled = false;
    }
    else {
        console.log("empty???");
        let overallTotalRow = "<tr><td colspan='5' id='overall-total'>Cart is Empty.</td></tr>";
        cartTableBodyElement.append(overallTotalRow);
        $(".checkout-btn").disabled = true;
    }
}

$.ajax({
    dataType: "json",
    method: "GET",
    url: "api/cart?",
    data: {},
    success: (resultData) => {
        handleResult(resultData["previousItems"], resultData["previousTitles"], resultData["previousCounts"]);
    }
});

$(document).on('click', '.quantity-btn', function () {
    const quantityDisplay = $(this).siblings('.quantity-display');
    const movieId = quantityDisplay.data('movie-id');
    let currentAmount = parseInt(quantityDisplay.text(), 10);

    if ($(this).hasClass('decrease-quantity')) {
        if (currentAmount > 1) {
            currentAmount--;
        } else if (currentAmount === 1) {
            $(".decrease-quantity").disabled = true;
        }
    } else if ($(this).hasClass('increase-quantity')) {
        if (currentAmount === 1) {
            $(".decrease-quantity").disabled = false;
        }
        currentAmount++;
    }
    $.ajax({
        method: 'GET',
        url: 'api/cart',
        data: {
            amount: currentAmount,
            movieId : movieId,
            action: "modifyAmount"
        },
        success: (resultDatas) => {
            let resultData = JSON.parse(resultDatas);
            handleResult(resultData["previousItems"], resultData["previousTitles"], resultData["previousCounts"]);
        }
    });
});

$(document).on('click', '.delete-btn', function () {
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
            handleResult(resultData["previousItems"], resultData["previousTitles"], resultData["previousCounts"]);
        }
    });
});

$(document).on('click', '.checkout-btn', function () {
    console.log("Success: proceeding to checkout");
    window.location.replace("payment.html");
});

