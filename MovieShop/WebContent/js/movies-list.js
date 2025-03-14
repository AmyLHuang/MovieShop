import { getParameterByName, initAddToCartSubmit } from "./utils.js";

function handleResult(resultData) {
    let metadata = resultData[resultData.length-1];
    console.log("metadata: " + JSON.stringify(metadata));

    $("#pageTitle").append(metadata["value"]);
    // document.querySelector('input[name="title"][value="desc"]').checked = true;

    //  Insert Movie Cards based on the result data
    $(".movies-container").append(parseDataIntoHtml(resultData));

    // If no results, then display a message
    if (resultData.length === 1) {
        let msg = resultData[0]['offset'] === 0 ? "No Results" : "No More Results!";
        $("#empty").text(msg);
    } else {
        $("#empty").text("");
    }

    // Change Page Features
    document.getElementById('prev-page-btn').disabled = metadata["offset"] === 0;
    document.getElementById('next-page-btn').disabled = metadata["limit"] > metadata["numResults"];
    $("#page-num").text(Math.floor(metadata["offset"] / metadata["limit"]) + 1);
}

function parseDataIntoHtml(resultData) {
    let html = "";
    for (let i = 0; i < resultData.length-1; i++) {
        html += '<div class="movie">';
        html += '   <div class="movie-header">';
        html += '       <h2 class="movie-title"><a href="movie.html?id=' + resultData[i]["movieId"] + '">' + resultData[i]["movieTitle"] + '</a></h2>';
        html += '   </div>';
        html += '   <div class="movie-content">';
        html += '       <div class="movie-info">';
        html += '           <span>Year:</span> ' + resultData[i]["movieYear"] + '<br/>';
        html += '           <span>Director:</span> ' + resultData[i]["movieDirector"] + '<br/>';
        html += '           <span>Genres:</span>';
        let genresArray = resultData[i]["movieGenres"].split(",");
        for (let j = 0; j < genresArray.length; j += 2) {
            html += '       <span class="genres"><a href="movies-list.html?action=browseGenre&value=' + genresArray[j + 1] + '">' + genresArray[j + 1] + '</a></span>';
        }
        html += '           <br/><span>Stars:</span>';
        let starsArray = resultData[i]["movieStars"].split(",");
        for (let j = 0; j < starsArray.length; j += 2) {
            html += '       <span class="stars"><a href="star.html?id=' + starsArray[j] + '">' + starsArray[j + 1] + '</a></span>';
        }
        html += '           <br/><span class="rating">Rating:</span> ' + resultData[i]["movieRating"];
        html += '       </div>';
        html += '       <div class="add-to-cart-button" data-movie-id="' + resultData[i]["movieId"] + '">';
        html += '           <form method="post">';
        html += '               <input name="action" type="hidden" id="add-cart" value="add">';
        html += '               <input name="movieId" type="hidden" value="' + resultData[i]["movieId"] + '">';
        html += '               <input name="movieTitle" type="hidden" value="' + resultData[i]["movieTitle"] + '">';
        html += '               <button id="add-btn" type="submit">Add to Cart</button>';
        html += '           </form>';
        html += '       </div>';
        html += '   </div>';
        html += '</div>';
    }
    return html;
}

function changePageForm(button) {
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = 'movies-list.html';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'action';
    input.value = button.getAttribute('data-action');
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

// Enable Adding to Cart Feature
$(document).ready(function() {
    initAddToCartSubmit();
});

// Filter/Sort Feature
const isChecked = document.getElementById('order').checked;
document.getElementById('sortForm').addEventListener('submit', function(event) {
    const isOrderReversedInput = document.getElementById('isOrderReversed');
    isOrderReversedInput.value = isChecked ? 'false' : 'true';
});

// Change Page Feature
$('#prev-page-btn').click(function() {
    changePageForm(this);
});

$('#next-page-btn').click(function() {
    changePageForm(this);
});

// Call the appropriate Java Servlet
let action = getParameterByName('action');
if (action === "browseGenre" || action === "browseTitle" || action === "search") {
    jQuery.ajax({
        dataType: "json",
        method: "GET",
        url: "api/movies-list",
        data: {
            action: getParameterByName('action'),
            value: getParameterByName('value'),
            limit: getParameterByName('limit'),
            isOrderReversed: getParameterByName('isOrderReversed'),
            titleOrder: getParameterByName('title'),
            ratingOrder: getParameterByName('rating'),
        },
        success: (resultData) => handleResult(resultData)
    });
} else {
    jQuery.ajax({
        dataType: "json",
        method: "GET",
        url: "api/movies-list",
        data: {
            action: getParameterByName('action'),
            title: getParameterByName('title'),
            year: getParameterByName('year'),
            director: getParameterByName('director'),
            star: getParameterByName('star'),
            limit: getParameterByName('limit'),
            isOrderReversed: document.getElementById('order').checked,
            titleOrder: getParameterByName('title'),
            ratingOrder: getParameterByName('rating'),
        },
        success: (resultData) => handleResult(resultData)
    });
}
