// --- 1. INITIALIZE DATA & GUARDRAIL ---
let currentMovieTitle = localStorage.getItem('cinepass_current_movie_title');

// If they skipped the details page, send them back!
if (!currentMovieTitle || currentMovieTitle === 'Unknown Movie') {
    window.location.href = 'index.html'; 
}

const selectedSeatsKey = `cinePass_selected_seats_${encodeURIComponent(currentMovieTitle)}`;
const occupiedMapKey = `cinePass_occupied_map_${encodeURIComponent(currentMovieTitle)}`;

let selectedSeatsData = JSON.parse(localStorage.getItem(selectedSeatsKey)) || [];
let occupiedSeatsMap = JSON.parse(localStorage.getItem(occupiedMapKey));

const seatContainer = document.getElementById('seat-container');
const priceDisplay = document.getElementById('total-price');
const seatsListDisplay = document.getElementById('selected-seats-list');
const themeToggle = document.getElementById('themeToggle');

const savedTheme = localStorage.getItem('cinePass_theme') || 'dark-theme';
document.body.className = savedTheme;
if(themeToggle) themeToggle.checked = (savedTheme === 'dark-theme');

const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const cols = 14;

// --- FORCE HEADER SYNC ON LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    const pageHeading = document.querySelector('h1.display-3') || document.getElementById('booking-movie-title');
    if (pageHeading) {
        pageHeading.innerText = currentMovieTitle.toUpperCase();
    }
});

// --- 2. THEME SWITCHER LOGIC ---
if(themeToggle) {
    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'dark-theme' : 'light-theme';
        document.body.className = newTheme;
        localStorage.setItem('cinePass_theme', newTheme);
    });
}

// --- 3. GENERATE SEPARATED OCCUPIED SEATS ---
if (!occupiedSeatsMap) {
    occupiedSeatsMap = {};
    rows.forEach(row => {
        for (let i = 1; i <= cols; i++) {
            occupiedSeatsMap[`${row}${i}`] = Math.random() < 0.15;
        }
    });
    localStorage.setItem(occupiedMapKey, JSON.stringify(occupiedSeatsMap));
}

// --- 4. BUILD THEATER LAYOUT ---
if(seatContainer) {
    rows.forEach((rowLetter) => {
        const isReclinerRow = (rowLetter === 'K' || rowLetter === 'L');
        const rowDiv = document.createElement('div');
        rowDiv.className = `seat-row ${isReclinerRow ? 'recliner-section' : ''}`;
        
        const label = document.createElement('div');
        label.className = 'row-label';
        label.innerText = rowLetter;
        rowDiv.appendChild(label);

        for (let i = 1; i <= cols; i++) {
            if (i === 4 || i === 12) {
                const aisle = document.createElement('div');
                aisle.className = 'aisle';
                rowDiv.appendChild(aisle);
            }

            const seatId = `${rowLetter}${i}`;
            const price = isReclinerRow ? 25 : 15;
            
            const isOccupied = occupiedSeatsMap[seatId];
            const isSelected = selectedSeatsData.some(s => s.id === seatId);

            const seat = document.createElement('div');
            seat.className = `seat ${isOccupied ? 'occupied' : 'available'} ${isReclinerRow ? 'vip-border' : ''} ${isSelected ? 'selected' : ''}`;
            seat.innerText = i;
            
            if (!isOccupied) {
                seat.addEventListener('click', () => {
                    seat.classList.toggle('selected');
                    
                    if (seat.classList.contains('selected')) {
                        selectedSeatsData.push({ id: seatId, price: price });
                    } else {
                        selectedSeatsData = selectedSeatsData.filter(s => s.id !== seatId);
                    }
                    
                    localStorage.setItem(selectedSeatsKey, JSON.stringify(selectedSeatsData));
                    updateBookingBar();
                });
            }
            rowDiv.appendChild(seat);
        }
        seatContainer.appendChild(rowDiv);
    });
}

updateBookingBar();

