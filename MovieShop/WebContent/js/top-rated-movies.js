import { initAddToCartSubmit} from "./utils.js";

function handleResult(resultData) {
    let html = "";
    for (let i = 0; i < resultData.length; i++) {
        html += '<div class="movie">'
        html += '   <div class="movie-header">'
        html += '       <h2 class="movie-title"><a href="movie.html?id=' + resultData[i]["movieId"] + '">' + resultData[i]["movieTitle"] + '</a></h2>'
        html += '   </div>'
        html += '   <div class="movie-content">'
        html += '       <div class="movie-info">'
        html += '           <span>Year:</span> ' + resultData[i]["movieYear"] + '<br/>'
        html += '           <span>Director:</span> ' + resultData[i]["movieDirector"] + '<br/>'
        html += '           <span>Genres:</span>'
        let genresArray = resultData[i]["movieGenres"].split(",");
        for (let j = 0; j < genresArray.length; j += 2) {
            html += '       <span class="genres"><a href="movies-list.html?action=browseGenre&value=' + genresArray[j+1] + '">' + genresArray[j+1] + '</a></span>'
        }
        html += '           <br/><span>Stars:</span>'
        let starsArray = resultData[i]["movieStars"].split(",");
        for (let j = 0; j < starsArray.length; j += 2) {
            html += '       <span class="stars"><a href="star.html?id=' + starsArray[j] + '">' + starsArray[j+1] + '</a></span>'
        }
        html += '           <br/><span class="rating">Rating:</span> ' + resultData[i]["movieRating"]
        html += '       </div>'
        html += '       <div class="add-to-cart-button" data-movie-id="' + resultData[i]["movieId"] + '">';
        html += '           <form method="post">';
        html += '               <input name="action" type="hidden" id="add-cart" value="add">';
        html += '               <input name="movieId" type="hidden" value="' + resultData[i]["movieId"] + '">';
        html += '               <input name="movieTitle" type="hidden" value="' + resultData[i]["movieTitle"] + '">';
        html += '               <button id="add-btn" type="submit">Add to Cart</button>';
        html += '           </form>';
        html += '       </div>';
        html += '   </div>'
        html += '</div>'
    }
    $(".movies-container").append(html);
}

// Enable Adding to Cart Feature
$(document).ready(function() {
    initAddToCartSubmit();
});

$.ajax({
    dataType: "json",
    method: "GET",
    url: "api/top-rated-movies",
    success: (resultData) => handleResult(resultData),
});
