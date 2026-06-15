let map;

navigator.geolocation.getCurrentPosition(

async function(position){

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    initializeMap(lat, lng);

},

function(error){

    alert(error.message);

}

);

async function initializeMap(lat, lng){

    map = L.map('map').setView([lat, lng], 15);

    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }
    ).addTo(map);

    L.marker([lat, lng])
      .addTo(map)
      .bindPopup("📍 You are here!")
      .openPopup();

    loadCafes(lat, lng);

}

async function loadCafes(lat, lng){

    const cafeList =
        document.getElementById("cafeList");

    cafeList.innerHTML = "";

    const query = `
    [out:json];
    node["amenity"="cafe"](around:2000,${lat},${lng});
    out;
    `;

    const response = await fetch(
        "https://overpass-api.de/api/interpreter",
        {
            method: "POST",
            body: query
        }
    );

    const data = await response.json();

    data.elements.forEach(cafe => {

        const name =
            cafe.tags.name || "Unnamed Cafe";

        const marker =
            L.marker([cafe.lat, cafe.lon])
            .addTo(map)
            .bindPopup(name);

        const li =
            document.createElement("li");

        li.className = "cafe-item";

        li.innerHTML = `☕ ${name}`;

        li.addEventListener("click", () => {

            map.setView(
                [cafe.lat, cafe.lon],
                18
            );

            marker.openPopup();

        });

        cafeList.appendChild(li);

    });

}

document
.getElementById("searchBtn")
.addEventListener("click", searchCity);

async function searchCity(){

    const city =
        document.getElementById("cityInput").value;

    if(!city){

        alert("Enter a city name");

        return;

    }

    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
    );

    const data = await response.json();

    if(data.length === 0){

        alert("City not found");

        return;

    }

    const lat =
        parseFloat(data[0].lat);

    const lon =
        parseFloat(data[0].lon);

    map.setView([lat, lon], 14);

    loadCafes(lat, lon);

}