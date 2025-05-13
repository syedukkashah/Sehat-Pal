import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, collection, addDoc, query, where, getDocs, sendEmailVerification, sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode, orderBy, limit, GoogleAuthProvider, signInWithPopup, updateDoc, doc } from './firebase.js';

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

  // Check if we're on the reset password page
  const resetPasswordForm = document.getElementById('reset-password-form');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', handlePasswordReset);
  }

  // Check if logout button exists (on authenticated pages)
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleSignOut);
  }

  // Google sign-in/sign-up buttons
  const googleSignInBtn = document.getElementById('google-signin-btn');
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', handleGoogleSignIn);
  }

  // Add event listener for Google sign-up button on signup page
  const googleSignUpBtn = document.querySelector('.btn-google');
  if (googleSignUpBtn && window.location.pathname.includes('signup.html')) {
    googleSignUpBtn.addEventListener('click', handleGoogleSignIn);
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
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.className = 'error-message';
    }
    console.log('Attempting to sign in with email:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if email is verified
    if (!userCredential.user.emailVerified) {
      // Show the message first
      if (errorElement) {
        errorElement.className = 'error-message error';
        errorElement.innerHTML = `
          <div style="margin-bottom: 10px;">⚠️ Email Verification Required</div>
          <div style="margin-bottom: 10px;">Please verify your email before signing in.</div>
          <div style="margin-bottom: 10px;">📧 Check your inbox at: <strong>${email}</strong></div>
          <div style="font-style: italic;">Note: If you don't see the email, please check your spam folder.</div>
        `;
      }
      
      // Wait a moment to ensure the message is displayed
      setTimeout(async () => {
        await signOut(auth);
      }, 1000);
      
      return;
    }
    
    // Log successful login
    console.log('Successfully logged in as:', userCredential.user.email);
    console.log('User ID:', userCredential.user.uid);
    
    // Redirect will be handled by auth state change
  } catch (error) {
    console.error('Login error:', error);
    if (error.code === 'auth/user-not-found') {
      alert('No account found with this email. Please sign up first.');
    } else if (error.code === 'auth/wrong-password') {
      alert('Incorrect password. Please try again.');
    } else if (error.code === 'auth/too-many-requests') {
      alert('Too many failed login attempts. Please try again later.');
    } else if (error.code === 'auth/user-disabled') {
      alert('This account has been disabled. Please contact support.');
    } else if (error.code === 'auth/email-not-verified') {
      alert('Please verify your email before logging in.');
      // Removed automatic redirect to let the user manually click the button
    } else {
      alert('Login failed: ' + error.message);
    }
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
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.className = 'error-message';
    }
    
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Send email verification
    try {
      await sendEmailVerification(user);
      console.log('Verification email sent successfully');
    } catch (verificationError) {
      console.error('Error sending verification email:', verificationError);
      throw new Error('Failed to send verification email. Please try again.');
    }
    
    // Store user data in sessionStorage for later use after verification
    sessionStorage.setItem('pendingUserData', JSON.stringify({
      fullName: fullName,
      email: email,
      authProvider: 'email',
      lastSignIn: new Date().toISOString()
    }));
    
    // Sign out the user until they verify their email
    await signOut(auth);
    
    // Show success message with detailed instructions
    if (errorElement) {
      errorElement.className = 'error-message success';
      errorElement.innerHTML = `
        <div style="margin-bottom: 10px;">✅ Account created successfully!</div>
        <div style="margin-bottom: 10px;">📧 A verification email has been sent to: <strong>${email}</strong></div>
        <div style="margin-bottom: 10px;">⚠️ Please check your inbox and follow these steps:</div>
        <ol style="text-align: left; margin: 10px 0;">
          <li>Open the verification email</li>
          <li>Click the verification link in the email</li>
          <li>Return to this page and sign in</li>
        </ol>
        <div style="font-style: italic;">Note: If you don't see the email, please check your spam folder.</div>
      `;
    }
    
    // Clear the form
    e.target.reset();
    
    // Prevent any automatic redirects
    e.stopPropagation();
    return false;
    
  } catch (error) {
    console.error('Sign up error:', error);
    if (errorElement) {
      errorElement.className = 'error-message error';
      errorElement.textContent = error.message;
    }
  }
}

