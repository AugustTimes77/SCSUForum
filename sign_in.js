document.getElementById('signinForm').onsubmit = function() {
    
    const email = document.getElementById('signinEmail').value;
    const password = document.getElementById('signinPassword').value;

    
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', '/signin', true);
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    
    
    xmlhttp.onload = function() {
        if (xmlhttp.status === 200) {
            // redirects to the home page of the forum - likly needs change
            window.location.href = '/homePage';
        } else {
            alert('Sign In Failed');
        }
    };
    
    xmlhttp.send(JSON.stringify({ email, password }));
};
