var FiveDayDisplayEL = $('#five-day-display');
var fiveForecastMainEl = $('#five-day-display-main');
var historyDisplayEL = $('#search-history-screen');
var userInputEl = $('#city-selected');
var searchBtnEl = $('#search-btn');
var currentDayEl = $('#current-day');
var currentDate =  dayjs().format(' [-] MMM DD, YYYY [-]');


//load first page hide items if search history stored show history
function loadHistoryList(){
    // assign value if local storage has city history search
    var historyCity = readLocalStorage();

    if (historyCity){
            for(i=0;i< historyCity.length ;i++){
                var btnHistory = $('<button>');
                btnHistory.addClass('btn btn-history');
                btnHistory.text(historyCity[i]);
                historyDisplayEL.append(btnHistory);
                btnHistory.on('click',historyBtnClick);
            }
            historyDisplayEL.children().attr('style','visibility:visible');
            

        }
}
//load last entered city in search history
function loadLastItem(){
    var historyCityList = readLocalStorage();
    var lastCity = historyCityList.slice(-1);
    var btnHistory = $('<button>');
    btnHistory.addClass('btn btn-history');
    btnHistory.text(lastCity);
    historyDisplayEL.append(btnHistory);
    historyDisplayEL.children().attr('style','visibility:visible');
    btnHistory.on('click',historyBtnClick);

}
//load page when button history clicked
function historyBtnClick(event){
    event.preventDefault();
    var currentClickedCity = event.currentTarget.firstChild.textContent.trim();
    getLatandLon(currentClickedCity);
}

// function to get search history from local 
function readLocalStorage(){
    var localHistory = localStorage.getItem('cityHistory');
  if (localHistory) {
    localHistory = JSON.parse(localHistory);
  } else {
    localHistory = [];
  }
  return localHistory;
}

//call to the weather API to get info for current weather and forecast 
function getLatandLon(cityName){
   
    var requestLatURL = 'https://api.openweathermap.org/geo/1.0/direct?q='+cityName+',US&limit=1&appid=f47e6a19d6e4c6e6b84b56bae2fdf11f'

//fetch for latitude and longitude of city selected 
    fetch(requestLatURL)
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        var latCity = data[0].lat;
        var lonCity = data[0].lon;
        //give lat and lon to forecast api and current weather api
        var forecastRequest = 'https://api.openweathermap.org/data/2.5/forecast?lat='+latCity+'&lon='+lonCity+'&units=imperial&appid=f47e6a19d6e4c6e6b84b56bae2fdf11f';
        var currentWeather ='https://api.openweathermap.org/data/2.5/weather?lat='+latCity+'&lon='+lonCity+'&units=imperial&appid=f47e6a19d6e4c6e6b84b56bae2fdf11f';

        // fetche current weather
        fetch(currentWeather)
        .then(function(currentResponse){
            return currentResponse.json();

        })
        // display data in elements
        .then(function(currentData){

            currentDayEl.children('h3').text(currentData.name);
            currentDayEl.children('h3').append(currentDate);
            //if more than one icon 
            if(currentData.weather.length > 0 ){
                for(var i=0; i < currentData.weather.length; i++){
                   var imageSrc = 'https://openweathermap.org/img/wn/'+currentData.weather[i].icon+'@2x.png';
                   var icon = $('<img>');
                   icon.attr('style', 'width:50px');
                   icon.attr('alt','weather icon');
                   icon.attr('src',imageSrc );
                   currentDayEl.children('h3').append(icon);
                }
            }

            currentDayEl.children().eq(1).text('Temp: '+currentData.main.temp+ '°F');
            currentDayEl.children().eq(2).text('Wind: '+currentData.wind.speed+ ' MPH');
            currentDayEl.children().eq(3).text('Humidity: '+currentData.main.humidity+' %');
        })
        
        // fetch five day forecast
        fetch(forecastRequest)
        .then(function(forecastResponse){
            return forecastResponse.json();

        })
        .then(function(forecastData){
             var listFive = [];
             //incremented variable i by 8 to get just one time set for each day 
            for (var i=0; i < forecastData.list.length ; i+=8){
                listFive.push(forecastData.list[i])
            }

            for (var i=0; i< listFive.length;i++){
                var x= i+1
                var divEl = $($('#day'+ x))
                var date = dayjs(listFive[i]['dt_txt']).format('MMM DD, YYYY');
                var imageSrc = 'https://openweathermap.org/img/wn/'+listFive[i].weather[0].icon+'@2x.png'

                divEl.children('h5').text(date);
                divEl.children('img').attr('src',imageSrc)
                divEl.children().eq(2).text('Temp: ' + listFive[i].main.temp+ ' °F');
                divEl.children().eq(3).text('Wind: ' + listFive[i].wind.speed+ ' MPH')
                divEl.children().eq(4).text('Humidity: ' + listFive[i].main.humidity+ ' %');  
            } 
           
        })
        fiveForecastMainEl.attr('style','visibility:visible;');
        currentDayEl.attr('style','visibility:visible;');
    });
    
}

//search weather for city entered and button search clicked
function searchCityBtn(event){
    event.preventDefault();
    
    var citySelected = userInputEl.val();
    getLatandLon(citySelected);
    saveToLocalStorage(citySelected);
    loadLastItem();
    userInputEl.val('');
}
//save city to local storage 
function saveToLocalStorage(cityName){
    var listCityHistory = readLocalStorage();
    listCityHistory.push(cityName);
    localStorage.setItem("cityHistory", JSON.stringify(listCityHistory));
}

// call when page loads 
loadHistoryList()

//search button click
searchBtnEl.on('click',searchCityBtn)
