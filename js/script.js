const seatContainer = document.getElementById('seat-container');
const priceDisplay = document.getElementById('total-price');
const seatsListDisplay = document.getElementById('selected-seats-list');
const themeToggle = document.getElementById('themeToggle');

// --- 1. INITIALIZE DATA FROM LOCAL STORAGE ---

// Load previously selected seats
let selectedSeatsData = JSON.parse(localStorage.getItem('cinePass_selected_seats')) || [];

// Load or Create a permanent "Occupied Map" so seats don't change on refresh
let occupiedSeatsMap = JSON.parse(localStorage.getItem('cinePass_occupied_map'));

// Load and Apply Theme Preference
const savedTheme = localStorage.getItem('cinePass_theme') || 'dark-theme';
document.body.className = savedTheme;
themeToggle.checked = (savedTheme === 'dark-theme');

const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const cols = 14;

// --- 2. THEME SWITCHER LOGIC ---
themeToggle.addEventListener('change', () => {
    const newTheme = themeToggle.checked ? 'dark-theme' : 'light-theme';
    document.body.className = newTheme;
    localStorage.setItem('cinePass_theme', newTheme);
});

// --- 3. GENERATE OCCUPIED MAP (Run once per browser) ---
if (!occupiedSeatsMap) {
    occupiedSeatsMap = {};
    rows.forEach(row => {
        for (let i = 1; i <= cols; i++) {
            // 15% chance for a seat to be "Sold Out" permanently
            occupiedSeatsMap[`${row}${i}`] = Math.random() < 0.15;
        }
    });
    localStorage.setItem('cinePass_occupied_map', JSON.stringify(occupiedSeatsMap));
}

// --- 4. BUILD THEATER ---
rows.forEach((rowLetter) => {
    const isReclinerRow = (rowLetter === 'K' || rowLetter === 'L');
    const rowDiv = document.createElement('div');
    rowDiv.className = `seat-row ${isReclinerRow ? 'recliner-section' : ''}`;
    
    // Row Label
    const label = document.createElement('div');
    label.className = 'row-label';
    label.innerText = rowLetter;
    rowDiv.appendChild(label);

    for (let i = 1; i <= cols; i++) {
        // Handle Aisles
        if (i === 4 || i === 12) {
            const aisle = document.createElement('div');
            aisle.className = 'aisle';
            rowDiv.appendChild(aisle);
        }

        const seatId = `${rowLetter}${i}`;
        const price = isReclinerRow ? 25 : 15;
        
        // Use our Persistent Map instead of Math.random()
        const isOccupied = occupiedSeatsMap[seatId];
        // Check if user has this seat in their "cart"
        const isSelected = selectedSeatsData.some(s => s.id === seatId);

        const seat = document.createElement('div');
        seat.className = `seat ${isOccupied ? 'occupied' : 'available'} 
                          ${isReclinerRow ? 'vip-border' : ''} 
                          ${isSelected ? 'selected' : ''}`;
        seat.innerText = i;
        
        if (!isOccupied) {
            seat.addEventListener('click', () => {
                seat.classList.toggle('selected');
                
                if (seat.classList.contains('selected')) {
                    selectedSeatsData.push({ id: seatId, price: price });
                } else {
                    selectedSeatsData = selectedSeatsData.filter(s => s.id !== seatId);
                }
                
                // Save selection to storage
                localStorage.setItem('cinePass_selected_seats', JSON.stringify(selectedSeatsData));
                updateBookingBar();
            });
        }
        rowDiv.appendChild(seat);
    }
    seatContainer.appendChild(rowDiv);
});

// Sync the bottom bar on page load
updateBookingBar();

// --- 5. UPDATE UI FUNCTIONS ---
function updateBookingBar() {
    const total = selectedSeatsData.reduce((sum, s) => sum + s.price, 0);
    priceDisplay.innerText = total.toFixed(2);

    const names = selectedSeatsData.map(s => s.id);
    if (names.length > 0) {
        seatsListDisplay.innerText = names.join(', ');
        seatsListDisplay.style.opacity = "1";
    } else {
        seatsListDisplay.innerText = 'None';
        seatsListDisplay.style.opacity = "0.5";
    }
}

// --- 6. BOOKING & MODAL LOGIC ---
// ==========================================
// 6. BOOKING & MODAL LOGIC (Optimized)
// ==========================================
const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
const btnPay = document.querySelector('.btn-pay');
const btnConfirm = document.getElementById('confirm-purchase-btn'); // Ensure your modal's main button has this id

if (btnPay) {
    btnPay.addEventListener('click', () => {
        if (selectedSeatsData.length === 0) {
            btnPay.classList.add('btn-danger');
            setTimeout(() => btnPay.classList.remove('btn-danger'), 500);
            return;
        }

        document.getElementById('modal-seats').innerText = selectedSeatsData.map(s => s.id).join(', ');
        document.getElementById('modal-total').innerText = document.getElementById('total-price').innerText;
        
        bookingModal.show();
    });
}

// Single, clean function to handle confirmation
function confirmPurchase() {
    // 1. Extract context data dynamically from your layout
    const movieTitle = document.querySelector('.movie-title')?.innerText || 'Movie';
    const totalPrice = document.getElementById('total-price').innerText;
    const selectedSeats = selectedSeatsData.map(s => s.id);
    const moviePoster = localStorage.getItem('cinepass_current_movie_poster') || 'https://via.placeholder.com/300x450?text=CinePass';
    
    // 2. Build the structured ticket object
    const newBooking = {
        id: "CP-" + Math.floor(100000 + Math.random() * 900000), // Generates a unique Booking Reference Code
        movieTitle: movieTitle,
        poster: moviePoster,
        date: new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
        time: '7:30 PM', 
        venue: 'CinePass IMAX',
        seats: selectedSeats,
        totalPrice: parseFloat(totalPrice)
    };

    // 3. Save to unified local storage array for your profile dashboard
    let bookings = JSON.parse(localStorage.getItem('myBookings')) || [];
    bookings.push(newBooking);
    localStorage.setItem('myBookings', JSON.stringify(bookings));
    
    // 4. Update the occupied map permanently so these seats show as "Sold out" on refresh!
    selectedSeats.forEach(seatId => {
        occupiedSeatsMap[seatId] = true;
    });
    localStorage.setItem('cinePass_occupied_map', JSON.stringify(occupiedSeatsMap));

    // 5. Clear only the current selection active cart
    localStorage.removeItem('cinePass_selected_seats');
    
    // 6. Luxury visual confirmation inside modal
    const modalBody = document.querySelector('.modal-body');
    if (modalBody) {
        modalBody.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-check-circle-fill text-success fs-1" style="color: #b3a394 !important;"></i>
                <h3 class="mt-3 text-white">Enjoy the Movie!</h3>
                <p class="opacity-75 text-white-50">Booking Reference: <strong>${newBooking.id}</strong></p>
                <p class="opacity-75 text-white-50">Seats locked. Prepare for immersion.</p>
                <a href="profile.html" class="btn btn-outline-light btn-sm mt-3 px-4">View My Bookings</a>
            </div>
        `;
    }
    
    const modalFooter = document.querySelector('.modal-footer');
    if (modalFooter) modalFooter.style.display = 'none';
    
    // Smooth reload to clear layout grid tracking after 3.5 seconds
    setTimeout(() => {
        location.reload(); 
    }, 3500);
}

// Connect the function to your modal confirmation button event listener
if (btnConfirm) {
    btnConfirm.addEventListener('click', confirmPurchase);
}