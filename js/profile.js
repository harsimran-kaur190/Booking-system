document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    renderActiveBookings();
    renderTopWishlistItems();
    setupProfileEditModal();
});

function loadUserProfile() {
    // Adding fallback empty array/object in case storage is empty during testing
    const user = Storage.getUserProfile() || { 
        name: "Guest User", avatar: "https://ui-avatars.com/api/?name=Guest+User&background=0D8ABC&color=fff&size=150", 
        email: "Not Set", phone: "Not Set", joinDate: "Today" 
    };
    
    document.getElementById('user-avatar').src = user.avatar;
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-phone').textContent = user.phone;
    document.getElementById('user-join-date').textContent = user.joinDate;
    
    const totalBookings = (Storage.getActiveBookings() || []).length;
    const totalWishlist = (Storage.getWishlist() || []).length;
    
    document.getElementById('stat-bookings').textContent = totalBookings;
    document.getElementById('stat-wishlist').textContent = totalWishlist;
}

function setupProfileEditModal() {
    const saveBtn = document.getElementById('save-profile-btn');
    const form = document.getElementById('edit-profile-form');
    const user = Storage.getUserProfile() || {};
    
    // Inputs
    const nameInput = document.getElementById('edit-name');
    const emailInput = document.getElementById('edit-email');
    const phoneInput = document.getElementById('edit-phone');

    // Populate form with existing data
    nameInput.value = user.name || '';
    emailInput.value = user.email || '';
    phoneInput.value = user.phone || '';

    // Regex Patterns for Validation
    const nameRegex = /^[a-zA-Z\s]{2,50}$/; // Letters and spaces only, 2-50 chars
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard email format
    const phoneRegex = /^\+?[\d\s-]{10}$/; // Numbers, optional +, spaces or hyphens

    // Clear validation styling when the user starts typing
    [nameInput, emailInput, phoneInput].forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('is-invalid');
        });
    });
    
    saveBtn.addEventListener('click', () => {
        let isValid = true;
        const nameVal = nameInput.value.trim();
        const emailVal = emailInput.value.trim();
        const phoneVal = phoneInput.value.trim();

        // 1. Validate Name
        if (!nameRegex.test(nameVal)) {
            nameInput.classList.add('is-invalid');
            isValid = false;
        }

        // 2. Validate Email
        if (!emailRegex.test(emailVal)) {
            emailInput.classList.add('is-invalid');
            isValid = false;
        }

        // 3. Validate Phone
        if (!phoneRegex.test(phoneVal)) {
            phoneInput.classList.add('is-invalid');
            isValid = false;
        }

        // If any validation failed, stop here
        if (!isValid) return; 

        // If everything is valid, save to storage
        const updatedProfile = {
            name: nameVal,
            email: emailVal,
            phone: phoneVal,
            joinDate: user.joinDate || new Date().toLocaleDateString(),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nameVal)}&background=0D8ABC&color=fff&size=150`
        };
        
        Storage.saveUserProfile(updatedProfile);
        
        // Hide modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
        modal.hide();
        
        // Reload UI
        loadUserProfile();
    });
}

function renderActiveBookings() {
    const container = document.getElementById('active-bookings-container');
    if (!container) return;

    const bookings = Storage.getActiveBookings() || [];

    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-ticket-detailed fs-1 text-secondary mb-3"></i>
                <h5 class="fw-bold text-white mb-1">No upcoming shows</h5>
                <p class="small text-secondary">Ready for a movie? Browse the latest releases!</p>
                <a href="index.html" class="btn btn-outline-info mt-2 rounded-pill px-4">Browse Movies</a>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="row g-4">
                ${bookings.map(booking => `
                    <div class="col-md-6">
                        <div class="booking-card d-flex flex-column" data-booking-id="${booking.id}">
                            <div class="position-relative">
                                <!-- Minimal Change: Replaced strict booking.poster with safety check filtering out broken placeholders -->
                                <img src="${booking.poster && !booking.poster.includes('placeholder') ? booking.poster : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500&auto=format&fit=crop'}" alt="${booking.movieTitle}" 
                                     style="height: 180px; width: 100%; object-fit: cover;">
                                <div class="position-absolute top-0 end-0 m-2">
                                    <span class="badge bg-info text-dark shadow">
                                        <i class="bi bi-chair me-1"></i> ${booking.seats.length} Seats
                                    </span>
                                </div>
                            </div>
                            <div class="p-3 d-flex flex-column flex-grow-1">
                                <h6 class="fw-bold mb-2 fs-5">${booking.movieTitle}</h6>
                                <div class="small text-secondary mb-3">
                                    <div class="mb-1"><i class="bi bi-calendar-event me-2 text-info"></i>${booking.date} at ${booking.time}</div>
                                    <div><i class="bi bi-geo-alt me-2 text-info"></i>${booking.venue}</div>
                                </div>
                                <div class="mt-auto">
                                    <hr class="border-secondary opacity-50 my-2">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <span class="small text-secondary text-truncate me-2" style="max-width: 150px;">Seats: ${booking.seats.join(', ')}</span>
                                        <span class="text-info fw-bold">$${booking.totalPrice.toFixed(2)}</span>
                                    </div>
                                    <button class="btn btn-info btn-sm w-100 fw-bold view-details-btn" data-booking-id="${booking.id}">
                                        View Ticket
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                showBookingDetails(parseInt(e.currentTarget.getAttribute('data-booking-id')));
            });
        });
    }
    
    // Trigger fade in animation AFTER content is loaded
    setTimeout(() => { container.style.opacity = '1'; }, 50);
}

