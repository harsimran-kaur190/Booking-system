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

  if (!movieId && !window.location.search.includes("id=")) {
      movieId = "27205"; 
  }

  if (movieId) {
    const movie = await fetchMovieDetails(movieId);

    if (movie) {
      const dynamicPoster = movie.poster_path 
        ? `${CONFIG.IMAGE_URL}${movie.poster_path}` 
        : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500&auto=format&fit=crop";
      
      localStorage.setItem('cinepass_current_movie_title', movie.title);
      localStorage.setItem('cinepass_current_movie_poster', dynamicPoster);
      
      // Fallback defaults set instantly when movie loads
      if (!localStorage.getItem('cinepass_current_date')) {
         localStorage.setItem('cinepass_current_date', new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }));
      }
      if (!localStorage.getItem('cinepass_current_time')) {
         localStorage.setItem('cinepass_current_time', '7:30 PM');
      }
      if (!localStorage.getItem('cinepass_current_venue')) {
         localStorage.setItem('cinepass_current_venue', 'Grand Plaza Cinema');
      }

      const data = await fetchMovieExtras(movieId);
      const trailerEl = document.getElementById("movie-trailer");

      if (trailerEl && data.videos?.results) {
        const trailer = data.videos.results.find(
          v => v.type === "Trailer" && v.site === "YouTube"
        );

        if (trailer) {
          trailerEl.src = `https://www.youtube.com/embed/${trailer.key}`;
        }
      }

      const castContainer = document.getElementById("cast-container");

      if (castContainer && data.credits?.cast) {
        castContainer.innerHTML = data.credits.cast.slice(0, 8).map(actor => {
          // FIXED: Removed via.placeholder.com here
          const img = actor.profile_path
            ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
            : "https://placehold.co/100x150/111111/FFFFFF/png?text=No+Image";

          return `
            <div class="col-6 col-md-3 col-lg-2 text-center">
              <img src="${img}" class="rounded-circle mb-2"
                  style="width: 100px; height: 100px; object-fit: cover;">
              <p class="fw-bold mb-0 small">${actor.name}</p>
            </div>
          `;
        }).join("");
      }

      const titleEl = document.getElementById("movie-title");
      // --- NEW: Update the Booking Section Subtitle ---
      const dynamicBookingTitleEl = document.getElementById("dynamic-booking-title");
      if (dynamicBookingTitleEl) {
          dynamicBookingTitleEl.textContent = movie.title;
      }
      const overviewEl = document.getElementById("movie-overview");
      const metaEl = document.getElementById("movie-meta");
      const heroEl = document.getElementById("movie-hero");

      if (titleEl) titleEl.textContent = movie.title;
      if (overviewEl) overviewEl.textContent = movie.overview || "No overview available.";

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
          
          // FIXED: Removed via.placeholder.com here
          const poster = movie.poster_path 
            ? `${CONFIG.IMAGE_URL}${movie.poster_path}` 
            : "https://placehold.co/300x450/111111/FFFFFF/png?text=No+Image";

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

  // --- Dynamic Date Selection ---
  const dateContainer = document.getElementById("date-container");
  if (dateContainer) {
    dateContainer.addEventListener("click", (e) => {
      const item = e.target.closest(".date-item");
      if (!item) return;

      document.querySelectorAll(".date-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      const num = item.querySelector(".num")?.innerText || "";
      const month = item.querySelector(".month")?.innerText || "";
      const dayName = item.querySelector(".day-name")?.innerText || "";

      localStorage.setItem("cinepass_current_date", `${dayName}, ${month} ${num}`);
    });
  }

  // --- Dynamic Time & Venue Selection ---
  const timeGrids = document.querySelectorAll(".time-grid");
  timeGrids.forEach(grid => {
    grid.addEventListener("click", function (e) {
      const clickedBtn = e.target.closest("a");
      if (!clickedBtn) return;

      e.preventDefault();

      document.querySelectorAll(".time-grid a").forEach(btn => btn.classList.remove("active"));
      clickedBtn.classList.add("active");

      localStorage.setItem("cinepass_current_time", clickedBtn.innerText.trim());

      const venueGroup = clickedBtn.closest(".venue-group");
      const venueLabelElement = venueGroup ? venueGroup.querySelector(".venue-label") : null;
      
      if (venueLabelElement) {
         localStorage.setItem("cinepass_current_venue", venueLabelElement.innerText.trim());
      }

      window.location.href = clickedBtn.getAttribute("href");
    });
  });

  // --- THE FIX: Intercept the main "Proceed to Selection" CTA ---
  const mainProceedBtn = document.querySelector("#booking-section .btn-info.btn-lg");
  if (mainProceedBtn) {
    mainProceedBtn.addEventListener("click", function (e) {
      const activeDateItem = document.querySelector(".date-item.active");
      const activeTimeBtn = document.querySelector(".time-grid a.active");

      if (activeDateItem) {
        const num = activeDateItem.querySelector(".num")?.innerText || "";
        const month = activeDateItem.querySelector(".month")?.innerText || "";
        const dayName = activeDateItem.querySelector(".day-name")?.innerText || "";
        localStorage.setItem("cinepass_current_date", `${dayName}, ${month} ${num}`);
      }

      if (activeTimeBtn) {
        localStorage.setItem("cinepass_current_time", activeTimeBtn.innerText.trim());
        const venueGroup = activeTimeBtn.closest(".venue-group");
        const venueLabelElement = venueGroup ? venueGroup.querySelector(".venue-label") : null;
        if (venueLabelElement) {
          localStorage.setItem("cinepass_current_venue", venueLabelElement.innerText.trim());
        }
      }
    });
  }
});

