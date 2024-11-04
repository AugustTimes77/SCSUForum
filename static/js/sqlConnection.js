async function fetchUsers() {
    try {
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
        
        // gets the forum section
        const contentDiv = document.querySelector('.forum-section');
        
        if (!contentDiv) {
            throw new Error('Could not find forum-section element');
        }

        // More structured display of the users
        contentDiv.innerHTML = '<h2>Users</h2><ul>';
        
        if (users.length === 0) {
            contentDiv.innerHTML += '<li>No users found</li>';
        } else {
            users.forEach(user => {  // Changed from 'book' to 'user'
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
        console.error('Error:', error.message);
        // Add visual error feedback
        const contentDiv = document.querySelector('.forum-section');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div style="color: red; padding: 10px;">
                    Error loading users: ${error.message}
                </div>`;
        }
    }
}

// automatically connects function call to button
document.addEventListener('DOMContentLoaded', () => {
    const displayButton = document.getElementById('displaydata');
    if (displayButton) {
        console.log('Found display button');
        displayButton.addEventListener('click', () => {
            console.log('Button clicked');
            fetchUsers();
            displayButton.innerText = "buttonclicked";
        });
    } else {
        console.log('Display button not found');
    }
});