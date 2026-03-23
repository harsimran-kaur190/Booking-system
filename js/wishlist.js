document.addEventListener('DOMContentLoaded', () => {
    const wishlistContainer = document.getElementById('wishlist-container');
    const loader = document.getElementById('loader');

    function renderWishlist() {
        if (!wishlistContainer) return;

        const wishlist = Storage.getWishlist();
        
        if (loader) loader.style.display = 'none';

        if (wishlist.length === 0) {
            wishlistContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-heart text-secondary" style="font-size: 4rem;"></i>
                    <h4 class="mt-3 text-secondary">Your wishlist is empty</h4>
                    <a href="details.html" class="btn btn-outline-info mt-3">Explore Movies</a>
                </div>
            `;
            return;
        }

        wishlistContainer.innerHTML = wishlist.map(movie => `
            <div class="col-sm-6 col-md-4 col-lg-3">
                <div class="card bg-transparent border-0 h-100 position-relative">
                    <img src="${movie.poster}" class="img-fluid rounded shadow" alt="${movie.title}" style="height: 350px; object-fit: cover;">
                    <button class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle remove-btn" data-id="${movie.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                    <div class="card-body px-0 text-center">
                        <h6 class="text-white mb-1 fw-bold">${movie.title}</h6>
                        <p class="text-secondary small mb-2">${movie.genre} • ${movie.year}</p>
                        <a href="details.html#booking-section" class="btn btn-info btn-sm w-100">🎟️ Book Now</a>
                    </div>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                Storage.removeFromWishlist(id);
                renderWishlist();
            });
        });
    }

    if (wishlistContainer) {
        setTimeout(renderWishlist, 400); // Simulate network load
    }
});


function addToWishlist(movie) {
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    
    // The object must have 'poster_path' for the profile to show the image
    const movieData = {
        title: movie.title,
        poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    };

    wishlist.push(movieData);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
}