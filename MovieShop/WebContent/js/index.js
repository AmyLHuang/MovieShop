function handleResult(resultData) {
    let html = ""
    let genresContainerElement = jQuery("#genres-grid-container");
    for (let i = 0; i < resultData.length; i++) {
        html += '<p class="center"> <a href="movies-list.html?action=browseGenre&value=' + resultData[i]["gName"] + '">' +
            resultData[i]["gName"] + '</a></p>';
    }
    genresContainerElement.append(html);

    html = ""
    const titles = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
        'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '*'];
    let titlesContainerElement = jQuery("#titles-grid-container");
    for (let i = 0; i < titles.length; i++) {
        html += '<p class="center"> <a href="movies-list.html?action=browseTitle&value=' + titles[i] + '">' + titles[i] + '</a></p>'
    }
    titlesContainerElement.append(html);
}

jQuery.ajax({
    dataType: "json",
    method: "GET",
    url: "api/genres",
    success: (resultData) => handleResult(resultData),
});
