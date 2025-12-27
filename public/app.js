/***********************
 * ELEMENT REFERENCES
 ***********************/
const cityInput = document.getElementById('searchInput');
const heritageList = document.getElementById('heritageList');
const siteDetails = document.getElementById('siteDetails');
const trafficSpan = document.getElementById('traffic');
const slotSpan = document.getElementById('slot');
const clearanceSpan = document.getElementById('clearance');
const mapsLink = document.getElementById('mapsLink');
const autocompleteList = document.getElementById('autocomplete-list');

/***********************
 * MAP INITIALIZATION
 ***********************/
const map = L.map('map').setView([22.5, 78.9], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let markers = [];

/***********************
 * FESTIVAL DATA (FAMOUS INDIAN FESTIVALS)
 ***********************/
const festivalEvents = [
  { title: "Republic Day 🇮🇳", start: "2025-01-26" },
  { title: "Maha Shivratri 🔱", start: "2025-02-26" },
  { title: "Holi 🎨", start: "2025-03-14" },
  { title: "Ram Navami 🛕", start: "2025-04-06" },
  { title: "Eid-ul-Fitr 🌙", start: "2025-04-10" },
  { title: "Independence Day 🇮🇳", start: "2025-08-15" },
  { title: "Janmashtami 🦚", start: "2025-08-26" },
  { title: "Gandhi Jayanti 🕊️", start: "2025-10-02" },
  { title: "Dussehra 🏹", start: "2025-10-11" },
  { title: "Diwali 🪔", start: "2025-11-12" },
  { title: "Christmas 🎄", start: "2025-12-25" }
];

/***********************
 * CALENDAR (VERY COMPACT + CLICK TO VIEW FESTIVALS)
 ***********************/
let calendar = new FullCalendar.Calendar(
  document.getElementById('calendar'),
  {
    initialView: 'dayGridMonth',
    height: 'auto',
    events: festivalEvents,

    dateClick: function (info) {
      const eventsOnDate = calendar
        .getEvents()
        .filter(e => e.startStr === info.dateStr);

      if (eventsOnDate.length === 0) {
        alert("No festivals on this date");
      } else {
        const names = eventsOnDate.map(e => "• " + e.title).join("\n");
        alert(`Festivals on ${info.dateStr}:\n${names}`);
      }
    }
  }
);

calendar.render();

/***********************
 * AUTOCOMPLETE (CITY + PLACE)
 ***********************/
cityInput.addEventListener('input', async () => {
  const query = cityInput.value.trim();
  autocompleteList.innerHTML = '';
  if (query.length < 2) return;

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&countrycodes=in`
  );
  const data = await res.json();

  data.forEach(place => {
    const div = document.createElement('div');
    div.textContent = place.display_name;
    div.style.padding = '6px';
    div.style.cursor = 'pointer';

    div.onclick = () => {
      cityInput.value = place.display_name;
      autocompleteList.innerHTML = '';
      searchHeritage();
    };

    autocompleteList.appendChild(div);
  });
});

/***********************
 * GET LOCATION COORDINATES
 ***********************/
async function getLocationCoordinates(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=1`
  );
  const data = await res.json();

  if (!data.length) throw new Error("Location not found");

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    name: data[0].display_name
  };
}

/***********************
 * FETCH TOURIST + HERITAGE PLACES
 ***********************/
async function fetchPlaces(lat, lon) {
  const overpassQuery = `
    [out:json];
    (
      node["historic"](around:8000,${lat},${lon});
      node["tourism"="attraction"](around:8000,${lat},${lon});
      node["tourism"="museum"](around:8000,${lat},${lon});
    );
    out;
  `;

  const response = await fetch(
    "https://overpass-api.de/api/interpreter",
    {
      method: "POST",
      body: overpassQuery,
      headers: { "Content-Type": "text/plain" }
    }
  );

  const data = await response.json();

  return data.elements
    .filter(el => el.tags && el.tags.name)
    .map(el => ({
      name: el.tags.name,
      lat: el.lat,
      lon: el.lon
    }));
}

/***********************
 * DISPLAY PLACES
 ***********************/
function displayPlaces(places, locationName) {
  heritageList.innerHTML = '';
  siteDetails.style.display = 'none';

  markers.forEach(m => map.removeLayer(m));
  markers = [];

  if (!places.length) {
    heritageList.innerHTML =
      '<li>No tourist or heritage places found</li>';
    return;
  }

  places.forEach(place => {
    const li = document.createElement('li');
    li.textContent = place.name;

    li.onclick = () => showDetails(place, locationName);

    heritageList.appendChild(li);

    const marker = L.marker([place.lat, place.lon])
      .addTo(map)
      .bindPopup(place.name);

    markers.push(marker);
  });

  map.setView([places[0].lat, places[0].lon], 13);
}

/***********************
 * SHOW PLACE DETAILS
 ***********************/
function showDetails(place, city) {
  siteDetails.style.display = 'block';

  const trafficLevels = ['Light', 'Moderate', 'Heavy'];
  const timeSlots = ['7–9 AM', '9–11 AM', '3–5 PM', '5–7 PM'];
  const clearances = [
    'No clearance required',
    'Security check required',
    'Restricted area permit'
  ];

  const traffic =
    trafficLevels[Math.floor(Math.random() * trafficLevels.length)];

  trafficSpan.textContent = traffic;
  trafficSpan.className =
    traffic === 'Light'
      ? 'badge traffic-light'
      : traffic === 'Moderate'
      ? 'badge traffic-moderate'
      : 'badge traffic-heavy';

  slotSpan.textContent =
    timeSlots[Math.floor(Math.random() * timeSlots.length)];

  clearanceSpan.textContent =
    clearances[Math.floor(Math.random() * clearances.length)];

  mapsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    place.name + ', ' + city
  )}`;
  mapsLink.textContent = 'Open in Google Maps';
}

/***********************
 * SEARCH FUNCTION
 ***********************/
async function searchHeritage() {
  const query = cityInput.value.trim();
  if (!query) {
    alert("Enter a city or heritage place");
    return;
  }

  heritageList.innerHTML = '<li>Searching...</li>';

  try {
    const location = await getLocationCoordinates(query);
    const places = await fetchPlaces(location.lat, location.lon);
    displayPlaces(places, location.name);
  } catch (err) {
    heritageList.innerHTML = `<li>Error: ${err.message}</li>`;
  }
}
