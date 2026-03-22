document.addEventListener("DOMContentLoaded", async function () {
  // Navbar scroll background
  const nav = document.querySelector(".navbar");
  if (nav) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 50) {
        nav.style.background = "#05080a";
      } else {
        nav.style.background =
          "linear-gradient(to bottom, rgba(15, 23, 30, 0.9), rgba(15, 23, 30, 0))";
      }
    });
  }

  // Dynamic movie details
  const params = new URLSearchParams(window.location.search);
  let movieId = params.get("id");

  // Fallback to Inception if accessed without an ID (e.g., from the navbar or old links)
  if (!movieId && !window.location.search.includes("id=")) {
      movieId = "27205"; 
  }

  if (movieId) {
    const movie = await fetchMovieDetails(movieId);

    if (movie) {
      const titleEl = document.getElementById("movie-title");
      const overviewEl = document.getElementById("movie-overview");
      const metaEl = document.getElementById("movie-meta");
      const heroEl = document.getElementById("movie-hero");

      if (titleEl) {
        titleEl.textContent = movie.title;
      }

      if (overviewEl) {
        overviewEl.textContent = movie.overview || "No overview available.";
      }

      if (metaEl) {
        const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
        const runtime = movie.runtime ? `${movie.runtime} min` : "N/A";
        const genres =
          movie.genres && movie.genres.length
            ? movie.genres.map(g => g.name).join(" / ")
            : "N/A";

        metaEl.innerHTML = `
          <span class="me-3">⭐ ${movie.vote_average.toFixed(1)} IMDb</span>
          <span class="me-3">${runtime}</span>
          <span class="me-3">${genres}</span>
          <span>${year}</span>
        `;
      }

      if (heroEl && movie.backdrop_path) {
        heroEl.style.backgroundImage = `
          linear-gradient(to right, rgba(5,8,10,0.92), rgba(5,8,10,0.55)),
          url(${CONFIG.BACKDROP_URL}${movie.backdrop_path})
        `;
        heroEl.style.backgroundSize = "cover";
        heroEl.style.backgroundPosition = "center";
      }

      // Wishlist logic
      const wishlistBtn = document.getElementById("wishlistBtn");
      if (wishlistBtn) {
        const wishlist = Storage.getWishlist();
        const isAdded = wishlist.some(m => String(m.id) === String(movie.id));
        
        if (isAdded) {
          wishlistBtn.innerHTML = '<i class="bi bi-heart-fill me-2"></i> Added to Wishlist';
          wishlistBtn.classList.replace("btn-outline-info", "btn-info");
        }

        wishlistBtn.addEventListener("click", () => {
          const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
          const genres = movie.genres && movie.genres.length ? movie.genres.map(g => g.name).join(", ") : "N/A";
          const poster = movie.poster_path ? `${CONFIG.IMAGE_URL}${movie.poster_path}` : "https://via.placeholder.com/300x450?text=No+Image";

          Storage.saveToWishlist({
            id: String(movie.id),
            title: movie.title,
            poster: poster,
            genre: genres,
            year: year
          });

          wishlistBtn.innerHTML = '<i class="bi bi-heart-fill me-2"></i> Added to Wishlist';
          wishlistBtn.classList.replace("btn-outline-info", "btn-info");
        });
      }
    }
  }

  // Book now button smooth scroll
  const scrollToBooking = () => {
    const bookingSection = document.getElementById("booking-section");
    const navbar = document.querySelector(".navbar");

    if (bookingSection) {
      const navbarHeight = navbar ? navbar.offsetHeight : 70;
      const targetPosition =
        bookingSection.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });
    }
  };

  const bookNowBtn = document.getElementById("bookNowBtn");
  if (bookNowBtn) {
    bookNowBtn.addEventListener("click", function (e) {
      e.preventDefault();
      scrollToBooking();
    });
  }

  // Date items selection
  const dateItems = document.querySelectorAll(".date-item");
  dateItems.forEach(item => {
    item.addEventListener("click", () => {
      dateItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
    });
  });
});