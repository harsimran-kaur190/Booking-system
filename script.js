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
const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));

document.querySelector('.btn-pay').addEventListener('click', () => {
    if (selectedSeatsData.length === 0) {
        const btn = document.querySelector('.btn-pay');
        btn.classList.add('btn-danger');
        setTimeout(() => btn.classList.remove('btn-danger'), 500);
        return;
    }

    document.getElementById('modal-seats').innerText = selectedSeatsData.map(s => s.id).join(', ');
    document.getElementById('modal-total').innerText = document.getElementById('total-price').innerText;
    
    bookingModal.show();
});

function confirmPurchase() {
    // Get booking details from the page
    const movieTitle = document.querySelector('.movie-title')?.innerText || 'Movie';
    const totalPrice = document.getElementById('total-price').innerText;
    const selectedSeats = selectedSeatsData.map(s => s.id);
    
    // Get movie poster from details if available (fallback to generic)
    const moviePoster = localStorage.getItem('cinepass_current_movie_poster') || 'https://via.placeholder.com/300x450?text=CinePass';
    
    // Save the booking
    if (Storage && typeof Storage.saveBooking === 'function') {
        Storage.saveBooking({
            movieTitle: movieTitle,
            poster: moviePoster,
            date: new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
            time: '7:30 PM', // You can make this dynamic if needed
            venue: 'CinePass IMAX',
            seats: selectedSeats,
            totalPrice: parseFloat(totalPrice)
        });
    }
    
    // Clear only the "Selected" seats, keep the "Occupied Map" and "Theme"
    localStorage.removeItem('cinePass_selected_seats');
    
    const modalBody = document.querySelector('.modal-body');
    modalBody.innerHTML = `
        <div class="text-center py-4">
            <i class="bi bi-check-circle-fill text-info fs-1"></i>
            <h3 class="mt-3">Enjoy the Movie!</h3>
            <p class="opacity-75">Seats locked. Prepare for immersion.</p>
            <a href="profile.html" class="btn btn-info btn-sm mt-3">View My Bookings</a>
        </div>
    `;
    document.querySelector('.modal-footer').style.display = 'none';
    
    // Refresh to clear the UI after 3 seconds
    setTimeout(() => {
        location.reload(); 
    }, 3000);
} 

function saveBooking(movieTitle, time, venue, seats) {
    let bookings = JSON.parse(localStorage.getItem('myBookings')) || [];
    bookings.push({ movieTitle, time, venue, seats });
    localStorage.setItem('myBookings', JSON.stringify(bookings));
}

function confirmBooking() {
    const movieTitle = document.getElementById("movie-title").innerText;
    const time = "7:30 PM"; // Replace with your dynamic time selector
    const venue = "CinePass IMAX"; // Replace with your theatre selector
    const seats = "2"; // Replace with your seat count

    let bookings = JSON.parse(localStorage.getItem("myBookings")) || [];
    
    bookings.push({
        movieTitle: movieTitle,
        time: time,
        venue: venue,
        seats: seats
    });

    localStorage.setItem("myBookings", JSON.stringify(bookings));
    alert("Booking Confirmed! Check your Profile.");
}