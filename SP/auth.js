import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, collection, addDoc, query, where, getDocs } from './firebase.js';

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the signin page
  const signinForm = document.getElementById('signin-form');
  if (signinForm) {
    signinForm.addEventListener('submit', handleSignIn);
  }

  // Check if we're on the signup page
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignUp);
  }

  // Check if logout button exists (on authenticated pages)
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleSignOut);
  }

  // Listen for auth state changes
  onAuthStateChanged(auth, handleAuthStateChanged);
});

// Handle sign in
async function handleSignIn(e) {
  e.preventDefault();
  
  const email = e.target.querySelector('input[type="email"]').value;
  const password = e.target.querySelector('input[type="password"]').value;
  const errorElement = document.getElementById('signin-error');
  
  try {
    if (errorElement) errorElement.textContent = '';
    await signInWithEmailAndPassword(auth, email, password);
    // Redirect will be handled by auth state change
  } catch (error) {
    console.error('Sign in error:', error);
    if (errorElement) errorElement.textContent = error.message;
  }
}

// Handle sign up
async function handleSignUp(e) {
  e.preventDefault();
  
  const fullName = e.target.querySelector('input[placeholder="Full Name*"]').value;
  const email = e.target.querySelector('input[type="email"]').value;
  const password = e.target.querySelector('input[placeholder="Password*"]').value;
  const confirmPassword = e.target.querySelector('input[placeholder="Confirm Password*"]').value;
  const errorElement = document.getElementById('signup-error');
  
  try {
    // Validate passwords match
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    if (errorElement) errorElement.textContent = '';
    
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store additional user information in Firestore
    await addDoc(collection(db, 'userProfiles'), {
      userId: user.uid,
      email: email,
      fullName: fullName,
      createdAt: new Date()
    });
    
    // Redirect will be handled by auth state change
  } catch (error) {
    console.error('Sign up error:', error);
    if (errorElement) errorElement.textContent = error.message;
  }
}

// Handle sign out
async function handleSignOut() {
  try {
    await signOut(auth);
    // Redirect to signin page after logout
    window.location.href = 'signin.html';
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// Handle auth state changes
function handleAuthStateChanged(user) {
  const currentPath = window.location.pathname;
  const fileName = currentPath.split('/').pop();
  
  if (user) {
    // User is signed in
    console.log('User signed in:', user.email);
    
    // If on auth pages, redirect to home
    if (fileName === 'signin.html' || fileName === 'signup.html') {
      window.location.href = 'home.html';
    }
    
    // Update UI for authenticated user if on relevant pages
    updateAuthenticatedUI(user);
    
    // If on medical records page, ensure the records are loaded
    if (fileName === 'medical_records.html') {
      // If loadMedicalRecords function exists (from records.js), call it
      if (typeof window.loadMedicalRecords === 'function') {
        window.loadMedicalRecords();
      } else {
        // If not available, wait for records.js to load and then try again
        window.addEventListener('recordsJSLoaded', () => {
          if (typeof window.loadMedicalRecords === 'function') {
            window.loadMedicalRecords();
          }
        });
      }
    }
  } else {
    // User is signed out
    console.log('User signed out');
    
    // Protected pages that require authentication
    const protectedPages = ['home.html', 'medical_records.html', 'chatbot.html'];
    
    // If on protected pages, redirect to sign in
    if (protectedPages.includes(fileName)) {
      window.location.href = 'signin.html';
    }
  }
}

// Update UI elements for authenticated user
function updateAuthenticatedUI(user) {
  // Update user name display if element exists
  const userNameElement = document.getElementById('user-name');
  if (userNameElement) {
    userNameElement.textContent = user.email;
    loadUserProfile(user.uid);
  }
  
  // Show logout button if it exists
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.style.display = 'inline-block';
  }
  
  // Any other UI elements that need to be updated for authenticated state
  const authLinks = document.querySelectorAll('.auth-link');
  authLinks.forEach(link => {
    if (link.dataset.authState === 'signed-in') {
      link.style.display = 'block';
    } else if (link.dataset.authState === 'signed-out') {
      link.style.display = 'none';
    }
  });
}

// Load user profile data
async function loadUserProfile(userId) {
  try {
    const q = query(collection(db, 'userProfiles'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userProfile = querySnapshot.docs[0].data();
      
      // Update user name in the header if element exists
      const userNameElement = document.getElementById('user-name');
      if (userNameElement && userProfile.fullName) {
        userNameElement.textContent = userProfile.fullName;
      }
    }
  } catch (error) {
    console.error('Load user profile error:', error);
  }
} 