import { getParameterByName, initAddToCartSubmit } from "./utils.js";

function handleResult(resultData) {
    let html = "";

    let titleElement = $(".title");
    titleElement.append(resultData["movieTitle"]);

    let infoElement = $("#movie-info");
    html += "<p>" + resultData["movieYear"] + " ⋅ " + resultData["movieDirector"] + "</p>";
    html += "<p>Rating: " + resultData["movieRating"] + "</p>";
    infoElement.append(html);

    let addToCartBtn = $("#addToCartBtn");
    html = '';
    html += '       <div class="add-to-cart-button" data-movie-id="' + resultData["movieId"] + '">';
    html += '           <form method="post">';
    html += '               <input name="action" type="hidden" id="add-cart" value="add">';
    html += '               <input name="movieId" type="hidden" value="' + resultData["movieId"] + '">';
    html += '               <input name="movieTitle" type="hidden" value="' + resultData["movieTitle"] + '">';
    html += '               <input type="submit" value="Add to Cart">';
    html += '           </form>';
    html += '       </div>';
    addToCartBtn.append(html);

    html = ""
    let genresTableElement = $("#genresTable");
    let genresArray = resultData["movieGenres"].split(",");
    for (let i = 0; i < genresArray.length; i++) {
        html += '<tr><td><a href="movies-list.html?action=browseGenre&value=' + genresArray[i] + '">' + genresArray[i] + '</a></td></tr>';
    }
    genresTableElement.append(html);

    html = "";
    let starsTableElement = $("#starsTable");
    let starsArray = resultData["movieStars"].split(",");
    for (let i = 0; i < starsArray.length; i += 2) {
        html += "<tr><td><a href='star.html?id=" + starsArray[i] + "'>" + starsArray[i+1] + "</a></td></tr>";
    }
    starsTableElement.append(html);
}

$.ajax({
    dataType: "json",
    method: "GET",
    url: "api/movie",
    data: {
        id: getParameterByName('id'),
    },
    success: (resultData) => handleResult(resultData),
});

// Enable Adding to Cart Feature
$(document).ready(function() {
    initAddToCartSubmit();
});