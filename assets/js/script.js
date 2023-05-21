var FiveDayDisplay = $('#five-day-display');
var fiveForecastMain = $('#five-day-display-main');
var historyDisplay = $('#search-history-screen');
var userInput = $('#city-selected');
var searchBtn = $('#search-btn');
var currentDay = $('#current-day');
var currentDate = dayjs().format(' [-] MMM DD, YYYY [-]');

// This will show all the previous searches from your local storage
function loadHistoryList(){
    var historyCity = readLocalStorage();
    if (historyCity){
        for(i=0;i< historyCity.length ;i++){
            var btnHistory = $('<button>');
            btnHistory.addClass('btn btn-history');
            btnHistory.text(historyCity[i]);
            historyDisplay.append(btnHistory);
            btnHistory.on('click',historyBtnClick);
        }
        historyDisplay.children().attr('style','visibility:visible');
    }
}

function historyBtnClick(event){
    event.preventDefault();
    var currentClickedCity = event.currentTarget.firstChild.textContent.trim();
    getLatandLon(currentClickedCity);
}

function readLocalStorage(){
    var localHistory = localStorage.getItem('cityHistory');
    if (localHistory) {
        localHistory = JSON.parse(localHistory);
    } else {
        localHistory = [];
    }
    return localHistory;
}

// The weather API 
function getLatandLon(cityName){
    var requestLatURL = 'https://api.openweathermap.org/geo/1.0/direct?q='+cityName+',US&limit=1&appid=f47e6a19d6e4c6e6b84b56bae2fdf11f';
    fetch(requestLatURL)
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        var latCity = data[0].lat;
        var lonCity = data[0].lon;
        var forecastRequest = 'https://api.openweathermap.org/data/2.5/forecast?lat='+latCity+'&lon='+lonCity+'&units=imperial&appid=f47e6a19d6e4c6e6b84b56bae2fdf11f';
        var currentWeather ='https://api.openweathermap.org/data/2.5/weather?lat='+latCity+'&lon='+lonCity+'&units=imperial&appid=f47e6a19d6e4c6e6b84b56bae2fdf11f';
        fetch(currentWeather)
        .then(function(currentResponse){
            return currentResponse.json();
        })
        .then(function(currentData){
            currentDay.children('h3').text(currentData.name);
            currentDay.children('h3').append(currentDate);
            if(currentData.weather.length > 0 ){
                for(var i=0; i < currentData.weather.length; i++){
                   var imageSrc = 'https://openweathermap.org/img/wn/'+currentData.weather[i].icon+'@2x.png';
                   var icon = $('<img>');
                   icon.attr('style', 'width:50px');
                   icon.attr('alt','weather icon');
                   icon.attr('src',imageSrc );
                   currentDay.children('h3').append(icon);
                }
            }
            currentDay.children().eq(1).text('Temp: '+currentData.main.temp+ '°F');
            currentDay.children().eq(2).text('Wind: '+currentData.wind.speed+ ' MPH');
            currentDay.children().eq(3).text('Humidity: '+currentData.main.humidity+' %');
        })
        fetch(forecastRequest)
        .then(function(forecastResponse){
            return forecastResponse.json();
        })
        .then(function(forecastData){
             var listFive = [];
            for (var i=0; i < forecastData.list.length ; i+=8){
                listFive.push(forecastData.list[i])
            }
            for (var i=0; i< listFive.length;i++){
                var x= i+1
                var div = $($('#day'+ x))
                var date = dayjs(listFive[i]['dt_txt']).format('MMM DD, YYYY');
                var imageSrc = 'https://openweathermap.org/img/wn/'+listFive[i].weather[0].icon+'@2x.png'
                div.children('h5').text(date);
                div.children('img').attr('src',imageSrc)
                div.children().eq(2).text('Temp: ' + listFive[i].main.temp+ ' °F');
                div.children().eq(3).text('Wind: ' + listFive[i].wind.speed+ ' MPH')
                div.children().eq(4).text('Humidity: ' + listFive[i].main.humidity+ ' %');  
            }   
        })
        fiveForecastMain.attr('style','visibility:visible;');
        currentDay.attr('style','visibility:visible;');
    });  
}

// this function is what searches for the city you typed in 
function searchCityBtn(event){
    event.preventDefault();
    var citySelected = userInput.val();
    getLatandLon(citySelected);
    saveToLocalStorage(citySelected);
    loadLastItem();
    userInput.val('');
}

// this fuction will save your search to local storage 
function saveToLocalStorage(cityName){
    var listCityHistory = readLocalStorage();
    listCityHistory.push(cityName);
    localStorage.setItem("cityHistory", JSON.stringify(listCityHistory));
}

loadHistoryList()
searchBtn.on('click',searchCityBtn)
