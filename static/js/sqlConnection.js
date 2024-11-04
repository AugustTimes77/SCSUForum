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


// Add this to your sqlConnection.js

async function createUser(userData) {
    try {
        const response = await fetch('/api/users/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

function setupAccountForm() {
    const form = document.getElementById('createAccountForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const userData = {
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value,
                    email: document.getElementById('email').value,
                    role: 'owl' // default role
                };

                // Validate input
                if (!userData.username || !userData.password || !userData.email) {
                    throw new Error('Please fill in all fields');
                }

                // Basic email validation
                if (!userData.email.includes('@')) {
                    throw new Error('Please enter a valid email address');
                }

                await createUser(userData);
                alert('Account created successfully!');
                form.reset();
                
                // Optionally refresh the user list if it's displayed
                const displayButton = document.getElementById('displaydata');
                if (displayButton) {
                    fetchUsers();
                }

            } catch (error) {
                alert(`Error creating account: ${error.message}`);
            }
        });
    }
}

// Add this to your existing DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
    setupAccountForm();
    setupDisplayButton();
});

// Add event listeners for both initial page load and dynamic content updates
document.addEventListener('DOMContentLoaded', setupDisplayButton);

// Add this to handle cases where the content is loaded dynamically
function reattachEventListeners() {
    console.log('Reattaching event listeners'); // Debug log
    setupDisplayButton();
}