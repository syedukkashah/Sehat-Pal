import { auth, db, collection, addDoc, getDocs, query, where, orderBy } from './firebase.js';

// Make loadMedicalRecords available globally
window.loadMedicalRecords = loadMedicalRecords;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the medical records page
  const addRecordBtn = document.getElementById('add-record-btn');
  if (!addRecordBtn) return;

  const addRecordModal = document.getElementById('add-record-modal');
  const recordDetailsModal = document.getElementById('record-details-modal');
  const addRecordForm = document.getElementById('add-record-form');
  const recordsList = document.getElementById('records-list');
  const noRecordsMessage = document.getElementById('no-records-message');
  const closeModalButtons = document.querySelectorAll('.close-modal');

  // Event listeners
  addRecordBtn.addEventListener('click', () => {
    addRecordForm.reset();
    addRecordModal.classList.remove('hidden');
  });

  closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      addRecordModal.classList.add('hidden');
      recordDetailsModal.classList.add('hidden');
    });
  });

  addRecordForm.addEventListener('submit', handleAddRecord);

  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === addRecordModal) {
      addRecordModal.classList.add('hidden');
    } else if (e.target === recordDetailsModal) {
      recordDetailsModal.classList.add('hidden');
    }
  });

  // Load medical records once the page is loaded
  loadMedicalRecords();
  
  // Dispatch event to notify auth.js that records.js is loaded
  window.dispatchEvent(new Event('recordsJSLoaded'));
});

// Handle adding a new record
async function handleAddRecord(e) {
  e.preventDefault();
  
  if (!auth.currentUser) {
    alert('You must be logged in to add a record');
    return;
  }
  
  try {
    // Get form values
    const recordType = document.getElementById('record-type').value;
    const recordDate = document.getElementById('record-date').value;
    
    if (!recordType || !recordDate) {
      alert('Record type and date are required fields');
      return;
    }
    
    const recordData = {
      userId: auth.currentUser.uid,
      recordType: recordType,
      recordDate: recordDate,
      bloodPressure: document.getElementById('blood-pressure').value,
      heartRate: document.getElementById('heart-rate').value ? parseInt(document.getElementById('heart-rate').value) : null,
      temperature: document.getElementById('temperature').value ? parseFloat(document.getElementById('temperature').value) : null,
      weight: document.getElementById('weight').value ? parseFloat(document.getElementById('weight').value) : null,
      symptoms: document.getElementById('symptoms').value,
      diagnosis: document.getElementById('diagnosis').value,
      medications: document.getElementById('medications').value.split('\n').filter(med => med.trim() !== ''),
      doctorName: document.getElementById('doctor-name').value,
      facility: document.getElementById('facility').value,
      notes: document.getElementById('notes').value,
      createdAt: new Date()
    };
    
    // Save the record
    await saveRecord(recordData);
  } catch (error) {
    console.error('Add record error:', error);
    alert('Error adding record: ' + error.message);
  }
}

// Save record to Firestore
async function saveRecord(recordData) {
  try {
    if (!auth.currentUser) {
      throw new Error('You must be logged in to save records');
    }
    
    // Add the record to Firestore
    const docRef = await addDoc(collection(db, 'medicalRecords'), recordData);
    console.log('Record saved with ID:', docRef.id);
    
    // Reset form and close modal
    document.getElementById('add-record-form').reset();
    document.getElementById('add-record-modal').classList.add('hidden');

    // Reload medical records to update the UI
    await loadMedicalRecordsForUser(auth.currentUser.uid);
    
    // Show a success message
    alert('Medical record added successfully!');
  } catch (error) {
    console.error('Save record error:', error);
    alert('Error saving record: ' + error.message);
  }
}

// Load user's medical records
async function loadMedicalRecords() {
  // Check if user is authenticated
  if (!auth.currentUser) {
    console.log('Waiting for authentication before loading records...');
    
    // Wait for auth state to resolve
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe(); // Stop listening to prevent multiple calls
        
        if (user) {
          console.log('User authenticated, loading records...');
          // User is now authenticated, load records
          loadMedicalRecordsForUser(user.uid).then(resolve);
        } else {
          console.log('No authenticated user found');
          resolve();
        }
      });
    });
  } else {
    // User is already authenticated
    console.log('User already authenticated, loading records...');
    return loadMedicalRecordsForUser(auth.currentUser.uid);
  }
}

