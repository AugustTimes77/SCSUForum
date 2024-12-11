document.getElementById('signupForm').onsubmit = function() {
    
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', '/signup', true);
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    
    
    xmlhttp.onload = function() {
        if (xmlhttp.status === 200) {
            // redirects to the home page of the forum - likly needs change
            window.location.href = '/homePage';
        } else {
            alert('Sign Up Failed');
        }
    };
    
    
    xmlhttp.send(JSON.stringify({ username, email, password }));
};
