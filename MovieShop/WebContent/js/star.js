import {getParameterByName} from "./utils.js";

function handleResult(resultData) {
    let titleElement = jQuery(".title");
    titleElement.append(resultData[0]["starName"]);

    let infoElement = jQuery("#movie-info");
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
