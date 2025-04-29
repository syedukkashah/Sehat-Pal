// Authentication related JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Get the signup form if it exists on the page
    const signupForm = document.querySelector('.login-container form');
    
    // Check if we're on the signup page
    if (signupForm && window.location.pathname.includes('signup.html')) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form inputs
            const fullNameInput = signupForm.querySelector('input[placeholder="Full Name*"]');
            const emailInput = signupForm.querySelector('input[type="email"]');
            const passwordInput = signupForm.querySelector('input[placeholder="Password*"]');
            const confirmPasswordInput = signupForm.querySelector('input[placeholder="Confirm Password*"]');
            
            // Basic validation
            if (passwordInput.value !== confirmPasswordInput.value) {
                alert('Passwords do not match!');
                return;
            }
            
            // Check if email already exists in localStorage
            const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const emailExists = existingUsers.some(user => user.email === emailInput.value);
            
            if (emailExists) {
                alert('User with this email already exists!');
                return;
            }
            
            // Create new user object
            const newUser = {
                id: Date.now(), // Simple way to generate unique ID
                full_name: fullNameInput.value,
                email: emailInput.value,
                password: passwordInput.value // In a real app, this should be hashed
            };
            
            // Add user to localStorage
            existingUsers.push(newUser);
            localStorage.setItem('users', JSON.stringify(existingUsers));
            
            // Set current user in localStorage
            localStorage.setItem('currentUser', JSON.stringify({
                id: newUser.id,
                full_name: newUser.full_name,
                email: newUser.email
            }));
            
            // Set auth token (simulated)
            localStorage.setItem('token', 'demo-token-' + newUser.id);
            
            alert('Account created successfully!');
            
            // Redirect to home page
            window.location.href = 'home.html';
        });
    }
    
    // Check if we're on the signin page
    const signinForm = document.querySelector('.login-container form');
    if (signinForm && window.location.pathname.includes('signin.html')) {
        signinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form inputs
            const emailInput = signinForm.querySelector('input[type="email"]');
            const passwordInput = signinForm.querySelector('input[type="password"]');
            
            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Find user with matching email and password
            const user = users.find(u => 
                u.email === emailInput.value && 
                u.password === passwordInput.value
            );
            
            if (user) {
                // Set current user in localStorage
                localStorage.setItem('currentUser', JSON.stringify({
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email
                }));
                
                // Set auth token (simulated)
                localStorage.setItem('token', 'demo-token-' + user.id);
                
                alert('Login successful!');
                
                // Redirect to home page
                window.location.href = 'home.html';
            } else {
                alert('Invalid email or password. Please try again.');
            }
        });
    }
    
    // Guest login functionality
    const guestLoginBtn = document.querySelector('.btn-guest');
    if (guestLoginBtn) {
        guestLoginBtn.addEventListener('click', function() {
            // Set a guest flag in localStorage
            localStorage.setItem('guestMode', 'true');
            // Redirect to home page
            window.location.href = 'home.html';
        });
    }
    
    // Check authentication status on page load
    function checkAuthStatus() {
        const token = localStorage.getItem('token');
        const guestMode = localStorage.getItem('guestMode');
        const userMenuItems = document.querySelectorAll('.nav-link');
        
        if (token || guestMode) {
            // User is logged in or in guest mode
            // Update UI accordingly if needed
        }
    }
    
    // Call the function to check auth status
    checkAuthStatus();
});