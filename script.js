const API_URL = 'http://localhost:3000/movies';

const movieListDiv = document.getElementById('movie-list');
const searchInput = document.getElementById('search-input');
const form = document.getElementById('add-movie-form');

let allMovies = []; // Full movie list (for searching/filtering)

// ------------------------------
// Render Movies
// ------------------------------
function renderMovies(movies) {
    movieListDiv.innerHTML = '';

    if (movies.length === 0) {
        movieListDiv.innerHTML = '<p>No movies found matching your criteria.</p>';
        return;
    }

    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie-item');

        movieElement.innerHTML = `
            <p><strong>${movie.title}</strong> (${movie.year}) - ${movie.genre}</p>
            <button class="edit-btn" data-id="${movie.id}"
                data-title="${movie.title}"
                data-year="${movie.year}"
                data-genre="${movie.genre}">
                Edit
            </button>
            <button class="delete-btn" data-id="${movie.id}">Delete</button>
        `;

        movieListDiv.appendChild(movieElement);
    });
}

// ------------------------------
// Fetch Movies (GET)
// ------------------------------
function fetchMovies() {
    fetch(API_URL)
        .then(res => res.json())
        .then(movies => {
            allMovies = movies;
            renderMovies(allMovies);
        })
        .catch(err => console.error('Error fetching movies:', err));
}

fetchMovies(); // Initial load

// ------------------------------
// Search Functionality
// ------------------------------
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredMovies = allMovies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm) ||
        movie.genre.toLowerCase().includes(searchTerm)
    );

    renderMovies(filteredMovies);
});

// ------------------------------
// Create New Movie (POST)
// ------------------------------
form.addEventListener('submit', function (event) {
    event.preventDefault();

    const newMovie = {
        title: document.getElementById('title').value,
        genre: document.getElementById('genre').value,
        year: parseInt(document.getElementById('year').value)
    };

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMovie)
    })
        .then(res => {
            if (!res.ok) throw new Error('Failed to add movie');
            return res.json();
        })
        .then(() => {
            form.reset();
            fetchMovies();
        })
        .catch(err => console.error('Error adding movie:', err));
});

// ------------------------------
// Edit Movie Prompt
// ------------------------------
function editMoviePrompt(id, currentTitle, currentYear, currentGenre) {
    const newTitle = prompt('Enter new Title:', currentTitle);
    const newYearStr = prompt('Enter new Year:', currentYear);
    const newGenre = prompt('Enter new Genre:', currentGenre);

    if (newTitle && newYearStr && newGenre) {
        const updatedMovie = {
            id,
            title: newTitle,
            year: parseInt(newYearStr),
            genre: newGenre
        };

        updateMovie(id, updatedMovie);
    }
}

// ------------------------------
// Update Movie (PUT)
// ------------------------------
function updateMovie(id, data) {
    fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(res => {
            if (!res.ok) throw new Error('Failed to update movie');
            return res.json();
        })
        .then(() => fetchMovies())
        .catch(err => console.error('Error updating movie:', err));
}

// ------------------------------
// Delete Movie (DELETE)
// ------------------------------
function deleteMovie(id) {
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
        .then(res => {
            if (!res.ok) throw new Error('Failed to delete movie');
            fetchMovies();
        })
        .catch(err => console.error('Error deleting movie:', err));
}

// ------------------------------
// Event Delegation for Edit/Delete Buttons
// ------------------------------
movieListDiv.addEventListener('click', event => {
    const target = event.target;

    if (target.classList.contains('edit-btn')) {
        editMoviePrompt(
            target.dataset.id,
            target.dataset.title,
            target.dataset.year,
            target.dataset.genre
        );
    }

    if (target.classList.contains('delete-btn')) {
        deleteMovie(target.dataset.id);
    }
});