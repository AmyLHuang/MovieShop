/**
 * Handle the items in item list
 * @param resultData jsonObject, needs to be parsed to html
 */
function handleResult(resultData) {
    let saleList = $("#sale-table-body");

    for (let i = 0; i < resultData.length; i++) {
        if (resultData[i]["status"] === "success") {
            let html = '';
            html += '<tr>';
            html += '    <td>' + resultData[i]["saleId"] + '</td>';
            html += '    <td><a href="movie.html?id=' + resultData[i]["movieId"] + '">' + resultData[i]["movieName"] + '</a></td>';
            html += '    <td>$20</td>';
            html += "</tr>";
            saleList.append(html);
        }
    }
    let overallTotalRow = "<tr><td colspan='2'></td><td id='overall-total'>$" + resultData.length*20 + "</td></tr>";
    saleList.append(overallTotalRow);
}

$.ajax({
    dataType: "json",
    method: "POST",
    url: "api/confirmation",
    success: (resultData) => {handleResult(resultData);}
});