// Function to load records for a specific user ID
async function loadMedicalRecordsForUser(userId) {
  try {
    const recordsList = document.getElementById('records-list');
    const noRecordsMessage = document.getElementById('no-records-message');
    
    if (!recordsList || !noRecordsMessage) return;
    
    console.log('Querying records for user:', userId);
    
    // Query for user's records
    const q = query(
      collection(db, 'medicalRecords'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Clear previous content
    recordsList.innerHTML = '';
    
    if (querySnapshot.empty) {
      console.log('No records found');
      noRecordsMessage.classList.remove('hidden');
      return;
    }
    
    console.log(`Found ${querySnapshot.docs.length} records`);
    noRecordsMessage.classList.add('hidden');
    
    // Sort records manually after fetching
    const records = [];
    querySnapshot.forEach((doc) => {
      records.push({ ...doc.data(), id: doc.id });
    });
    
    // Sort by recordDate (newest first)
    records.sort((a, b) => {
      const dateA = new Date(a.recordDate || 0);
      const dateB = new Date(b.recordDate || 0);
      return dateB - dateA;
    });
    
    // Display the sorted records
    records.forEach(record => {
      const recordCol = document.createElement('div');
      recordCol.className = 'col';
      
      const recordCard = document.createElement('div');
      recordCard.className = 'card h-100';
      
      const formattedDate = formatDate(record.recordDate);
      
      recordCard.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${record.recordType || 'Unknown Type'}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${formattedDate}</h6>
          <p class="card-text">
            ${record.doctorName ? `Doctor: ${record.doctorName}<br>` : ''}
            ${record.diagnosis ? `Diagnosis: ${record.diagnosis}` : ''}
          </p>
          <button class="btn btn-sm btn-outline-primary view-details-btn">View Details</button>
        </div>
      `;
      
      // Add event listener to the View Details button
      recordCol.appendChild(recordCard);
      recordsList.appendChild(recordCol);
      
      // Add click event for the whole card
      const viewDetailsBtn = recordCard.querySelector('.view-details-btn');
      viewDetailsBtn.addEventListener('click', () => {
        showRecordDetails(record);
      });
    });
  } catch (error) {
    console.error('Load records error:', error);
    const noRecordsMessage = document.getElementById('no-records-message');
    if (noRecordsMessage) {
      noRecordsMessage.textContent = 'Error loading records. Please try again.';
      noRecordsMessage.classList.remove('hidden');
    }
  }
}

// Show record details in modal
function showRecordDetails(record) {
  try {
    const recordDetailsContent = document.getElementById('record-details-content');
    const recordDetailsModal = document.getElementById('record-details-modal');
    
    if (!recordDetailsContent || !recordDetailsModal) return;
    
    if (!record) {
      recordDetailsContent.innerHTML = '<p>Error: Record data is missing</p>';
      recordDetailsModal.classList.remove('hidden');
      return;
    }
    
    // Format date
    const formattedDate = formatDate(record.recordDate);
    
    recordDetailsContent.innerHTML = `
      <div class="record-detail-item">
        <h4>Record Type</h4>
        <p>${record.recordType || 'N/A'}</p>
      </div>
      <div class="record-detail-item">
        <h4>Date</h4>
        <p>${formattedDate}</p>
      </div>
      ${record.bloodPressure ? `
      <div class="record-detail-item">
        <h4>Blood Pressure</h4>
        <p>${record.bloodPressure} mmHg</p>
      </div>
      ` : ''}
      ${record.heartRate ? `
      <div class="record-detail-item">
        <h4>Heart Rate</h4>
        <p>${record.heartRate} bpm</p>
      </div>
      ` : ''}
      ${record.temperature ? `
      <div class="record-detail-item">
        <h4>Temperature</h4>
        <p>${record.temperature} °F</p>
      </div>
      ` : ''}
      ${record.weight ? `
      <div class="record-detail-item">
        <h4>Weight</h4>
        <p>${record.weight} kg</p>
      </div>
      ` : ''}
      ${record.symptoms ? `
      <div class="record-detail-item">
        <h4>Symptoms</h4>
        <p>${record.symptoms}</p>
      </div>
      ` : ''}
      ${record.diagnosis ? `
      <div class="record-detail-item">
        <h4>Diagnosis</h4>
        <p>${record.diagnosis}</p>
      </div>
      ` : ''}
      ${record.medications && record.medications.length > 0 ? `
      <div class="record-detail-item">
        <h4>Medications</h4>
        <ul>
          ${record.medications.map(med => `<li>${med}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
      ${record.doctorName ? `
      <div class="record-detail-item">
        <h4>Doctor</h4>
        <p>${record.doctorName}</p>
      </div>
      ` : ''}
      ${record.facility ? `
      <div class="record-detail-item">
        <h4>Healthcare Facility</h4>
        <p>${record.facility}</p>
      </div>
      ` : ''}
      ${record.notes ? `
      <div class="record-detail-item">
        <h4>Additional Notes</h4>
        <p>${record.notes}</p>
      </div>
      ` : ''}
    `;
    
    recordDetailsModal.classList.remove('hidden');
  } catch (error) {
    console.error('Error showing record details:', error);
  }
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return 'No Date';
  
  try {
    // Handle different date formats
    let date;
    
    // Check if it's a timestamp object from Firestore
    if (dateString && typeof dateString === 'object' && dateString.toDate) {
      date = dateString.toDate();
    } else {
      // Try to create a date from the string
      date = new Date(dateString);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date format:', dateString);
      return String(dateString);
    }
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return String(dateString) || 'Unknown Date';
  }
} 