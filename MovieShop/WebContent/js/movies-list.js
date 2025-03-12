function getParameterByName(target) {
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
    jQuery("#pageTitle").append(resultData[resultData.length-1]["value"]);
    jQuery("#limitSelect").val(resultData[resultData.length-1]['limit']);
    jQuery("#orderSelect").val(resultData[resultData.length-1]['order']);

    if (resultData.length === 1) {
        let msg = resultData[0]['offset'] === 0 ? "No Results" : "No More Results!";
        jQuery("#empty").append(msg);
    }

    jQuery(".movies-container").append(parseDataIntoHtml(resultData));

    // Next button, Page number, Prev button,
    let changePageContainerElement = jQuery("#change-page-container");
    let componentHTML = '<form id="prev-form" action="#" method="get"><input type="hidden" name="action" id="qu-input" value="prev">';
    if (resultData[resultData.length-1]["offset"] > 0) {
        componentHTML += '<input type="submit" value="< Prev"></form>';
    } else {
        componentHTML += '<input type="submit" value="< Prev" disabled></form>';
    }
    changePageContainerElement.append(componentHTML);
    componentHTML = '<p> Page ' + (resultData[resultData.length-1]["offset"]/resultData[resultData.length-1]["limit"]+1) + '</\p>';
    changePageContainerElement.append(componentHTML);
    componentHTML = '<form id="next-form" action="#" method="get"><input type="hidden" name="action" value="next">';
    if (resultData[resultData.length-1]["limit"] === resultData[resultData.length-1]["numResults"]) {
        componentHTML += '<input type="submit" value="Next >"></form>';
    } else {
        componentHTML += '<input type="submit" value="Next >" disabled></form>';
    }
    changePageContainerElement.append(componentHTML);
}

function parseDataIntoHtml(resultData) {
    let html = "";
    for (let i = 0; i < resultData.length-1; i++) {
        html += '<div class="movie">';
        html += '   <div class="movie-header">';
        html += '       <h2 class="movie-title"><a href="movie.html?id=' + resultData[i]["movieId"] + '">' + resultData[i]["movieTitle"] + '</a></h2>';
        html += '   </div>';
        html += '   <div class="movie-content">';
        html += '       <div class="movie-info">';
        html += '           <span>Year:</span> ' + resultData[i]["movieYear"] + '<br/>';
        html += '           <span>Director:</span> ' + resultData[i]["movieDirector"] + '<br/>';
        html += '           <span>Genres:</span>';
        let genresArray = resultData[i]["movieGenres"].split(",");
        for (let j = 0; j < genresArray.length; j += 2) {
            html += '       <span class="genres"><a href="movies-list.html?action=browseGenre&value=' + genresArray[j + 1] + '">' + genresArray[j + 1] + '</a></span>';
        }
        html += '           <br/><span>Stars:</span>';
        let starsArray = resultData[i]["movieStars"].split(",");
        for (let j = 0; j < starsArray.length; j += 2) {
            html += '       <span class="stars"><a href="star.html?id=' + starsArray[j] + '">' + starsArray[j + 1] + '</a></span>';
        }
        html += '           <br/><span class="rating">Rating:</span> ' + resultData[i]["movieRating"];
        html += '       </div>';
        html += '       <div class="add-to-cart-button" data-movie-id="' + resultData[i]["movieId"] + '">';
        html += '           <form method="post">';
        html += '               <input name="action" type="hidden" id="add-cart" value="add">';
        html += '               <input name="movieId" type="hidden" value="' + resultData[i]["movieId"] + '">';
        html += '               <input name="movieTitle" type="hidden" value="' + resultData[i]["movieTitle"] + '">';
        html += '               <input type="submit" value="Add to Cart">';
        html += '           </form>';
        html += '       </div>';
        html += '   </div>';
        html += '</div>';
    }
    return html;
}

function handleCartArray(resultArray) {
    let item_list = $("#item_list");
    let res = "<ul>";
    for (let i = 0; i < resultArray.length; i++) {
        res += "<li>" + resultArray[i] + "</li>";
    }
    res += "</ul>";

    // clear the old array and show the new array in the frontend
    item_list.html("");
    item_list.append(res);
}

$(document).on('submit', '.add-to-cart-button form', function(event) {
    event.preventDefault();
    const formData = $(this).serialize();
    const params = new URLSearchParams(formData);
    const mTitle = params.get('movieTitle');
    jQuery.ajax({
        method: 'POST',
        url: 'api/cart',
        data: formData,
        success: resultDataString => {
            let resultDataJson = JSON.parse(resultDataString);
            handleCartArray(resultDataJson["previousItems"]);
            window.alert("Successfully added " + mTitle);
        }
    });
});

$(document).on('click', '#prev-form input[type="submit"]', function (event) {
    event.preventDefault();
    window.location.href = "movies-list.html?action=prev";
});

$(document).on('click', '#next-form input[type="submit"]', function (event) {
    event.preventDefault();
    window.location.href = "movies-list.html?action=next";
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
