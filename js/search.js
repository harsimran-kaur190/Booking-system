document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", function (e) {
            e.preventDefault(); // Stop page reload
            
            const query = searchInput.value.trim();
            if (!query) return;

            // Redirect to the search results page with the query in the URL
            window.location.href = `search-results.html?query=${encodeURIComponent(query)}`;
        });
    }
});