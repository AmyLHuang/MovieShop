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
            html += '       <span class="genres"><a href="movies-list.html?action=browse-genre&value=' + genresArray[j+1] + '">' + genresArray[j+1] + '</a></span>'
        }
        html += '           <br/><span>Stars:</span>'
        let starsArray = resultData[i]["movieStars"].split(",");
        for (let j = 0; j < starsArray.length; j += 2) {
            html += '       <span class="stars"><a href="star.html?id=' + starsArray[j] + '">' + starsArray[j+1] + '</a></span>'
        }
        html += '           <br/><span class="rating">Rating:</span> ' + resultData[i]["movieRating"]
        html += '       </div>'
        html += '   </div>'
        html += '</div>'
    }
    movieContainerElement.append(html);
}

jQuery.ajax({
   dataType: "json",
   method: "GET",
   url: "api/top-rated-movies",
   success: (resultData) => handleResult(resultData),
});