// 1. Get the current movie ID
const urlParams = new URLSearchParams(window.location.search);
const simMovieId = urlParams.get('id') || '27205';

// 2. Fetch Similar Movies
async function getSimilarMovies(id) {
    try {
        const searchUrl = `${CONFIG.BASE_URL}/movie/${id}/similar?api_key=${CONFIG.API_KEY}&language=en-US&page=1`;
        
        const response = await fetch(searchUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        displaySimilarMovies(data.results.slice(0, 5)); 
        
    } catch (error) {
        console.error("Error fetching similar movies:", error);
        document.getElementById('similar-movies-grid').innerHTML = 
            '<p class="text-danger w-100 text-center mt-3">Failed to load recommendations.</p>';
    }
}

// 3. Inject the HTML into the page
// 3. Inject the HTML into the page
function displaySimilarMovies(movies) {
    const grid = document.getElementById('similar-movies-grid');
    grid.innerHTML = ''; 

    if (!movies || movies.length === 0) {
        grid.innerHTML = '<p class="text-secondary w-100 text-center mt-3">No similar movies found.</p>';
        return;
    }

    movies.forEach(movie => {
        const posterPath = movie.poster_path 
            ? `${CONFIG.IMAGE_URL}${movie.poster_path}` 
            : 'https://placehold.co/500x750/111111/FFFFFF/png?text=No+Image'; 
            
        // UPDATED: Matches the clean, borderless style from your screenshot
        const movieCard = `
            <div class="col">
                <a href="details.html?id=${movie.id}" class="text-decoration-none">
                    <div class="text-center" style="transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <img src="${posterPath}" class="img-fluid rounded shadow-sm mb-3" alt="${movie.title}" style="width: 100%; aspect-ratio: 2/3; object-fit: cover;">
                        <h6 class="text-white fw-bold text-truncate px-2" style="font-size: 0.95rem;">${movie.title}</h6>
                    </div>
                </a>
            </div>
        `;
        grid.innerHTML += movieCard;
    });
}

// 4. Run it
getSimilarMovies(simMovieId);