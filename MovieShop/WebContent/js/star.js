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
    let titleElement = jQuery(".title");
    titleElement.append(resultData[0]["starName"]);

    let infoElement = jQuery("#info");
    let starBirthYear = resultData[0]["starDoB"] == null ? "N/A" : resultData[0]["starDoB"];
    let html = "<p>Year of Birth: " + starBirthYear + "</p>";
    infoElement.append(html);

    html = "";
    for (let i = 0; i < resultData.length; i++) {
        html += "<tr><td><a href='movie.html?id=" + resultData[i]['movieId'] + "'>" + resultData[i]["movieTitle"] + "</a></td></tr>"
    }
    jQuery("#moviesTable").append(html);
}

jQuery.ajax({
    dataType: "json",
    method: "GET",
    url: "api/star?id=" + getParameterByName('id'),
    success: (resultData) => handleResult(resultData),
});