// Handle password reset request
async function handlePasswordReset(e) {
  e.preventDefault();
  
  const email = e.target.querySelector('input[type="email"]').value;
  const errorElement = document.getElementById('reset-error');
  
  try {
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.className = 'error-message';
    }
    
    // Send password reset email
    await sendPasswordResetEmail(auth, email);
    
    // Show success message
    if (errorElement) {
      errorElement.className = 'error-message success';
      errorElement.innerHTML = `
        <div style="margin-bottom: 10px;">✅ Password reset email sent!</div>
        <div style="margin-bottom: 10px;">📧 Please check your email at: <strong>${email}</strong></div>
        <div style="margin-bottom: 10px;">⚠️ Follow these steps:</div>
        <ol style="text-align: left; margin: 10px 0;">
          <li>Open the password reset email</li>
          <li>Click the reset link in the email</li>
          <li>Create a new password</li>
        </ol>
        <div style="font-style: italic;">Note: If you don't see the email, please check your spam folder.</div>
      `;
    }
    
    // Clear the form
    e.target.reset();
    
  } catch (error) {
    console.error('Password reset error:', error);
    if (errorElement) {
      errorElement.className = 'error-message error';
      errorElement.textContent = error.message;
    }
  }
}

// Handle auth state changes
async function handleAuthStateChanged(user) {
  console.log('Auth state changed. Current user:', user ? user.email : 'No user');
  
  if (user) {
    // Reset loading screen state when user logs in
    sessionStorage.removeItem('hasLoadedBefore');
    
    // Check if email is verified
    if (!user.emailVerified) {
      console.log('User email not verified:', user.email);
      await signOut(auth);
      // Don't redirect if we're on the signup page
      if (!window.location.pathname.includes('signup.html')) {
        window.location.href = 'signin.html';
      }
      return;
    }
    
    console.log('User is verified and logged in:', user.email);
    
    // Check if user profile exists
    const userProfilesRef = collection(db, 'userProfiles');
    const q = query(userProfilesRef, where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // No profile exists, create one
      try {
        // Try to get pending user data from sessionStorage
        const pendingData = JSON.parse(sessionStorage.getItem('pendingUserData') || '{}');
        
        // Create new profile with comprehensive user data
        await addDoc(userProfilesRef, {
          userId: user.uid,
          email: user.email,
          fullName: pendingData.fullName || user.displayName || user.email.split('@')[0],
          authProvider: pendingData.authProvider || 'google',
          emailVerified: true,
          createdAt: new Date(),
          lastSignIn: new Date(),
          lastUpdated: new Date(),
          accountStatus: 'active',
          preferences: {
            darkMode: false,
            notifications: true
          }
        });
        
        // Clear pending data
        sessionStorage.removeItem('pendingUserData');
        console.log('New user profile created after verification');
      } catch (error) {
        console.error('Error creating user profile:', error);
      }
    } else {
      // Profile exists, update verification status and last sign in
      const userProfile = querySnapshot.docs[0];
      const updates = {
        lastSignIn: new Date(),
        lastUpdated: new Date()
      };
      
      if (!userProfile.data().emailVerified) {
        updates.emailVerified = true;
      }
      
      await updateDoc(doc(db, 'userProfiles', userProfile.id), updates);
      console.log('User profile updated:', userProfile.data().fullName);
    }
    
    // Update UI with user name
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
      const userData = querySnapshot.docs[0].data();
      // Only display the first name
      const firstName = userData.fullName ? userData.fullName.split(' ')[0] : '';
      userNameElement.innerHTML = `<i class="bi bi-person-circle"></i> ${firstName}`;
    }
    
    // Show user info div
    const userInfoDiv = document.querySelector('.user-info');
    if (userInfoDiv) {
      userInfoDiv.style.display = 'flex';
    }
    
    // Redirect to appropriate page based on current location
    const currentPath = window.location.pathname;
    if (currentPath.includes('signin.html') || currentPath.includes('signup.html')) {
      console.log('Redirecting to home page');
      window.location.href = 'home.html';
    }
  } else {
    console.log('No user is signed in');
    // Hide user info div
    const userInfoDiv = document.querySelector('.user-info');
    if (userInfoDiv) {
      userInfoDiv.style.display = 'none';
    }
    
    // Redirect to signin page if not on auth pages
    const currentPath = window.location.pathname;
    if (!currentPath.includes('signin.html') && 
        !currentPath.includes('signup.html') && 
        !currentPath.includes('resetpassword.html') && 
        !currentPath.includes('home.html')) {
      console.log('Redirecting to signin page');
      window.location.href = 'signin.html';
    }
  }
}

