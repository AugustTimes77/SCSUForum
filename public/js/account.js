document.addEventListener('DOMContentLoaded', function() {
    const currentUser = UserAPI.getCurrentUser();
    const accountContainer = document.getElementById('account-container');
    
    if (!currentUser) {
        // Show login form with register option
        accountContainer.innerHTML = `
            <div class="login-section">
                <h2>Login</h2>
                <div class="account-form">
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="username">Username:</label>
                            <input type="text" id="username" name="username" required>
                        </div>

                        <div class="form-group">
                            <label for="password">Password:</label>
                            <input type="password" id="password" name="password" required>
                        </div>

                        <button type="submit" class="submit-btn">Login</button>
                    </form>
                    <div id="loginMessage"></div>
                    <div class="register-option">
                        <p>Don't have an account?</p>
                        <button id="showRegisterForm" class="display-btn">Register New Account</button>
                    </div>
                </div>
            </div>`;

        // Add login form handler
        const loginForm = document.getElementById('loginForm');
        const messageDiv = document.getElementById('loginMessage');
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await UserAPI.login(loginForm);
                window.location.reload();
            } catch (error) {
                messageDiv.textContent = error.message;
                messageDiv.style.color = 'red';
            }
        });

        // Add register button handler
        document.getElementById('showRegisterForm').addEventListener('click', () => {
            accountContainer.innerHTML = `
                <div class="register-section">
                    <h2>Create New Account</h2>
                    <div class="account-form">
                        <form id="createAccountForm">
                            <div class="form-group">
                                <label for="username">Username:</label>
                                <input type="text" id="username" name="username" required>
                            </div>

                            <div class="form-group">
                                <label for="password">Password:</label>
                                <input type="password" id="password" name="password" required>
                            </div>

                            <div class="form-group">
                                <label for="email">Email:</label>
                                <input type="email" id="email" name="email" required>
                            </div>

                            <button type="submit" class="submit-btn">Create Account</button>
                        </form>
                        <div id="registerMessage"></div>
                        <div class="login-option">
                            <p>Already have an account?</p>
                            <button id="showLoginForm" class="display-btn">Back to Login</button>
                        </div>
                    </div>
                </div>`;

            // Add create account form handler
            const createAccountForm = document.getElementById('createAccountForm');
            const registerMessage = document.getElementById('registerMessage');
            
            createAccountForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    await UserAPI.createAccount(createAccountForm);
                    registerMessage.textContent = 'Account created successfully! You can now login.';
                    registerMessage.style.color = 'green';
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } catch (error) {
                    registerMessage.textContent = error.message;
                    registerMessage.style.color = 'red';
                }
            });

            // Add back to login handler
            document.getElementById('showLoginForm').addEventListener('click', () => {
                window.location.reload();
            });
        });
    } else {
        // Show user account information
        accountContainer.innerHTML = `
            <h2>Account Settings</h2>
            <div class="account-form">
                <div class="user-info">
                    <h3>Welcome, ${currentUser.username}!</h3>
                    <p>Email: ${currentUser.email}</p>
                    <p>Role: ${currentUser.role}</p>
                </div>
                <button id="logoutButton" class="display-btn">Logout</button>
            </div>`;

        // Add logout handler
        document.getElementById('logoutButton').addEventListener('click', () => {
            UserAPI.logout();
        });
    }
});