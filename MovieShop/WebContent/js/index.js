function handleResult(resultData) {
    let html = ""
    for (let i = 0; i < resultData.length; i++) {
        html += '<li><a href="movies-list.html?action=browseGenre&value=' + resultData[i]["gName"] + '">' +
            resultData[i]["gName"] + '</a></li>';
    }
    jQuery("#genre-list").append(html);

    html = ""
    const titles = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
        'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '*'];
    for (let i = 0; i < titles.length; i++) {
        html += '<li><a href="movies-list.html?action=browseTitle&value=' + titles[i] + '">' + titles[i] + '</a>'
    }
    jQuery("#title-list").append(html);
}

jQuery.ajax({
    dataType: "json",
    method: "GET",
    url: "api/genres",
    success: (resultData) => handleResult(resultData),
});
