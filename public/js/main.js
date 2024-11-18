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
            const forums = await ForumAPI.fetchForums();
            console.log('Fetched forums:', forums);
            
            const forumList = document.querySelector('.forum-category ul');
            if (forumList) {
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
                
                // Add click handlers for forum links
                document.querySelectorAll('.forum-link').forEach(link => {
                    link.addEventListener('click', async (e) => {
                        e.preventDefault();
                        const forumId = e.target.dataset.forumId;
                        console.log('Forum link clicked:', forumId);
                        
                        try {
                            // Fetch forum data from database
                            const forum = await ForumAPI.fetchForumById(forumId);
                            console.log('Fetched forum data:', forum);
                            
                            // Load template - Note the changed path
                            const response = await fetch('/templates/forumTemplate');
                            if (!response.ok) {
                                throw new Error(`Failed to load template: ${response.status}`);
                            }
                            let template = await response.text();
                            console.log('Loaded template');
                            
                            template = template
                                .replace('FORUM NAME', forum.name)
                                .replace('FORUM DESCRIPTION', forum.description);
                            
                            document.querySelector('.body').innerHTML = template;
                            history.pushState({}, '', `/forum/${forumId}`);
                            
                        } catch (error) {
                            console.error('Error loading forum:', error);
                            alert('Failed to load forum. Please try again.');
                        }
                    });
                });
            }
        } catch (error) {
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