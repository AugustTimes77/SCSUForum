

async function fetchBooks() {
    try {
        const response = await fetch('api/books', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const books = await response.json();

        const contentDiv = document.querySelector('forum-section');
        contentDiv.innerHTML = '<h2>Books</h2><ul>';

        books.forEach(book => {
            contentDiv.innerHTML += `<li>${JSON.stringify(book)}</li>`;
        });
        contentDiv.innerHTML += '</ul>';

    } catch(error){
        console.error("ERROR");
    }
}

// Add event listener when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const displayButton = document.getElementById('displaydata');
    if (displayButton) {
        displayButton.addEventListener('click', fetchBooks);
    }
});