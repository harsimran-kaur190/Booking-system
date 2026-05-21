document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    renderActiveBookings();
    renderTopWishlistItems();
    setupProfileEditModal();
});

function loadUserProfile() {
    const user = Storage.getUserProfile() || { 
        name: "Guest User", avatar: "https://ui-avatars.com/api/?name=Guest+User&background=0D8ABC&color=fff&size=150", 
        email: "Not Set", phone: "Not Set", joinDate: "Today" 
    };
    
    document.getElementById('user-avatar').src = user.avatar;
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-phone').textContent = user.phone;
    document.getElementById('user-join-date').textContent = user.joinDate;
    
    // Read directly from your exact storage key for the top counter
    const rawBookings = JSON.parse(localStorage.getItem('cinepass_active_bookings')) || [];
    const totalBookings = rawBookings.length;
    const totalWishlist = (Storage.getWishlist() || []).length;
    
    const statBookingsEl = document.getElementById('stat-bookings');
    if (statBookingsEl) statBookingsEl.textContent = totalBookings;
    
    const statWishlistEl = document.getElementById('stat-wishlist');
    if (statWishlistEl) statWishlistEl.textContent = totalWishlist;
}

function setupProfileEditModal() {
    const saveBtn = document.getElementById('save-profile-btn');
    const form = document.getElementById('edit-profile-form');
    if (!saveBtn || !form) return;

    const user = Storage.getUserProfile() || {};
    
    const nameInput = document.getElementById('edit-name');
    const emailInput = document.getElementById('edit-email');
    const phoneInput = document.getElementById('edit-phone');

    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';

    const nameRegex = /^[a-zA-Z\s]{2,50}$/; 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    const phoneRegex = /^\+?[\d\s-]{10,15}$/;

    [nameInput, emailInput, phoneInput].forEach(input => {
        if(input) {
            input.addEventListener('input', () => {
                input.classList.remove('is-invalid');
            });
        }
    });
    
    saveBtn.addEventListener('click', () => {
        let isValid = true;
        const nameVal = nameInput.value.trim();
        const emailVal = emailInput.value.trim();
        const phoneVal = phoneInput.value.trim();

        if (!nameRegex.test(nameVal)) {
            nameInput.classList.add('is-invalid');
            isValid = false;
        }

        if (!emailRegex.test(emailVal)) {
            emailInput.classList.add('is-invalid');
            isValid = false;
        }

        if (!phoneRegex.test(phoneVal)) {
            phoneInput.classList.add('is-invalid');
            isValid = false;
        }

        if (!isValid) return; 

        const updatedProfile = {
            name: nameVal,
            email: emailVal,
            phone: phoneVal,
            joinDate: user.joinDate || new Date().toLocaleDateString(),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nameVal)}&background=0D8ABC&color=fff&size=150`
        };
        
        Storage.saveUserProfile(updatedProfile);
        
        const modalEl = document.getElementById('editProfileModal');
        if(modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if(modal) modal.hide();
        }
        
        loadUserProfile();
    });
}

function renderActiveBookings() {
    const container = document.getElementById('active-bookings-container');
    if (!container) return;

    const bookings = JSON.parse(localStorage.getItem('cinepass_active_bookings')) || [];

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
                        <div class="booking-card d-flex flex-column h-100" data-booking-id="${booking.id}">
                            <div class="position-relative">
                                <img src="${booking.poster && !booking.poster.includes('placeholder') ? booking.poster : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500&auto=format&fit=crop'}" alt="${booking.movieTitle}" 
                                     style="height: 200px; width: 100%; object-fit: cover; object-position: center top;">
                                <div class="position-absolute top-0 end-0 m-2">
                                    <span class="badge bg-info text-dark shadow">
                                        <i class="bi bi-chair me-1"></i> ${booking.seats ? booking.seats.length : 0} Seats
                                    </span>
                                </div>
                            </div>
                            <div class="p-3 d-flex flex-column flex-grow-1">
                                <h6 class="fw-bold mb-2 fs-5">${booking.movieTitle || 'Movie'}</h6>
                                <div class="small text-secondary mb-3">
                                    <div class="mb-1"><i class="bi bi-calendar-event me-2 text-info"></i>${booking.date} at ${booking.time}</div>
                                    <div><i class="bi bi-geo-alt me-2 text-info"></i>${booking.venue}</div>
                                </div>
                                <div class="mt-auto">
                                    <hr class="border-secondary opacity-50 my-2">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <span class="small text-secondary text-truncate me-2" style="max-width: 150px;">Seats: ${booking.seats ? booking.seats.join(', ') : ''}</span>
                                        <span class="text-info fw-bold">$${booking.totalPrice ? booking.totalPrice.toFixed(2) : '0.00'}</span>
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
                const bId = e.currentTarget.getAttribute('data-booking-id');
                showBookingDetails(bId);
            });
        });
    }
    
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
                        <div class="wishlist-card d-flex flex-column h-100">
                            <div class="position-relative">
                                <img src="${movie.poster}" alt="${movie.title}" 
                                     style="height: 240px; width: 100%; object-fit: cover; object-position: center top;">
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
                loadUserProfile(); 
            });
        });
    }
    
    setTimeout(() => { container.style.opacity = '1'; }, 50);
}

function showBookingDetails(bookingId) {
    const bookings = JSON.parse(localStorage.getItem('cinepass_active_bookings')) || [];
    const booking = bookings.find(b => String(b.id) === String(bookingId));

    if (!booking) return;

    const isDateValid = !isNaN(Date.parse(booking.date));
    const monthText = isDateValid ? new Date(booking.date).toLocaleDateString('en-US', { month: 'short' }) : 'SHOW';
    const dayText = isDateValid ? new Date(booking.date).getDate() : '•';

    const contentDiv = document.getElementById('booking-details-content');
    if(contentDiv) {
        contentDiv.innerHTML = `
            <div class="row g-4">
                <div class="col-md-5">
                    <img src="${booking.poster && !booking.poster.includes('placeholder') ? booking.poster : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500&auto=format&fit=crop'}" class="img-fluid rounded shadow" alt="${booking.movieTitle}" style="height: 300px; width: 100%; object-fit: cover; object-position: center top;">
                </div>
                <div class="col-md-7">
                    <h4 class="fw-bold text-info mb-4">${booking.movieTitle || 'Movie'}</h4>
                    
                    <div class="d-flex align-items-center mb-3">
                        <div class="bg-dark rounded p-2 border border-secondary text-center me-3" style="min-width: 60px;">
                            <div class="small text-info text-uppercase fw-bold">${monthText}</div>
                            <div class="fs-4 fw-bold">${dayText}</div>
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
                                <div class="fw-bold">${booking.seats ? booking.seats.length : 0}</div>
                            </div>
                            <div class="col-6">
                                <div class="small text-secondary mb-1">SEATS</div>
                                <div class="fw-bold text-info">${booking.seats ? booking.seats.join(', ') : ''}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center border-top border-secondary pt-3 mt-4">
                        <span class="text-secondary">Total Paid</span>
                        <span class="fs-4 fw-bold text-info">$${booking.totalPrice ? booking.totalPrice.toFixed(2) : '0.00'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    const cancelBtn = document.getElementById('cancel-booking-btn');
    if(cancelBtn) {
        cancelBtn.onclick = () => {
            if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
                const updatedBookings = bookings.filter(b => String(b.id) !== String(bookingId));
                localStorage.setItem('cinepass_active_bookings', JSON.stringify(updatedBookings));
                
                const modalEl = document.getElementById('bookingDetailsModal');
                if(modalEl) {
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if(modal) modal.hide();
                }
                renderActiveBookings();
                loadUserProfile(); 
            }
        };
    }

    const modalEl = document.getElementById('bookingDetailsModal');
    if(modalEl) {
        new bootstrap.Modal(modalEl).show();
    }
}