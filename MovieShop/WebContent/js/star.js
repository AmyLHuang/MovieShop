import {getParameterByName} from "./utils.js";

function handleResult(resultData) {
    $("#title").append(resultData[0]["starName"]);

    let starBirthYear = resultData[0]["starDoB"] == null ? "N/A" : resultData[0]["starDoB"];
    let dobHtml = "<p>Year of Birth: " + starBirthYear + "</p>";
    $("#dob").append(dobHtml);

    let tableBodyHtml = "<tbody>";
    for (let i = 0; i < resultData.length; i++) {
        tableBodyHtml += "<tr><td><a href='movie.html?id=" + resultData[i]['movieId'] + "'>" + resultData[i]["movieTitle"] + "</a></td></tr>"
    }
    tableBodyHtml += "</tbody>";
    $("#moviesTable").append(tableBodyHtml);
}

$.ajax({
    dataType: "json",
    method: "GET",
    url: "api/star?id=" + getParameterByName('id'),
    success: (resultData) => handleResult(resultData),
});
