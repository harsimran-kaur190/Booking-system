document.addEventListener('DOMContentLoaded', () => {
    const upcomingContainer = document.getElementById('upcoming-movies');
    if (!upcomingContainer) return;

    const upcomingMovies = [
        { id: 'avengers-secret-wars', title: 'Avengers: Secret Wars', year: '2027', poster: 'https://m.media-amazon.com/images/M/MV5BYzA4ZDQ4ZmItNDZhOS00M2EyLThhOTYtOTUwODAxNTBmOThlXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg' },
        { id: 'superman-legacy', title: 'Superman', year: '2025', poster: 'https://m.media-amazon.com/images/M/MV5BNWRmNmU4MmQtZDA0Mi00MThmLTk1NDQtOWYwNzZhMTlkYTFlXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg' },
        { id: 'beyond-spider-verse', title: 'Beyond the Spider-Verse', year: '2025', poster: 'https://images2.minutemediacdn.com/image/upload/c_fill,w_736,ar_3:4,f_auto,q_auto,g_auto/shape/cover/sport/spider-man-beyond-the-spider-verse-poster-11dc47ad8bc559f2042afdc304cae424.jpg' }
    ];

    upcomingContainer.innerHTML = `
        <h4 class="section-title fw-bold mb-4">Upcoming Movies</h4>
        <div class="movie-row mb-5">
            ${upcomingMovies.map(movie => `
                <div class="movie-card text-center">
                    <img src="${movie.poster}" class="img-fluid rounded shadow" style="height: 350px; width: 100%; object-fit: cover;">
                    <p class="mt-2 mb-1 small fw-bold">${movie.title}</p>
                    <a href="details.html#booking-section" class="btn btn-info btn-sm w-100 mt-2">🎟️ Pre-book Now</a>
                </div>
            `).join('')}
        </div>
    `;
});