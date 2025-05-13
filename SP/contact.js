import { db, collection, addDoc } from "./firebase.js";

// Add event listener when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, setting up contact form...');
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        console.log('Contact form found, adding submit listener');
        contactForm.addEventListener('submit', handleContactSubmit);
    } else {
        console.error('Contact form not found!');
    }
});

async function handleContactSubmit(event) {
    event.preventDefault();
    console.log('Form submission started');
    
    try {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;

        if (!name || !email || !phone || !message) {
            console.error('Missing form fields');
            alert('Please fill in all fields');
            return;
        }

        console.log('Form data collected:', { name, email, phone, message });

        // Store in Firestore
        console.log('Attempting to store in Firestore...');
        const contactSubmissionsRef = collection(db, 'contact_submissions');
        console.log('Collection reference created');
        
        const docRef = await addDoc(contactSubmissionsRef, {
            name,
            email,
            phone,
            message,
            timestamp: new Date()
        });
        console.log('Document written with ID:', docRef.id);

        // Clear form
        document.getElementById('contactForm').reset();
        
        // Show success message
        alert('Thank you for your message! We will get back to you soon.');
    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        alert('There was an error submitting your message. Please try again later.');
    }
} 