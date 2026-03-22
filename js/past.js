document.addEventListener('DOMContentLoaded', () => {
    const pastContainer = document.getElementById('past-movies');
    if (!pastContainer) return;

    const pastMovies = [
        { id: 'titanic', title: 'Titanic', year: '1997', poster: 'https://upload.wikimedia.org/wikipedia/en/1/18/Titanic_%281997_film%29_poster.png' },
        { id: 'jurassic-park', title: 'Jurassic Park', year: '1993', poster: 'https://upload.wikimedia.org/wikipedia/en/e/e7/Jurassic_Park_poster.jpg' },
        { id: 'matrix', title: 'The Matrix', year: '1999', poster: 'https://upload.wikimedia.org/wikipedia/en/c/c1/The_Matrix_Poster.jpg' }
    ];

    pastContainer.innerHTML = `
        <h4 class="section-title fw-bold mb-4">Classic & Past Movies</h4>
        <div class="movie-row mb-5">
            ${pastMovies.map(movie => `
                <div class="movie-card text-center">
                    <img src="${movie.poster}" class="img-fluid rounded shadow" style="height: 350px; width: 100%; object-fit: cover;">
                    <p class="mt-2 mb-1 small fw-bold">${movie.title}</p>
                    <a href="details.html" class="btn btn-outline-light btn-sm w-100 mt-2"><i class="bi bi-play-circle me-1"></i> Watch Trailer</a>
                </div>
            `).join('')}
        </div>
    `;
});
