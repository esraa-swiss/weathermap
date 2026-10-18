WeatherMap
Advanced Web Technologies - Course Project
An asynchronous client-side Single Page Application (SPA). The user types a city name, the app finds its coordinates, centers the map on it, and shows the current weather in a popup on the map. The page never reloads.
How to run
Open app.js and put the API key below in line 2:
const API_KEY = 'put the api key here'
Open the project folder in VS Code and run index.html with the Live Server extension (or open it in any browser).
An internet connection is required.
API key (OpenWeatherMap)
(9918824551ea5b43251582674732afce)
Code
Files
index.html - page structure
style.css - all styling
app.js - all logic (vanilla JavaScript)
Features
Map (Leaflet.js + OpenStreetMap), starts centered on Khartoum, zoom 6
City search using the Nominatim geocoding API (async fetch)
Current weather using the OpenWeatherMap API (temperature, clouds, humidity, wind, icon)
Smooth map animation, one marker at a time (the old marker is removed)
Popup card with a Share button (Web Share API, or copy to clipboard)