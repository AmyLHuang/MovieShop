function getParameterByName(target) {
    // Get request URL
    let url = window.location.href;
    // Encode target parameter name to url encoding
    target = target.replace(/[\[\]]/g, "\\$&");

    // Ues regular expression to find matched parameter value
    let regex = new RegExp("[?&]" + target + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';

    // Return the decoded parameter value
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function handleResult(resultData) {
    let html = "";

    let titleElement = jQuery(".title");
    titleElement.append(resultData["movieTitle"]);

    let infoElement = jQuery("#info");
    html += "<p>" + resultData["movieYear"] + " ⋅ " + resultData["movieDirector"] + "</p>";
    html += "<p>Rating: " + resultData["movieRating"] + "</p>";
    infoElement.append(html);

    let addToCartBtn = jQuery("#addToCartBtn");
    html = '';
    html += '       <div class="add-to-cart-button" data-movie-id="' + resultData["movieId"] + '">';
    html += '           <form method="post">';
    html += '               <input name="action" type="hidden" id="add-cart" value="add">';
    html += '               <input name="movieId" type="hidden" value="' + resultData["movieId"] + '">';
    html += '               <input name="movieTitle" type="hidden" value="' + resultData["movieTitle"] + '">';
    html += '               <input type="submit" class="add-to-cart-button-inner" value="Add to Cart">';
    html += '           </form>';
    html += '       </div>';
    addToCartBtn.append(html);

    html = ""
    let genresTableElement = jQuery("#genresTable");
    let genresArray = resultData["movieGenres"].split(",");
    for (let i = 0; i < genresArray.length; i++) {
        html += '<tr><td><a href="movies-list.html?action=browseGenre&value=' + genresArray[i] + '">' + genresArray[i] + '</a></td></tr>';
    }
    genresTableElement.append(html);

    html = "";
    let starsTableElement = jQuery("#starsTable");
    let starsArray = resultData["movieStars"].split(",");
    for (let i = 0; i < starsArray.length; i += 2) {
        html += "<tr><td><a href='star.html?id=" + starsArray[i] + "'>" + starsArray[i+1] + "</a></td></tr>";
    }
    starsTableElement.append(html);
}

function handleCartArray(resultArray) {
    let item_list = $("#item_list");
    let res = "<ul>";
    for (let i = 0; i < resultArray.length; i++) {
        res += "<li>" + resultArray[i] + "</li>";
    }
    res += "</ul>";

    // clear the old array and show the new array in the frontend
    item_list.html("");
    item_list.append(res);
}

$(document).on('submit', '.add-to-cart-button form', function(event) {
    event.preventDefault();
    const formData = $(this).serialize();
    const params = new URLSearchParams(formData);
    const mTitle = params.get('movieTitle');
    jQuery.ajax({
        method: 'POST',
        url: 'api/cart',
        data: formData,
        success: resultDataString => {
            let resultDataJson = JSON.parse(resultDataString);
            handleCartArray(resultDataJson["previousItems"]);
            window.alert("Successfully added " + mTitle);
        }
    });
});

jQuery.ajax({
    dataType: "json",
    method: "GET",
    url: "api/movie",
    data: {
        id: getParameterByName('id'),
    },
    success: (resultData) => handleResult(resultData),
});
