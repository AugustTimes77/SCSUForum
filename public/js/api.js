/**
 * public/js/api.js
 * API handlers for different features
 */

// User-related API calls
const UserAPI = {
    async fetchUsers() {
        try {
            const response = await fetch('/api/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const users = await response.json();
            this.displayUsers(users);
            return users;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    async createAccount(form) {
        try {
            const formData = new FormData(form);
            const userData = {
                username: formData.get('username'),
                password: formData.get('password'),
                email: formData.get('email')
            };

            const response = await fetch('/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) throw new Error('Failed to create account');

            alert('Account created successfully!');
            form.reset();
        } catch (error) {
            alert('Error creating account: ' + error.message);
            throw error;
        }
    },

    displayUsers(users) {
        const contentDiv = document.querySelector('.forum-section');
        if (!contentDiv) return;

        contentDiv.innerHTML = '<h2>Users</h2><ul>';
        
        if (users.length === 0) {
            contentDiv.innerHTML += '<li>No users found</li>';
        } else {
            users.forEach(user => {
                contentDiv.innerHTML += `
                    <li>
                        <strong>User ID:</strong> ${user.user_id || 'N/A'} | 
                        <strong>Username:</strong> ${user.username || 'N/A'} | 
                        <strong>Email:</strong> ${user.email || 'N/A'}
                    </li>`;
            });
        }
        
        contentDiv.innerHTML += '</ul>';
    }
};

const ForumAPI = {
    async fetchForums() {
        try {
            console.log('Fetching forums...');
            const response = await fetch('/api/forums', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
            }
            
            const forums = await response.json();
            console.log('Forums fetched successfully:', forums);
            return forums;
        } catch (error) {
            console.error('Error in fetchForums:', error);
            throw error;
        }
    },

    async fetchForumById(forumId) {
        try {
            console.log('Fetching forum:', forumId);
            const response = await fetch(`/api/forums/${forumId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
            }

            const forum = await response.json();
            console.log('Forum fetched successfully:', forum);
            return forum;
        } catch (error) {
            console.error('Error in fetchForumById:', error);
            throw error;
        }
    }
};

// Message-related API calls (placeholder for future)
const MessageAPI = {
    // Message methods will go here
};