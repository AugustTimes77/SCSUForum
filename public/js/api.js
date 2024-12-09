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
    },

    async login(form) {
        try {
            const formData = new FormData(form);
            const userData = {
                username: formData.get('username'),
                password: formData.get('password')
            };

            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const result = await response.json();
            
            // Store user info in localStorage for easy access
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            
            // Redirect to forums after successful login
            window.location.href = '/forums';
        } catch (error) {
            alert('Login failed: ' + error.message);
            throw error;
        }
    },

    getCurrentUser() {
        const userString = localStorage.getItem('currentUser');
        return userString ? JSON.parse(userString) : null;
    },

    logout() {
        localStorage.removeItem('currentUser');
        fetch('/api/users/logout', { method: 'POST' })
            .then(() => {
                window.location.href = '/login';
            });
    }
};

// forum related API calls
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
    },

    async createPost(postData) {
        try {
            const response = await fetch('/api/forums/posts/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create post');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    }
};

// post related API calls
const PostAPI = {
    async fetchPostsByForumId(forumId){
        try {
            console.log('Fetching posts from forum:', forumId);
            const response = await fetch(`/api/forums/posts/${forumId}`, {
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

            const posts = await response.json();
            this.displayPosts(posts);
            return posts;
        } catch (error) {
            console.error('Error in fetchPostsByForumId:', error);
            throw error;
        }
    },
    displayPosts(posts){
        const contentDiv = document.querySelector('.gd-section');
        if (!contentDiv) return;

        contentDiv.innerHTML = '<h2>Posts</h2><ul>';
        
        if (posts.length === 0) {
            contentDiv.innerHTML += '<li>No posts found</li>';
        } else {
            
            posts.forEach(post => {
                contentDiv.innerHTML += `
                    <div class="post-item" data-post-id="${post.post_id}">  // Add this data attribute
                        <li class="main-post">
                            <h3>${post.title}</h3>
                            <p>${post.content}</p>
                        </li>
                        <li class="sub-post">
                            <button class="reaction-btn like-btn" data-type="like">Like</button>
                            <span class="likes-count">${post.likes || 0}</span>
                            <span class="dislikes-count">${post.dislikes || 0}</span>
                            <button class="reaction-btn dislike-btn" data-type="dislike">Dislike</button>
                            <small>Posted on: ${new Date(post.created_at).toLocaleDateString()}</small>
                        </li>
                    </div>`;
            });
        }
        
        contentDiv.innerHTML += '</ul>';

        this.attachReactionHandlers();
    },

    async likePost(postId, isLike) {
        try {
            console.log('Sending reaction:', { postId, isLike });  // Debug log
            
            const response = await fetch('/api/posts/react', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ post_id: postId, isLike })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update post reaction');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error updating post reaction:', error);
            throw error;
        }
    },

    attachReactionHandlers() {
        document.querySelectorAll('.reaction-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                try {
                    const postItem = e.target.closest('.post-item');
                    const postId = postItem.dataset.postId;
                    const isLike = e.target.dataset.type === 'like';
                    
                    // Disable the button during the request
                    button.disabled = true;
                    
                    // Update the post reaction
                    const updatedPost = await this.likePost(postId, isLike);
                    
                    // Update the UI with new counts
                    postItem.querySelector('.likes-count').textContent = updatedPost.likes;
                    postItem.querySelector('.dislikes-count').textContent = updatedPost.dislikes;
                } catch (error) {
                    console.error('Failed to update reaction:', error);
                    alert('Failed to update reaction. Please try again.');
                } finally {
                    button.disabled = false;
                }
            });
        });
    }
};

// Message-related API calls (placeholder for future)
const MessageAPI = {
    // Message methods will go here
};