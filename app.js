// ===== Settings =====
const API_KEY = '9918824551ea5b43251582674732afce';
const KHARTOUM = [15.5007, 32.5599];

// ===== Phase 1: DOM Setup & Map Init =====
const map = L.map('map').setView(KHARTOUM, 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// ===== DOM references =====
const form = document.getElementById('weather-form');
const input = document.getElementById('location-input');
const spinner = document.getElementById('spinner');
const errorCard = document.getElementById('error-card');

let currentMarker = null;

// ===== UI helpers =====
function showSpinner(show) {
    spinner.classList.toggle('hidden', !show);
}

function showError(message) {
    errorCard.textContent = message;
    errorCard.classList.remove('hidden');
}

function clearError() {
    errorCard.textContent = '';
    errorCard.classList.add('hidden');
}
// ===== Phase 2: Asynchronous Geocoding =====
async function geocodeCity(city) {
    const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' +
        encodeURIComponent(city);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Location service is not responding. Try again.');
    }

    const data = await response.json();
    if (data.length === 0) {
        throw new Error('City not found. Check the spelling and try again.');
    }

    return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        name: data[0].display_name.split(',')[0]
    };
}

// ===== Phase 3: OpenWeather Fetch =====
async function fetchWeather(lat, lng) {
    const url = 'https://api.openweathermap.org/data/2.5/weather' +
        '?lat=' + lat + '&lon=' + lng + '&units=metric&appid=' + API_KEY;

    const response = await fetch(url);

    if (response.status === 401) {
        throw new Error('Invalid API key. A new key can take up to 2 hours to activate.');
    }
    if (!response.ok) {
        throw new Error('Weather service is not responding. Try again.');
    }

    return response.json();
}
// ===== Phase 5: InfoWindow content =====
function buildWeatherCard(cityName, weather) {
    const card = document.createElement('div');
    card.className = 'weather-card';

    const title = document.createElement('h3');
    title.textContent = cityName;

    const icon = document.createElement('img');
    icon.src = 'https://openweathermap.org/img/wn/' + weather.weather[0].icon + '@2x.png';
    icon.alt = weather.weather[0].description;

    const temp = document.createElement('div');
    temp.className = 'temp';
    temp.textContent = Math.round(weather.main.temp) + ' °C';

    const desc = document.createElement('div');
    desc.textContent = weather.weather[0].description;

    const details = document.createElement('div');
    details.textContent =
        'Clouds: ' + weather.clouds.all + '% | ' +
        'Humidity: ' + weather.main.humidity + '% | ' +
        'Wind: ' + weather.wind.speed + ' m/s';

    const shareBtn = document.createElement('button');
    shareBtn.type = 'button';
    shareBtn.textContent = 'Share';

    const shareText =
        'Weather in ' + cityName + ': ' + Math.round(weather.main.temp) + '°C, ' +
        weather.weather[0].description + ', humidity ' + weather.main.humidity + '%, wind ' +
        weather.wind.speed + ' m/s';

    shareBtn.addEventListener('click', async function () {
        try {
            if (navigator.share) {
                await navigator.share({ title: 'WeatherMap', text: shareText });
            } else {
                await navigator.clipboard.writeText(shareText);
                shareBtn.textContent = 'Copied!';
                setTimeout(function () { shareBtn.textContent = 'Share'; }, 2000);
            }
        } catch (err) {
            // user cancelled the share dialog
        }
    });

    card.append(title, icon, temp, desc, details, shareBtn);
    return card;
}
// ===== Phase 4 + 5: Map Center, Marker, InfoWindow =====
function showOnMap(location, weather) {
    map.flyTo([location.lat, location.lng], 10, { duration: 1.5 });

    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    currentMarker = L.marker([location.lat, location.lng]).addTo(map);
    currentMarker.bindPopup(buildWeatherCard(location.name, weather));

    map.once('moveend', function () {
        currentMarker.openPopup();
    });
}

// ===== Form submit: chains all phases =====
form.addEventListener('submit', async function (event) {
    event.preventDefault();
    clearError();

    const city = input.value.trim();
    if (city === '') {
        showError('Please enter a city name.');
        return;
    }

    showSpinner(true);
    try {
        const location = await geocodeCity(city);
        const weather = await fetchWeather(location.lat, location.lng);
        showOnMap(location, weather);
    } catch (err) {
        showError(err.message);
    } finally {
        showSpinner(false);
    }
});