function createMovieCard(movie) {
  const poster = movie.poster_path
    ? `${CONFIG.IMAGE_URL}${movie.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Image";

  return `
    <div class="movie-card text-center">
      <a href="details.html?id=${movie.id}" class="text-decoration-none text-white">
        <img src="${poster}" alt="${movie.title}" class="img-fluid rounded shadow" style="height: 350px; object-fit: cover;">
        <p class="mt-2 mb-0 small fw-bold">${movie.title}</p>
      </a>
    </div>
  `;
}

function renderMovies(containerId, movies) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = movies.map(movie => createMovieCard(movie)).join("");
}