function renderTopWishlistItems() {
    const container = document.getElementById('top-wishlist-container');
    if (!container) return;

    const topItems = Storage.getTopWishlistItems(3) || [];

    if (topItems.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-heart fs-1 text-secondary mb-3"></i>
                <h5 class="fw-bold text-white mb-1">Your wishlist is empty</h5>
                <p class="small text-secondary">Save movies to track their showtimes.</p>
                <a href="index.html" class="btn btn-outline-info mt-2 rounded-pill px-4">Find Movies</a>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="row g-4">
                ${topItems.map((movie, index) => `
                    <div class="col-md-6 col-lg-4">
                        <div class="wishlist-card d-flex flex-column">
                            <div class="position-relative">
                                <img src="${movie.poster}" alt="${movie.title}" 
                                     style="height: 220px; width: 100%; object-fit: cover;">
                            </div>
                            <div class="p-3 d-flex flex-column flex-grow-1">
                                <h6 class="fw-bold mb-1 text-truncate">${movie.title}</h6>
                                <div class="small text-secondary mb-3">${movie.genre || 'Movie'} • ${movie.year || ''}</div>
                                <div class="mt-auto d-grid gap-2">
                                    <a href="details.html?id=${movie.id}" class="btn btn-outline-info btn-sm fw-bold">
                                        Book Now
                                    </a>
                                    <button class="btn btn-link text-danger text-decoration-none btn-sm p-0 remove-wishlist-btn" data-id="${movie.id}">
                                        <i class="bi bi-trash me-1"></i> Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.querySelectorAll('.remove-wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Storage.removeFromWishlist(e.currentTarget.getAttribute('data-id'));
                renderTopWishlistItems();
                loadUserProfile(); // Update the count in the sidebar
            });
        });
    }
    
    // Trigger fade in animation
    setTimeout(() => { container.style.opacity = '1'; }, 50);
}

function showBookingDetails(bookingId) {
    const bookings = Storage.getActiveBookings() || [];
    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) return;

    document.getElementById('booking-details-content').innerHTML = `
        <div class="row g-4">
            <div class="col-md-5">
                <!-- Minimal Change: Filter out placeholder images in details modal view as well -->
                <img src="${booking.poster && !booking.poster.includes('placeholder') ? booking.poster : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500&auto=format&fit=crop'}" class="img-fluid rounded shadow" alt="${booking.movieTitle}" style="width: 100%; object-fit: cover;">
            </div>
            <div class="col-md-7">
                <h4 class="fw-bold text-info mb-4">${booking.movieTitle}</h4>
                
                <div class="d-flex align-items-center mb-3">
                    <div class="bg-dark rounded p-2 border border-secondary text-center me-3" style="min-width: 60px;">
                        <div class="small text-info text-uppercase fw-bold">${new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                        <div class="fs-4 fw-bold">${new Date(booking.date).getDate()}</div>
                    </div>
                    <div>
                        <div class="fw-bold">${booking.time}</div>
                        <div class="text-secondary small">${booking.venue}</div>
                    </div>
                </div>

                <div class="p-3 bg-dark rounded border border-secondary mb-3">
                    <div class="row text-center">
                        <div class="col-6 border-end border-secondary">
                            <div class="small text-secondary mb-1">TICKETS</div>
                            <div class="fw-bold">${booking.seats.length}</div>
                        </div>
                        <div class="col-6">
                            <div class="small text-secondary mb-1">SEATS</div>
                            <div class="fw-bold text-info">${booking.seats.join(', ')}</div>
                        </div>
                    </div>
                </div>
                
                <div class="d-flex justify-content-between align-items-center border-top border-secondary pt-3 mt-4">
                    <span class="text-secondary">Total Paid</span>
                    <span class="fs-4 fw-bold text-info">$${booking.totalPrice.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;

    document.getElementById('cancel-booking-btn').onclick = () => {
        if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            Storage.removeBooking(bookingId);
            bootstrap.Modal.getInstance(document.getElementById('bookingDetailsModal')).hide();
            renderActiveBookings();
            loadUserProfile(); // Update the count in the sidebar
        }
    };

    new bootstrap.Modal(document.getElementById('bookingDetailsModal')).show();
}