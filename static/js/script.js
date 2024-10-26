// OVERVIEW
// 1. page loading
//      - wait for html to fully load
//      - load header/footer
//      - set up navigation click handlers
// 2. When user clicks link
//      - prevent normal link behavior (not full reload of page, just AJAX 
//          for new info request)
//      - update the URL and browser history
// 3. When user uses back / forward page
//      - detect history change
//      - loads appropriate content
//      - maintains browser history



// wait for the DOm to be loaded before running code
// makes sure HTML is fully loaded before doing anything
document.addEventListener('DOMContentLoaded', () => {
    //load header/footer then set up navigation once finished
    loadPartials().then(() => {
        setupNavigation();
    });
});

// function to load all partials
async function loadPartials() {
    try {
        // promises to load both of the partials
        await Promise.all([
            loadPartial('header', 'header-container'),
            loadPartial('footer', 'footer-container')
        ]);
    } catch (error) {
        // if either fails, log error
        console.error('Error loading partials:', error);
    }
}

// Function to load a single partial
function loadPartial(partialName, containerId) {
    // returns an async promise to load the partial
    return new Promise((resolve, reject) => {
        // new AJAX request object
        const xhr = new XMLHttpRequest();
        // set up the request to get partial at specific location
        xhr.open('GET', `/partial/${partialName}`, true);
        
        // when reqeust completes
        xhr.onload = function() {
            if (xhr.status === 200) { // if successful
                // insert partial HTML into its location
                document.getElementById(containerId).innerHTML = xhr.responseText;
                resolve();
            } else {
                // else error
                reject(new Error(`Failed to load ${partialName}`));
            }
        };
        // if a network error occurs
        xhr.onerror = function() {
            reject(new Error(`Network error loading ${partialName}`));
        };
        // send request
        xhr.send();
    });
}

// sets up the navigation for clicking on nav
function setupNavigation() {
    // adds event listeners to the nav
    document.querySelector('nav').addEventListener('click', (e) => {
        // only if the item in the nav is an <a> tag
        if (e.target.matches('a')) {
            e.preventDefault();
            // get the href attribute in the link (forums/messages/account)
            const href = e.target.getAttribute('href');
            // if it's the homepage then just load that
            if (href === '/') {
                loadContent('home');
            } else {
                // remove the front slash from the page
                const pageName = href.substring(1);
                loadContent(pageName);
            }
        }
    });

    // set up a special handling for the main link
    const homeLink = document.querySelector('.home-link');
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadContent('home');
        });
    }
}

// function for loading main content, the stuff between header and footer
function loadContent(pageName) {
    // new AJAX request
    const xhr = new XMLHttpRequest();
    // get the stuff in class #body
    const mainContent = document.querySelector('.body');
    // if we can't find it then return early
    if (!mainContent) {
        console.error('No main content container found');
        return;
    }

    // for when the content has loaded
    xhr.onload = function() {
        if (xhr.status === 200) {
            // creates a temporary div to hold new stuff
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = xhr.responseText;
            // extract the content we want in the html
            const newContent = tempDiv.querySelector('.body') || tempDiv;
            // replace the current content with the queried content
            mainContent.innerHTML = newContent.innerHTML;
            
            // update the url without refresh
            const url = pageName === 'home' ? '/' : `/${pageName}`;
            // adds the page to browser history
            history.pushState({page: pageName}, '', url);
        } else {
            console.error('Content loading failed:', xhr.status);
        }
    };
    // for a network error
    xhr.onerror = function() {
        console.error('Request failed');
    };
    
    // set up the reqeust URL to send
    const path = pageName === 'home' ? '/' : `/${pageName}`;
    xhr.open('GET', path, true);
    xhr.send();
}

// handles browser back/forward buttons
window.addEventListener('popstate', (event) => {
    // if there is saved state data
    if (event.state && event.state.page) {
        // load the saved page
        loadContent(event.state.page);
    } else {
        // default to home
        loadContent('home');
    }
});