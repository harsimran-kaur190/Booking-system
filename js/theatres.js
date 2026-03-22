const map = L.map("map").setView([30.7333, 76.7794], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

L.marker([30.7050, 76.8013]).addTo(map).bindPopup("PVR Elante");
L.marker([30.7010, 76.7179]).addTo(map).bindPopup("Cinepolis Bestech");
L.marker([30.7046, 76.6950]).addTo(map).bindPopup("Wave Cinemas");


// Location access part

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function (position) {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;

    L.marker([userLat, userLng])
      .addTo(map)
      .bindPopup("You are here 📍")
      .openPopup();

    map.setView([userLat, userLng], 13);
  });
}