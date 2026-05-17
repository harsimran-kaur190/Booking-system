document.addEventListener("DOMContentLoaded", async function () {
    const resultsGrid = document.getElementById("results-grid");
    const searchStatus = document.getElementById("search-status");

    // 1. Get query string from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');

    if (!query) {
        searchStatus.innerText = "No search term provided.";
        return;
    }

    // Update status text
    searchStatus.innerHTML = `Showing results for: <span class="text-info fw-bold">"${query}"</span>`;

    // 2. Fetch data using your searchMovies function from api.js
    // (Ensure your searchMovies function is defined in js/api.js as shown in the last step)
    const data = await searchMovies(query);

    console.log("API Search Response:", data);
    if (!data || !data.results || data.results.length === 0) {
        resultsGrid.innerHTML = `
            <div class="col-11 mt-4 text-center">
                <i class="bi bi-film text-secondary display-1"></i>
                <p class="text-secondary mt-3 fs-5">Oops! We couldn't find any movies matching "${query}".</p>
                <a href="index.html" class="btn btn-outline-info btn-sm mt-2 rounded-pill px-4">Back to Home</a>
            </div>
        `;
        return;
    }

    // 3. Render Movie Cards into the grid layout
    resultsGrid.innerHTML = ""; // Clear loader/previous data
    data.results.forEach(movie => {
        // Fallback for missing poster image paths
        const posterPath = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
            : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500&auto=format&fit=crop'; // fallback image

        const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'NR';


       // Inside js/search-results.js -> data.results.forEach(movie => { ... })

// 1. Add a safety check to make sure the movie actually has an ID
if (!movie.id) return;

// 2. Build your card markup safely
const cardHTML = `
    <div class="col">
        <div class="card h-100 bg-transparent border-0 movie-card position-relative shadow-sm">
            <!-- Ensure movie.id is cleanly inserted here without spaces -->
            <a href="details.html?id=${movie.id}" class="text-decoration-none text-white">
                <div class="position-relative overflow-hidden rounded mb-2" style="aspect-ratio: 2/3;">
                    <img src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500&auto=format&fit=crop'}" 
                         class="w-100 h-100 object-fit-cover transition-all rounded" 
                         alt="${movie.title}">
                    <span class="position-absolute top-0 start-0 m-2 badge bg-dark bg-opacity-75 text-warning border border-secondary small">
                        <i class="bi bi-star-fill me-1"></i>${movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}
                    </span>
                </div>
                <h6 class="fw-bold text-truncate mb-0 px-1">${movie.title}</h6>
                <span class="small text-secondary px-1">${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</span>
            </a>
        </div>
    </div>
`;
resultsGrid.insertAdjacentHTML('beforeend', cardHTML);
    });
});