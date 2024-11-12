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
    console.log("@movie-list.js -- length of resultData: " + resultData.length);
    jQuery("#titleElement").append(resultData[resultData.length-1]["value"]);

    if (resultData.length === 0) {
        // TODO: display message
        // TODO: have button to go back
        return;
    }

    $("#limitSelect").val(resultData[resultData.length-1]['limit']);
    $("#orderSelect").val(resultData[resultData.length-1]['order']);

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
                html += '       <span class="genres"><a href="movies-list.html?action=browse-genre&value=' + genresArray[j + 1] + '">' + genresArray[j + 1] + '</a></span>'
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

    // Next button, Page number, Prev button,
    let changePageContainerElement = jQuery("#change-page-container");
    let componentHTML = '<form id="prev-form" action="#" method="get"><input type="hidden" name="action" id="qu-input" value="prev">';
    if (resultData[resultData.length-1]["offset"] > 0) {
        componentHTML += '<input type="submit" value="< Prev"></form>';
    } else {
        componentHTML += '<input type="submit" value="< Prev" disabled></form>';
    }
    changePageContainerElement.append(componentHTML);
    componentHTML = '<p>' + (resultData[resultData.length-1]["offset"]/resultData[resultData.length-1]["limit"]+1) + '</\p>';
    changePageContainerElement.append(componentHTML);
    componentHTML = '<form id="next-form" action="#" method="get"><input type="hidden" name="action" id="q-input" value="next">';
    if (resultData[resultData.length-1]["limit"] === resultData[resultData.length-1]["numResults"]) {
        componentHTML += '<input type="submit" value="Next >"></form>';
    } else {
        componentHTML += '<input type="submit" value="Next >" disabled></form>';
    }
    changePageContainerElement.append(componentHTML);
}

$(document).on('click', '#prev-form input[type="submit"]', function (event) {
    event.preventDefault();
    window.location.href = "movie-list.html?action=prev";
});

$(document).on('click', '#next-form input[type="submit"]', function (event) {
    event.preventDefault();
    window.location.href = "movie-list.html?action=next";
});

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
            order: getParameterByName('order'),
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
            order: getParameterByName('order'),
        },
        success: (resultData) => handleResult(resultData)
    });
}

