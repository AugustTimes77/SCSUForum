/**
 * public/js/main.js
 * Core application setup and page management
 */

// Main application controller
const App = {
    init() {
        this.initializeEvents();
        this.loadPartials().then(() => {
            this.setupNavigation();
            this.initializeCurrentPage();
        });
    },

    initializeEvents() {
        // Custom event for page changes
        document.addEventListener('pageLoaded', () => {
            this.initializeCurrentPage();
        });

        // Handle popstate for browser back/forward
        window.addEventListener('popstate', (event) => {
            this.loadPage(window.location.pathname, false);
        });
    },

    async loadPartials() {
        try {
            const headers = await this.loadPartial('header', 'header-container');
            const footers = await this.loadPartial('footer', 'footer-container');
            return Promise.all([headers, footers]);
        } catch (error) {
            console.error('Error loading partials:', error);
        }
    },

    loadPartial(partialName, containerId) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `/partial/${partialName}`, true);
            
            xhr.onload = function() {
                if (xhr.status === 200) {
                    document.getElementById(containerId).innerHTML = xhr.responseText;
                    resolve();
                } else {
                    reject(new Error(`Failed to load ${partialName}`));
                }
            };
            
            xhr.onerror = () => reject(new Error('Network error'));
            xhr.send();
        });
    },

    setupNavigation() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('nav a')) {
                e.preventDefault();
                const href = e.target.getAttribute('href');
                this.loadPage(href);
            }
        });
    },

    async loadPage(url, pushState = true) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            
            const mainContent = document.querySelector('.body');
            mainContent.innerHTML = html;

            if (pushState) {
                history.pushState({}, '', url);
            }

            // Trigger page loaded event
            document.dispatchEvent(new CustomEvent('pageLoaded', {
                detail: { path: url }
            }));
        } catch (error) {
            console.error('Error loading page:', error);
        }
    },

    initializeCurrentPage() {
        // Initialize based on current page
        const path = window.location.pathname;
        
        //this.loadPartials();

        if (path.includes('/account')) {
            PageHandlers.initializeAccountPage();
        } else if (path.includes('/forums')) {
            PageHandlers.initializeForumPage();
        } else if (path.includes('/messages')) {
            PageHandlers.initializeMessagePage();
        }
    }
};

