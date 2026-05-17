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
async function fetchActionMovies() {
  return await getData(`/discover/movie?with_genres=28&language=${CONFIG.LANGUAGE}`);
}
async function fetchMovieExtras(movieId) {
  // Use your built-in helper function to seamlessly inject the API_KEY and language!
  return await getData(`/movie/${movieId}?append_to_response=videos,credits&language=${CONFIG.LANGUAGE}`);
}
async function searchMovies(query) {
    // We pass the search endpoint relative to your BASE_URL, 
    // and let your existing getData function handle the API_KEY for us!
    return await getData(`/search/movie?query=${encodeURIComponent(query)}&include_adult=false`);
}