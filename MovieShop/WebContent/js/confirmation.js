/**
 * Handle the items in item list
 * @param resultData jsonObject, needs to be parsed to html
 */
function handleResult(resultData) {
    let sale_list = $("#sale_table_body");

    for (let i = 0; i < resultData.length; i++) {
        if (resultData[i]["status"] === "success") {
            let html = '';
            html += '<tr>';
            html += '    <td>' + resultData[i]["saleId"] + '</td>';
            html += '    <td><a href="movie.html?id=' + resultData[i]["movieId"] + '">' + resultData[i]["movieName"] + '</a></td>';
            html += '    <td>$20</td>';
            html += "</tr>";
            sale_list.append(html);
        }
    }
    let overallTotalRow = "<tr><td colspan='2'></td><td id='overall-total'>$" + resultData.length*20 + "</td></tr>";
    sale_list.append(overallTotalRow);
}

jQuery.ajax({
    dataType: "json",
    method: "POST",
    url: "api/confirmation",
    success: (resultData) => {handleResult(resultData);}
});