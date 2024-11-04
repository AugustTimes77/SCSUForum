// static/js/sqlConnection.js

async function fetchUsers() {
    console.log('fetchUsers function called'); // Debug log
    try {
        console.log('Making fetch request to /api/users'); // Debug log
        const response = await fetch('/api/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();
        console.log('Received users data:', users); // Debug log

        const contentDiv = document.querySelector('.forum-section');
        console.log('Found content div:', contentDiv); // Debug log
        
        if (!contentDiv) {
            throw new Error('Could not find forum-section element');
        }

        contentDiv.innerHTML = '<h2>Users</h2><ul>';
        
        if (users.length === 0) {
            contentDiv.innerHTML += '<li>No users found</li>';
        } else {
            users.forEach(user => {
                contentDiv.innerHTML += `
                    <li>
                        <strong>User ID:</strong> ${user.user_id || 'N/A'} | 
                        <strong>Username:</strong> ${user.username || 'N/A'} | 
                        <strong>Email:</strong> ${user.email || 'N/A'} | 
                        <strong>Role:</strong> ${user.role || 'N/A'}
                    </li>`;
            });
        }
        
        contentDiv.innerHTML += '</ul>';

    } catch (error) {
        console.error('Fetch Error:', error.message); // More detailed error logging
        const contentDiv = document.querySelector('.forum-section');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div style="color: red; padding: 10px;">
                    Error loading users: ${error.message}
                </div>`;
        }
    }
}

// Function to set up the event listener
function setupDisplayButton() {
    console.log('Setting up display button'); // Debug log
    const displayButton = document.getElementById('displaydata');
    console.log('Found button:', displayButton); // Debug log

    if (displayButton) {
        displayButton.addEventListener('click', () => {
            console.log('Button clicked!'); // Debug log
            fetchUsers();
        });
        // Add visual feedback that the button is clickable
        displayButton.style.cursor = 'pointer';
    } else {
        console.error('Display button not found');
    }
}

// Add event listeners for both initial page load and dynamic content updates
document.addEventListener('DOMContentLoaded', setupDisplayButton);

// Add this to handle cases where the content is loaded dynamically
function reattachEventListeners() {
    console.log('Reattaching event listeners'); // Debug log
    setupDisplayButton();
}