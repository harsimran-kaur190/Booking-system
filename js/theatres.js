document.addEventListener("DOMContentLoaded", function () {

  // Initialize map
  const map = L.map("map").setView([30.7333, 76.7794], 13);

  // Map tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  // Theatre data
  const theatres = [
    { name: "PVR Elante", coords: [30.7050, 76.8013] },
    { name: "Cinepolis Bestech", coords: [30.7010, 76.7179] },
    { name: "Wave Cinemas", coords: [30.7046, 76.6950] }
  ];

  //  Add theatre markers
  theatres.forEach(theatre => {
    L.marker(theatre.coords)
      .addTo(map)
      .bindPopup(`<b>${theatre.name}</b><br>Book your show 🎬`);
  });

  // User location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // User marker
        L.marker([userLat, userLng])
          .addTo(map)
          .bindPopup("You are here 📍")
          .openPopup();

        // Center map to user
        map.setView([userLat, userLng], 13);
      },
      function (error) {
        console.log("Geolocation error:", error);
        alert("Please allow location access to see your position 📍");
      }
    );
  } else {
    alert("Geolocation not supported in this browser");
  }

});