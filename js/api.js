async function getData(endpoint) {
  try {
    const separator = endpoint.includes("?") ? "&" : "?";
    const url = `${CONFIG.BASE_URL}${endpoint}${separator}api_key=${CONFIG.API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
}

async function fetchPopularMovies() {
  return await getData(`/movie/popular?language=${CONFIG.LANGUAGE}`);
}
async function fetchUpcomingMovies() {
  return await getData(`/movie/upcoming?language=${CONFIG.LANGUAGE}`);
}
async function fetchMovieDetails(movieId) {
  return await getData(`/movie/${movieId}?language=${CONFIG.LANGUAGE}`);
}