// Handle sign out
async function handleSignOut() {
  try {
    await signOut(auth);
    window.location.href = 'signin.html';
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// Update UI elements for authenticated user
function updateAuthenticatedUI(user) {
  // Show user info div and hide person icon
  const userInfoDiv = document.querySelector('.user-info');
  const personIcon = document.querySelector('.bi-person-circle').parentElement;
  
  if (userInfoDiv) {
    userInfoDiv.style.display = 'flex';
  }
  if (personIcon) {
    personIcon.style.display = 'none';
  }
  
  // Update user name display if element exists
  const userNameElement = document.getElementById('user-name');
  if (userNameElement) {
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

//Load user profile data
async function loadUserProfile(userId) {
  try {
    console.log('Loading profile for user ID:', userId);
    const q = query(collection(db, 'userProfiles'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      console.log('User profile data:', userData);
      
      // Update user name in the header if element exists
      const userNameElement = document.getElementById('user-name');
      if (userNameElement && userData.fullName) {
        // Only display the first name
        const firstName = userData.fullName.split(' ')[0];
        userNameElement.innerHTML = `<i class="bi bi-person-circle me-2"></i> ${firstName}`;
        userNameElement.style.fontSize = '1.2rem';
        userNameElement.style.fontWeight = '500';
      } else {
        console.log('User name element not found or no full name available');
      }
    } else {
      console.log('No user profile found in database');
    }
  } catch (error) {
    console.error('Load user profile error:', error);
  }
}

async function handleGoogleSignIn(e) {
  e.preventDefault();
  const provider = new GoogleAuthProvider();
  const errorElement = document.getElementById('signin-error') || document.getElementById('signup-error');
  const isSignUp = window.location.pathname.includes('signup.html');
  
  try {
    // Show loading state
    if (errorElement) {
      errorElement.className = 'verification-message';
      errorElement.innerHTML = `
        <div style="margin-bottom: 10px;">🔄 Connecting to Google...</div>
        <div style="font-style: italic;">Please wait while we connect you to your Google account.</div>
      `;
    }
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Store additional user information in Firestore if it's a new user
    const userProfilesRef = collection(db, 'userProfiles');
    const q = query(userProfilesRef, where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // This is a new user, create their profile
      try {
        await addDoc(userProfilesRef, {
          userId: user.uid,
          email: user.email,
          fullName: user.displayName || user.email.split('@')[0],
          authProvider: 'google',
          emailVerified: true,
          createdAt: new Date(),
          lastSignIn: new Date(),
          lastUpdated: new Date(),
          accountStatus: 'active',
          preferences: {
            darkMode: false,
            notifications: true
          }
        });
        console.log('New user profile created successfully');
      } catch (profileError) {
        console.error('Error creating user profile:', profileError);
        throw new Error('Failed to create user profile. Please try again.');
      }
    } else {
      // Update last sign in for existing user
      const userProfile = querySnapshot.docs[0];
      await updateDoc(doc(db, 'userProfiles', userProfile.id), {
        lastSignIn: new Date(),
        lastUpdated: new Date()
      });
      console.log('Existing user profile updated');
    }
    
    // Clear any error messages
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.className = 'error-message';
    }

    // Redirect to home page
    window.location.href = 'home.html';
    
  } catch (error) {
    console.error('Google sign in error:', error);
    if (errorElement) {
      errorElement.className = 'error-message';
      errorElement.textContent = error.message || 'Failed to sign in with Google. Please try again.';
    }
  }
} 