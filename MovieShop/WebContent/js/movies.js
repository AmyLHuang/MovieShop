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
    console.log(resultData);
    let titleElement = jQuery(".pageTitle");
    if (action === "advanced-search") {
        titleElement.append("Search Results");
    } else {
        titleElement.append(getParameterByName('value'));
    }

    if (resultData.length === 0) {
        // display message
        // have button to go back
        return;
    }

    function parseDataIntoHtml() {
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
                html += '       <span class="genres"><a href="movies.html?action=browse-genre&value=' + genresArray[j + 1] + '">' + genresArray[j + 1] + '</a></span>'
            }
            html += '           <br/><span>Stars:</span>'
            let starsArray = resultData[i]["movieStars"].split(",");
            for (let j = 0; j < starsArray.length; j += 2) {
                html += '       <span class="stars"><a href="star.html?id=' + starsArray[j] + '">' + starsArray[j + 1] + '</a></span>'
            }
            html += '           <br/><span class="rating">Rating:</span> ' + resultData[i]["movieRating"]
            html += '       </div>'
            html += '   </div>'
            html += '</div>'
        }
        return html;
    }

    let movieContainerElement = jQuery(".movies-container");
    movieContainerElement.append(parseDataIntoHtml());
}

let action = getParameterByName('action');
if (action === 'advanced-search')  {
        jQuery.ajax({
            dataType: "json",
            method: "GET",
            url: "api/movies",
            data: {
                action: getParameterByName('action'),
                title: getParameterByName('title'),
                year: getParameterByName('year'),
                director: getParameterByName('director'),
                star: getParameterByName('star'),
            },
            success: (resultData) => handleResult(resultData),
        });
} else {
    jQuery.ajax({
        dataType: "json",
        method: "GET",
        url: "api/movies",
        data: {
            action: getParameterByName('action'),
            value: getParameterByName('value'),
        },
        success: (resultData) => handleResult(resultData),
    });
}

