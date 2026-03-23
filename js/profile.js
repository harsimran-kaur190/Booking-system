document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    renderActiveBookings();
    renderTopWishlistItems();
    setupProfileEditModal();
});

function loadUserProfile() {
    const user = Storage.getUserProfile();
    
    // Update user profile section
    document.getElementById('user-avatar').src = user.avatar;
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-phone').textContent = user.phone;
    document.getElementById('user-join-date').textContent = user.joinDate;
    
    // Get total bookings count
    const totalBookings = Storage.getActiveBookings().length;
    const totalWishlist = Storage.getWishlist().length;
    
    document.getElementById('stat-bookings').textContent = totalBookings;
    document.getElementById('stat-wishlist').textContent = totalWishlist;
}

function setupProfileEditModal() {
    const saveBtn = document.getElementById('save-profile-btn');
    const user = Storage.getUserProfile();
    
    // Populate form with current data
    document.getElementById('edit-name').value = user.name;
    document.getElementById('edit-email').value = user.email;
    document.getElementById('edit-phone').value = user.phone;
    
    saveBtn.addEventListener('click', () => {
        const updatedProfile = {
            name: document.getElementById('edit-name').value,
            email: document.getElementById('edit-email').value,
            phone: document.getElementById('edit-phone').value,
            joinDate: user.joinDate
        };
        
        Storage.saveUserProfile(updatedProfile);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
        modal.hide();
        
        // Reload profile
        loadUserProfile();
        
        // Show success message
        alert('Profile updated successfully!');
    });
}

function renderActiveBookings() {
    const container = document.getElementById('active-bookings-container');
    if (!container) return;

    const bookings = Storage.getActiveBookings();

    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-calendar3"></i>
                <p class="fw-bold">No active bookings yet</p>
                <p class="small">Your bookings will appear here</p>
                <a href="theatres.html" class="btn btn-info btn-sm mt-3">Browse Movies</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="row g-3">
            ${bookings.map(booking => `
                <div class="col-md-6">
                    <div class="booking-card" 
                         data-booking-id="${booking.id}" 
                         style="cursor: pointer;">
                        <div class="position-relative">
                            <img src="${booking.poster}" alt="${booking.movieTitle}" 
                                 style="height: 200px; width: 100%; object-fit: cover; border-radius: 12px 12px 0 0;">
                            <div class="position-absolute top-0 end-0 m-2">
                                <span class="badge bg-info text-dark">
                                    <i class="bi bi-chair me-1"></i> ${booking.seats.length} Seats
                                </span>
                            </div>
                        </div>
                        <div style="padding: 1.2rem;">
                            <h6 class="fw-bold mb-2" style="font-size: 1rem;">${booking.movieTitle}</h6>
                            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); line-height: 1.8;">
                                <div><i class="bi bi-calendar me-2" style="color: var(--accent-cyan);"></i>${booking.date}</div>
                                <div><i class="bi bi-clock me-2" style="color: var(--accent-cyan);"></i>${booking.time}</div>
                                <div><i class="bi bi-geo-alt me-2" style="color: var(--accent-cyan);"></i>${booking.venue}</div>
                            </div>
                            <hr style="opacity: 0.2; margin: 1rem 0;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">Seats: ${booking.seats.join(', ')}</span>
                                <span style="color: var(--accent-cyan); font-weight: 600;">$${booking.totalPrice.toFixed(2)}</span>
                            </div>
                            <button class="btn btn-info btn-sm w-100 mt-2 view-details-btn" 
                                    data-booking-id="${booking.id}">
                                <i class="bi bi-eye me-1"></i> Details
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Add view details event listeners
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const bookingId = parseInt(e.currentTarget.getAttribute('data-booking-id'));
            showBookingDetails(bookingId);
        });
    });
}

function renderTopWishlistItems() {
    const container = document.getElementById('top-wishlist-container');
    if (!container) return;

    const topItems = Storage.getTopWishlistItems(3);

    if (topItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-heart"></i>
                <p class="fw-bold">No saved items</p>
                <p class="small">Add movies to your wishlist</p>
                <a href="details.html" class="btn btn-info btn-sm mt-3">Find Movies</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="row g-3">
            ${topItems.map((movie, index) => `
                <div class="col-md-6">
                    <div class="wishlist-card">
                        <div class="position-relative">
                            <img src="${movie.poster}" alt="${movie.title}" 
                                 style="height: 200px; width: 100%; object-fit: cover; border-radius: 12px 12px 0 0;">
                            <div class="position-absolute top-0 start-0 m-2">
                                <span class="badge bg-info text-dark">
                                    #${index + 1}
                                </span>
                            </div>
                        </div>
                        <div style="padding: 1.2rem;">
                            <h6 class="fw-bold mb-2" style="font-size: 1rem;">${movie.title}</h6>
                            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-bottom: 1rem;">
                                ${movie.genre} • ${movie.year}
                            </div>
                            <div style="display: grid; gap: 0.5rem;">
                                <a href="details.html" class="btn btn-info btn-sm">
                                    <i class="bi bi-ticket-perforated me-1"></i> Book Now
                                </a>
                                <button class="btn btn-outline-danger btn-sm remove-wishlist-btn" 
                                        data-id="${movie.id}">
                                    <i class="bi bi-trash me-1"></i> Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Add remove wishlist event listeners
    document.querySelectorAll('.remove-wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const movieId = e.currentTarget.getAttribute('data-id');
            Storage.removeFromWishlist(movieId);
            renderTopWishlistItems();
        });
    });
}

