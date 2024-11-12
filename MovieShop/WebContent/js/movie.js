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

jQuery.ajax({
    dataType: "json",
    method: "GET",
    url: "api/movie",
    data: {
        id: getParameterByName('id'),
    },
    success: (resultData) => handleResult(resultData),
});
