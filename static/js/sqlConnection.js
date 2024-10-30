
async function fetchBooks() {
    try {
        const response = await fetch('/api/books', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const books = await response.json();
        
        // Fixed selector - added the period for class selection
        const contentDiv = document.querySelector('.forum-section');
        
        if (!contentDiv) {
            throw new Error('Could not find forum-section element');
        }

        // More structured display of the books
        contentDiv.innerHTML = '<h2>Books</h2><ul>';
        
        if (books.length === 0) {
            contentDiv.innerHTML += '<li>No books found</li>';
        } else {
            books.forEach(book => {
                // Format each book more cleanly instead of using JSON.stringify
                contentDiv.innerHTML += `
                    <li>
                        <strong>Title:</strong> ${book.title || 'N/A'} | 
                        <strong>Author:</strong> ${book.author || 'N/A'}
                    </li>`;
            });
        }
        
        contentDiv.innerHTML += '</ul>';

    } catch (error) {
        console.error('Error:', error.message);
        // Add visual error feedback
        const contentDiv = document.querySelector('.forum-section');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div style="color: red; padding: 10px;">
                    Error loading books: ${error.message}
                </div>`;
        }
    }
}

// Add this at the bottom of your file to test
document.addEventListener('DOMContentLoaded', () => {
    const displayButton = document.getElementById('displaydata');
    if (displayButton) {
        console.log('Found display button');
        displayButton.addEventListener('click', () => {
            console.log('Button clicked');
            fetchBooks();
        });
    } else {
        console.log('Display button not found');
    }
});