// Load partials when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadPartials().then(() => {
        setupNavigation();
    });
});

// Function to load all partials
async function loadPartials() {
    try {
        await Promise.all([
            loadPartial('header', 'header-container'),
            loadPartial('footer', 'footer-container')
        ]);
    } catch (error) {
        console.error('Error loading partials:', error);
    }
}

// Function to load a single partial
function loadPartial(partialName, containerId) {
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
        
        xhr.onerror = function() {
            reject(new Error(`Network error loading ${partialName}`));
        };
        
        xhr.send();
    });
}

function setupNavigation() {
    // Your existing navigation setup code...
    document.querySelector('nav').addEventListener('click', (e) => {
        if (e.target.matches('a')) {
            e.preventDefault();
            const pageName = e.target.textContent.toLowerCase();
            loadContent(pageName);
        }
    });

    const homeLink = document.querySelector('.home-link');
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadContent('home');
        });
    }
}

function loadContent(pageName) {
    // Your existing loadContent function...
    const xhr = new XMLHttpRequest();
    const mainContent = document.querySelector('.body');
    
    if (!mainContent) {
        console.error('No main content container found');
        return;
    }

    xhr.onload = function() {
        if (xhr.status === 200) {
            mainContent.innerHTML = xhr.responseText;
            const url = pageName === 'home' ? '/' : `/${pageName}`;
            history.pushState({page: pageName}, '', url);
        } else {
            console.error('Content loading failed:', xhr.status);
        }
    };
    
    xhr.onerror = function() {
        console.error('Request failed');
    };
    
    const path = pageName === 'home' ? '/' : `/${pageName}`;
    xhr.open('GET', path, true);
    xhr.send();
}

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
        loadContent(event.state.page);
    } else {
        loadContent('home');
    }
});