function showBookingDetails(bookingId) {
    const bookings = Storage.getActiveBookings();
    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) return;

    const detailsContent = document.getElementById('booking-details-content');
    detailsContent.innerHTML = `
        <div class="row">
            <div class="col-md-5">
                <img src="${booking.poster}" class="img-fluid rounded" alt="${booking.movieTitle}">
            </div>
            <div class="col-md-7">
                <h5 class="fw-bold text-info mb-3">${booking.movieTitle}</h5>
                <div class="booking-info">
                    <div class="mb-3">
                        <span class="text-secondary small">DATE & TIME</span>
                        <p class="mb-0 fw-bold">${booking.date} at ${booking.time}</p>
                    </div>
                    <div class="mb-3">
                        <span class="text-secondary small">VENUE</span>
                        <p class="mb-0 fw-bold">${booking.venue}</p>
                    </div>
                    <div class="mb-3">
                        <span class="text-secondary small">SEATS</span>
                        <p class="mb-0 fw-bold">${booking.seats.join(', ')}</p>
                    </div>
                    <div class="mb-3">
                        <span class="text-secondary small">NUMBER OF SEATS</span>
                        <p class="mb-0 fw-bold">${booking.seats.length}</p>
                    </div>
                    <hr class="border-secondary">
                    <div class="d-flex justify-content-between">
                        <span class="fw-bold">TOTAL AMOUNT</span>
                        <span class="fw-bold text-info">$${booking.totalPrice.toFixed(2)}</span>
                    </div>
                    <hr class="border-secondary">
                    <div class="small text-secondary">
                        <span class="bi bi-info-circle me-2"></span>
                        Booked on: ${booking.bookedAt}
                    </div>
                </div>
            </div>
        </div>
    `;

    const cancelBtn = document.getElementById('cancel-booking-btn');
    cancelBtn.onclick = () => {
        if (confirm('Are you sure you want to cancel this booking?')) {
            Storage.removeBooking(bookingId);
            const modal = bootstrap.Modal.getInstance(document.getElementById('bookingDetailsModal'));
            modal.hide();
            renderActiveBookings();
        }
    };

    const modal = new bootstrap.Modal(document.getElementById('bookingDetailsModal'));
    modal.show();
}

// Simple logic to add a fade-in class
const container = document.getElementById('active-bookings-container');
container.style.opacity = '0';
// After content loads...
container.style.transition = 'opacity 0.5s ease-in';
container.style.opacity = '1';