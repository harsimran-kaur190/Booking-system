const Storage = {
    getWishlist: function() {
        return JSON.parse(localStorage.getItem('cinepass_wishlist')) || [];
    },
    saveToWishlist: function(movie) {
        let wishlist = this.getWishlist();
        if(!wishlist.some(m => m.id === movie.id)) {
            wishlist.push(movie);
            localStorage.setItem('cinepass_wishlist', JSON.stringify(wishlist));
        }
    },
    removeFromWishlist: function(movieId) {
        let wishlist = this.getWishlist();
        wishlist = wishlist.filter(m => m.id !== movieId);
        localStorage.setItem('cinepass_wishlist', JSON.stringify(wishlist));
    }
};
