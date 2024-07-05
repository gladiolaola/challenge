var APIkey = "9a1ef4b357aa8b1ab5a4fce1c51a6966";
var searchInput = "";
var todayCard = $('#today');
var fiveDayForecast = $('#forecast');
var searchHistory = [];


// ON SEARCH CLICK DISPLAY RESULTS
$('#search-button').on('click', function (event) {

    //prevent default action
    event.preventDefault();

    // grab input val & get weather data
    searchInput = $('#search-input').val();
    getWeather();

    // add to buttons to allow users to search for that city again
    addToButtons();

});


// MAIN WEATHER FUNCTION - GET LON/LAT & GENERATE WEATHER
function getWeather() {

    // clear previous searches on screen otherwise it repeats
    todayCard.empty();
    $('#forecast-title').empty();
    fiveDayForecast.empty();

    // get search value & set URL for geocoding API
    var geoQueryURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + searchInput + "&limit=5&appid=" + APIkey;

    // GET LATITUDE & LONGITUDE FOR CITY
    $.ajax({
        url: geoQueryURL,
        method: "GET"
    }).then(function (response) {

        // get lon/lat, reduce to 2 decimals and update openweathermap API url
        var lon = response[0].lon.toFixed(2);
        var lat = response[0].lat.toFixed(2);
        var queryURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&cnt=40&appid=" + APIkey;

        // GET WEATHER FOR CURRENT DAY
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {

            var todayDiv = $('<div>').attr('class', "card today-card p-4");;

            // city name and date (using moment to remove time stamp)
            var cityNameAndDate = $('<h2>').text(
                response.city.name + " (" +
                moment(response.list[0].dt_txt).format('DD/MM/YY') + ")"
            );

            // icon
            var iconCode = response.list[0].weather[0].icon;
            var todayIcon = $('<img>').attr({
                src: "https://openweathermap.org/img/w/" + iconCode + ".png",
                height: "50px",
                width: "50px"
            });

            // temp in C (kelvin -273.15 = C)
            var todaysTemp = $('<p>').text("Temp: " + (response.list[0].main.temp_max - 273.15).toFixed(2) + " °C");

            // wind speed in KPH
            var todayWind = $('<p>').text("Wind: " + response.list[0].wind.speed + " KPH");

            // humidity percentage
            var todayHumidity = $('<p>').text("Humidity: " + response.list[0].main.humidity + "%");

            // append all items
            todayCard.append(todayDiv);
            todayDiv.append(cityNameAndDate, todayIcon, todaysTemp, todayWind, todayHumidity);


            // GET FIVE DAY FORECAST
            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {

                // get forecast for next 5 days
                var forecastTitle = $('<h4>').text("5-Day forecast: ");
                $('#forecast-title').append(forecastTitle);

                // each day is 8 x 3 hr
                for (i = 8; i < response.list.length; i++) {

                    var forecastDiv = $('<div>').attr('class', "card forecast-card m-3");
                    var forecastCard = $('<div>').attr('class', "card-body");

                    //date
                    var date = $('<h5>').text(moment(response.list[i].dt_txt).format('DD/MM/YY'));
                    date.attr('class', 'card-title');

                    // icon
                    var iconCode = response.list[i].weather[0].icon;
                    var forecastIcon = $('<img>').attr({
                        src: "https://openweathermap.org/img/w/" + iconCode + ".png",
                        height: "50px",
                        width: "50px"
                    });

                    // temp
                    var temp = $('<p>').text("Temp: " + (response.list[i].main.temp_max - 273.15).toFixed(2) + " °C");

                    // wind speed
                    var windSpeed = $('<p>').text("Wind: " + response.list[i].wind.speed + " KPH");

                    // humidity
                    var humidity = $('<p>').text("Humidity: " + response.list[i].main.humidity + "%");

                    fiveDayForecast.append(forecastDiv);
                    forecastDiv.append(forecastCard);
                    forecastCard.append(date, forecastIcon, temp, windSpeed, humidity);

                    // add 7 to get to the next day (instead of 8 as the loop already adds 1)
                    i = i + 6; // changed to 6 as wasn't picking up 5th day - not sure why
                }

            })
        });
    });
};


// GENERATE SEARCH HISTORY BUTTONS
function addToButtons() {

    // get search input
    var input = $('#search-input').val();

    // create button with search input as text content
    var button = $('<button>').text(input);
    button.attr({
        class: 'search-history mb-3',
        "data-name": input
    });

    // add button to history div below search bar
    $('#history').append(button);

    // add to local storage and search terms array
    searchHistory.push(input);
    localStorage.setItem("search-term", JSON.stringify(searchHistory));

};


// on click of previous city button, get weather
$(document).on("click", ".search-history", function (event) {

    // search input is the name within data-name
    searchInput = $(this).attr("data-name");

    // run getweather function to display weather
    getWeather();

});



// render buttons from local storage
function renderButtons() {

    // get local storage
    storageSearchHistory = JSON.parse(localStorage.getItem("search-term"));

    // if local storage is blank, do not add buttons
    if (storageSearchHistory === null) {
        searchHistory = [];

    } else {
        searchHistory = storageSearchHistory;

        // for each storage item, create button
        for (i = 0; i < searchHistory.length; i++) {

            var button = $('<button>').text(searchHistory[i]);

            button.attr({
                class: 'search-history mb-3',
                "data-name": searchHistory[i]
            });

            $('#history').append(button);
        }
    }
};

// render buttons on page load
renderButtons();

// clear local storage on click
$('#clear-history').on("click", function (event) {

    // empty local storage array
    searchHistory = [];

    // empty local storage
    localStorage.removeItem("search-term");

    // remove all buttons previously rendered
    $('#history').empty();

});