// --- 5. UPDATE UI ACTIONS ---
function updateBookingBar() {
    const total = selectedSeatsData.reduce((sum, s) => sum + s.price, 0);
    if (priceDisplay) priceDisplay.innerText = total.toFixed(2);

    const names = selectedSeatsData.map(s => s.id);
    if (seatsListDisplay) {
        if (names.length > 0) {
            seatsListDisplay.innerText = names.join(', ');
            seatsListDisplay.style.opacity = "1";
        } else {
            seatsListDisplay.innerText = 'None';
            seatsListDisplay.style.opacity = "0.5";
        }
    }
}

// --- 6. BOOKING & MODAL INTERPRETATION ---
const bookingModalEl = document.getElementById('bookingModal');
const bookingModal = bookingModalEl ? new bootstrap.Modal(bookingModalEl) : null;
const btnPay = document.querySelector('.btn-pay');
const btnConfirm = document.getElementById('confirm-purchase-btn');

if (btnPay && bookingModal) {
    btnPay.addEventListener('click', () => {
        if (selectedSeatsData.length === 0) {
            btnPay.classList.add('btn-danger');
            setTimeout(() => btnPay.classList.remove('btn-danger'), 500);
            return;
        }

        document.getElementById('modal-seats').innerText = selectedSeatsData.map(s => s.id).join(', ');
        document.getElementById('modal-total').innerText = priceDisplay ? priceDisplay.innerText : '0.00';
        
        bookingModal.show();
    });
}

// --- 7. COMMITTING CLEAN DATA PLUGS ---
function confirmPurchase() {
    const moviePoster = localStorage.getItem('cinepass_current_movie_poster') || '';
    const chosenDate = localStorage.getItem('cinepass_current_date') || 'No Date';
    const chosenTime = localStorage.getItem('cinepass_current_time') || 'No Time';
    const chosenVenue = localStorage.getItem('cinepass_current_venue') || 'No Venue';
    
    const totalPrice = priceDisplay ? priceDisplay.innerText : '0.00';
    const selectedSeats = selectedSeatsData.map(s => s.id);
    
    const newBooking = {
        id: "CP-" + Math.floor(100000 + Math.random() * 900000), 
        movieTitle: currentMovieTitle,
        poster: moviePoster,
        date: chosenDate,
        time: chosenTime, 
        venue: chosenVenue,
        seats: selectedSeats,
        totalPrice: parseFloat(totalPrice)
    };

    let bookings = JSON.parse(localStorage.getItem('cinepass_active_bookings')) || [];
    bookings.push(newBooking);
    localStorage.setItem('cinepass_active_bookings', JSON.stringify(bookings));
    
    selectedSeats.forEach(seatId => {
        occupiedSeatsMap[seatId] = true;
    });
    localStorage.setItem(occupiedMapKey, JSON.stringify(occupiedSeatsMap));
    localStorage.removeItem(selectedSeatsKey);
    
    const modalBody = document.querySelector('.modal-body');
    if (modalBody) {
        modalBody.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-check-circle-fill text-success fs-1" style="color: #0dcaf0 !important;"></i>
                <h3 class="mt-3 text-white">Enjoy the Movie!</h3>
                <p class="opacity-75 text-white-50">Booking Reference: <strong>${newBooking.id}</strong></p>
                <p class="opacity-75 text-white-50">Seats locked. Prepare for immersion.</p>
                <a href="profile.html" class="btn btn-outline-info btn-sm mt-3 px-4">View My Bookings</a>
            </div>
        `;
    }
    
    const modalFooter = document.querySelector('.modal-footer');
    if (modalFooter) modalFooter.style.display = 'none';
    
    // Clean up temporary variables so they don't linger in the browser!
    localStorage.removeItem('cinepass_current_movie_title');
    localStorage.removeItem('cinepass_current_movie_poster');
    localStorage.removeItem('cinepass_current_date');
    localStorage.removeItem('cinepass_current_time');
    localStorage.removeItem('cinepass_current_venue');

    setTimeout(() => {
        window.location.href = 'profile.html'; 
    }, 2000);
}

if (btnConfirm) {
    btnConfirm.addEventListener('click', confirmPurchase);
}