// Page-specific handlers
const PageHandlers = {
    initializeAccountPage() {
        console.log('Initializing account page');
        
        // Handle display users button
        const displayButton = document.getElementById('displaydata');
        if (displayButton) {
            displayButton.addEventListener('click', async () => {
                try {
                    await UserAPI.fetchUsers();
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            });
        }

        // Handle account creation form
        const createForm = document.getElementById('createAccountForm');
        if (createForm) {
            createForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    await UserAPI.createAccount(e.target);
                } catch (error) {
                    console.error('Error creating account:', error);
                }
            });
        }
    },

    async initializeForumPage() {
        console.log('Initializing forum page');
    
        try {
            // Fetch all available forums from the server
            const forums = await ForumAPI.fetchForums();
            console.log('Fetched forums:', forums);
            
            // Find the forum list container in the DOM
            const forumList = document.querySelector('.forum-category ul');
            if (forumList) {
                // Create the HTML for each forum entry
                forumList.innerHTML = forums.map(forum => `
                    <li>
                        <a href="/forum/${forum.forum_id}" 
                           class="forum-link" 
                           data-forum-id="${forum.forum_id}"
                           data-forum-title="${forum.name}"
                           data-forum-description="${forum.description}">
                            ${forum.name}
                        </a>
                        <p class="forum-description">${forum.description}</p>
                    </li>
                `).join('');
                
                // Add click handlers for each forum link
                document.querySelectorAll('.forum-link').forEach(link => {
                    link.addEventListener('click', async (e) => {
                        e.preventDefault();
                        const forumId = e.target.dataset.forumId;
                        
                        try {
                            // Fetch both forum details and posts simultaneously
                            const [forum, posts] = await Promise.all([
                                ForumAPI.fetchForumById(forumId),
                                PostAPI.fetchPostsByForumId(forumId)
                            ]);
                            
                            // Get and process the forum template
                            const response = await fetch('/templates/forumTemplate');
                            let template = await response.text();
                            
                            // Replace placeholder text in the template
                            template = template
                                .replace('FORUM NAME', forum.name)
                                .replace('FORUM DESCRIPTION', forum.description);
                            
                            // Update the page content and URL
                            document.querySelector('.body').innerHTML = template;
                            history.pushState({}, '', `/forum/${forumId}`);
                            
                            // Display the forum's posts
                            PostAPI.displayPosts(posts);
                            
                        } catch (error) {
                            console.error('Error loading forum:', error);
                            alert('Failed to load forum. Please try again.');
                        }
                    });
                });
    
                // Add the CreatePostButton event listener using event delegation
                document.addEventListener('click', async (e) => {
                    if (e.target.id === 'CreatePostButton') {
                        // Prevent multiple forms from being created
                        if (document.querySelector('.post-form-container')) {
                            return;
                        }
    
                        // Create the post submission form HTML
                        const formHTML = `
                            <div class="post-form-container">
                                <div class="post-item">
                                    <h3>Create New Post</h3>
                                    <form id="createPostForm" class="post-form">
                                        <div class="form-group">
                                            <label for="postTitle">Title:</label>
                                            <input type="text" 
                                                   id="postTitle" 
                                                   name="title" 
                                                   required
                                                   class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label for="postContent">Content:</label>
                                            <textarea id="postContent" 
                                                      name="content" 
                                                      required
                                                      class="form-control"
                                                      rows="4"></textarea>
                                        </div>
                                        <div class="button-group">
                                            <button type="submit" class="submit-btn">Submit Post</button>
                                            <button type="button" class="display-btn" id="cancelPost">Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        `;
    
                        // Insert the form above the posts section
                        const gdSection = document.querySelector('.gd-section');
                        gdSection.insertAdjacentHTML('beforebegin', formHTML);
    
                        // Add cancel button functionality
                        document.getElementById('cancelPost').addEventListener('click', () => {
                            document.querySelector('.post-form-container').remove();
                        });
    
                        // Handle form submission
                        const createPostForm = document.getElementById('createPostForm');
                        createPostForm.addEventListener('submit', async (e) => {
                            e.preventDefault();
                            
                            // Get the submit button first
                            const submitButton = createPostForm.querySelector('button[type="submit"]');
                            const originalButtonText = submitButton.textContent; // Store the original text
                            
                            try {
                                // Get forum_id from URL
                                const pathParts = window.location.pathname.split('/');
                                const forum_id = parseInt(pathParts[pathParts.length - 1]);

                                // Prepare form data
                                const formData = {
                                    title: document.getElementById('postTitle').value,
                                    content: document.getElementById('postContent').value,
                                    forum_id: forum_id,
                                    user_id: 1  // This should come from your auth system
                                };

                                // Update button state
                                submitButton.textContent = 'Creating...';
                                submitButton.disabled = true;

                                // Submit the post
                                const result = await ForumAPI.createPost(formData);
                                
                                if (result.success) {
                                    const posts = await PostAPI.fetchPostsByForumId(forum_id);
                                    PostAPI.displayPosts(posts);
                                    document.querySelector('.post-form-container').remove();
                                }
                            } catch (error) {
                                console.error('Error submitting post:', error);
                                const errorDiv = document.createElement('div');
                                errorDiv.className = 'error-message';
                                errorDiv.textContent = 'Failed to create post. Please try again.';
                                createPostForm.insertAdjacentElement('afterbegin', errorDiv);
                            } finally {
                                // Reset button state using the stored original text
                                submitButton.textContent = originalButtonText;
                                submitButton.disabled = false;
                            }
                        });
                    }
                });
            }
            document.getElementById('CreateForumButton')?.addEventListener('click', () => {
                const forumFormHTML = `
                    <div class="forum-form-container">
                        <div class="post-item">
                            <h3>Create New Forum</h3>
                            <form id="createForumForm" class="forum-form">
                                <div class="form-group">
                                    <label for="forumName">Forum Name:</label>
                                    <input type="text" 
                                           id="forumName" 
                                           name="name" 
                                           required
                                           class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="forumDescription">Description:</label>
                                    <textarea id="forumDescription" 
                                            name="description" 
                                            required
                                            class="form-control"
                                            rows="4"></textarea>
                                </div>
                                <div class="button-group">
                                    <button type="submit" class="submit-btn">Create Forum</button>
                                    <button type="button" class="display-btn" id="cancelForum">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                `;
            
                document.querySelector('.forum-section').insertAdjacentHTML('afterbegin', forumFormHTML);
            
                document.getElementById('cancelForum').addEventListener('click', () => {
                    document.querySelector('.forum-form-container').remove();
                });
            
                document.getElementById('createForumForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = {
                        name: document.getElementById('forumName').value,
                        description: document.getElementById('forumDescription').value
                    };
            
                    try {
                        await ForumAPI.createForum(formData);
                        document.querySelector('.forum-form-container').remove();
                        // Refresh the forums list
                        const forums = await ForumAPI.fetchForums();
                        // Update the UI with new forums
                        const forumList = document.querySelector('.forum-category ul');
                        if (forumList) {
                            forumList.innerHTML = forums.map(forum => `
                                <li>
                                    <a href="/forum/${forum.forum_id}" 
                                       class="forum-link" 
                                       data-forum-id="${forum.forum_id}">
                                        ${forum.name}
                                    </a>
                                    <p class="forum-description">${forum.description}</p>
                                </li>
                            `).join('');
                        }
                    } catch (error) {
                        console.error('Error creating forum:', error);
                        alert('Failed to create forum. Please try again.');
                    }
                });
            });
        } catch (error) {
            // Handle any errors that occur during forum page initialization
            console.error('Error initializing forum page:', error);
            const forumSection = document.querySelector('.forum-section');
            if (forumSection) {
                forumSection.innerHTML = `
                    <h2>Forums</h2>
                    <p class="error-message">Sorry, we couldn't load the forums. Please try again later.</p>
                `;
            }
        }
    },

    initializeMessagePage() {
        console.log('Initializing message page');
        // Message-specific initialization will go here
    }
};

// Start the application
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});