const Storage = {
    getWishlist: function() {
        return JSON.parse(localStorage.getItem('cinepass_wishlist')) || [];
    },
    saveToWishlist: function(movie) {
        let wishlist = this.getWishlist();
        // Safe string comparison to prevent duplicates
        if(!wishlist.some(m => String(m.id) === String(movie.id))) {
            wishlist.push(movie);
            localStorage.setItem('cinepass_wishlist', JSON.stringify(wishlist));
        }
    },
    removeFromWishlist: function(movieId) {
        let wishlist = this.getWishlist();
        // Safe string comparison for deletion
        wishlist = wishlist.filter(m => String(m.id) !== String(movieId));
        localStorage.setItem('cinepass_wishlist', JSON.stringify(wishlist));
    },
    
    // Booking management functions
    getActiveBookings: function() {
        return JSON.parse(localStorage.getItem('cinepass_active_bookings')) || [];
    },
    saveBooking: function(bookingData) {
        let bookings = this.getActiveBookings();
        const booking = {
            // FIXED: Now uses your luxury 'CP-' format instead of a raw timestamp
            id: bookingData.id || "CP-" + Math.floor(100000 + Math.random() * 900000),
            movieTitle: bookingData.movieTitle,
            poster: bookingData.poster,
            date: bookingData.date || new Date().toLocaleDateString(),
            time: bookingData.time || 'TBA',
            venue: bookingData.venue || 'CinePass IMAX',
            seats: bookingData.seats || [],
            totalPrice: bookingData.totalPrice || 0,
            bookedAt: new Date().toLocaleString()
        };
        bookings.push(booking);
        localStorage.setItem('cinepass_active_bookings', JSON.stringify(bookings));
        return booking;
    },
    removeBooking: function(bookingId) {
        let bookings = this.getActiveBookings();
        // FIXED: Safe string comparison ensures CP- IDs are caught and deleted successfully
        bookings = bookings.filter(b => String(b.id) !== String(bookingId));
        localStorage.setItem('cinepass_active_bookings', JSON.stringify(bookings));
    },
    getTopWishlistItems: function(limit = 3) {
        return this.getWishlist().slice(0, limit);
    },

    // User profile functions
    getUserProfile: function() {
        return JSON.parse(localStorage.getItem('cinepass_user_profile')) || {
            name: 'Guest User',
            email: 'user@example.com',
            phone: '+1 (555) 000-0000',
            membership: 'Premium',
            joinDate: new Date().toLocaleDateString(),
            avatar: 'https://ui-avatars.com/api/?name=Guest+User&background=0D8ABC&color=fff&size=150'
        };
    },
    saveUserProfile: function(profileData) {
        const profile = {
            name: profileData.name || 'Guest User',
            email: profileData.email || 'user@example.com',
            phone: profileData.phone || '+1 (555) 000-0000',
            membership: profileData.membership || 'Premium',
            joinDate: profileData.joinDate || new Date().toLocaleDateString(),
            avatar: profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=0D8ABC&color=fff&size=150`
        };
        localStorage.setItem('cinepass_user_profile', JSON.stringify(profile));
        return profile;
    }
};