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
    titleElement.append(resultData["starName"]);

    let infoElement = jQuery("#info");
    let starBirthYear = resultData["starYear"] == null ? "N/A" : resultData["starYear"];
    html += "<p>Year of Birth: " + starBirthYear + "</p>";
    infoElement.append(html);

    html = "";
    let moviesTableElement = jQuery("#moviesTable");
    let moviesArray = resultData["starMovies"].split(",");
    for (let i = 0; i < moviesArray.length; i += 2) {
        html += "<tr><td><a href='movie.html?id=" + moviesArray[i] + "'>" + moviesArray[i+1] + "</a></td></tr>";
    }
    moviesTableElement.append(html);
}

jQuery.ajax({
    dataType: "json",
    method: "GET",
    url: "api/star?id=" + getParameterByName('id'),
    success: (resultData) => handleResult(resultData),
});
