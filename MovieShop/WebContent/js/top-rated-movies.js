function handleResult(resultData) {
    let movieContainerElement = jQuery(".movies-container");
    let html = "";
    for (let i = 0; i < resultData.length; i++) {
        html += '<div class="movie">'
        html += '   <div class="movie-header">'
        html += '       <h2 class="movie-title"><a href="movie.html?id=' + resultData[i]["movieId"] + '">' + resultData[i]["movieTitle"] + '</a></h2>'
        html += '   </div>'
        html += '   <div class="movie-content">'
        html += '       <div class="info">'
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
        html += '               <input type="submit" class="add-to-cart-button-inner" value="Add to Cart">';
        html += '           </form>';
        html += '       </div>';
        html += '   </div>'
        html += '</div>'
    }
    movieContainerElement.append(html);
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
   url: "api/top-rated-movies",
   success: (resultData) => handleResult(resultData),
});


