import { auth, db, collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, deleteDoc } from './firebase.js';

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

  // Add validation functions
  const hba1cInput = document.getElementById('hba1c');
  const cholesterolInput = document.getElementById('cholesterol');
  const bloodSugarInput = document.getElementById('blood-sugar');
  const temperatureInput = document.getElementById('temperature');

  if (hba1cInput) {
    hba1cInput.addEventListener('input', (e) => {
      const validation = validateHBA1C(e.target.value);
      const validationDiv = document.getElementById('hba1c-validation');
      updateValidationMessage(validationDiv, validation);
    });
  }

  if (cholesterolInput) {
    cholesterolInput.addEventListener('input', (e) => {
      const validation = validateCholesterol(e.target.value);
      const validationDiv = document.getElementById('cholesterol-validation');
      updateValidationMessage(validationDiv, validation);
    });
  }

  if (bloodSugarInput) {
    bloodSugarInput.addEventListener('input', (e) => {
      const validation = validateBloodSugar(e.target.value);
      const validationDiv = document.getElementById('blood-sugar-validation');
      updateValidationMessage(validationDiv, validation);
    });
  }

  if (temperatureInput) {
    temperatureInput.addEventListener('input', (e) => {
      const validation = validateTemperature(e.target.value);
      const validationDiv = document.getElementById('temperature-validation');
      updateValidationMessage(validationDiv, validation);
    });
  }
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
    const bloodSugar = document.getElementById('blood-sugar').value;
    
    if (!recordType || !recordDate) {
      alert('Record type and date are required fields');
      return;
    }

    // Validate blood sugar only if provided (optional)
    if (bloodSugar) {
      const bloodSugarValidation = validateBloodSugar(bloodSugar);
      if (!bloodSugarValidation.isValid) {
        alert(bloodSugarValidation.message);
        return;
      }
    }
    
    // Validate temperature if provided
    const temperature = document.getElementById('temperature').value;
    if (temperature) {
      const temperatureValidation = validateTemperature(temperature);
      if (!temperatureValidation.isValid) {
        alert(temperatureValidation.message);
        return;
      }
    }
    
    const recordData = {
      userId: auth.currentUser.uid,
      recordType: recordType,
      recordDate: recordDate,
      bloodPressure: document.getElementById('blood-pressure').value,
      heartRate: document.getElementById('heart-rate').value ? parseInt(document.getElementById('heart-rate').value) : null,
      temperature: temperature ? parseFloat(temperature) : null,
      weight: document.getElementById('weight').value ? parseFloat(document.getElementById('weight').value) : null,
      hba1c: document.getElementById('hba1c').value ? parseFloat(document.getElementById('hba1c').value) : null,
      cholesterol: document.getElementById('cholesterol').value ? parseInt(document.getElementById('cholesterol').value) : null,
      bloodSugar: bloodSugar ? parseInt(bloodSugar) : null,
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
    // Hide the no records message immediately when records are found
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

    updateSummaryBoxes(records);
    
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
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary view-details-btn">View Details</button>
            <button class="btn btn-sm btn-outline-primary edit-record-btn">Edit Record</button>
            <button class="btn btn-sm btn-outline-danger delete-record-btn">Delete</button>
          </div>
        </div>
      `;
      
      // Add event listener to the View Details button
      recordCol.appendChild(recordCard);
      recordsList.appendChild(recordCol);
      
      // Add click event for the View Details button
      const viewDetailsBtn = recordCard.querySelector('.view-details-btn');
      viewDetailsBtn.addEventListener('click', () => {
        showRecordDetails(record);
      });

      // Add click event for the Edit Record button
      const editRecordBtn = recordCard.querySelector('.edit-record-btn');
      editRecordBtn.addEventListener('click', () => {
        showEditRecordForm(record);
      });

      // Add click event for the Delete Record button
      const deleteRecordBtn = recordCard.querySelector('.delete-record-btn');
      deleteRecordBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
          await deleteRecord(record.id);
        }
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
    
    // Get validation classes for values
    const hba1cValidation = validateHBA1C(record.hba1c);
    const cholesterolValidation = validateCholesterol(record.cholesterol);
    const bloodSugarValidation = validateBloodSugar(record.bloodSugar);
    const temperatureValidation = validateTemperature(record.temperature);
    
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
        <p class="${temperatureValidation.isCritical ? 'critical-high' : temperatureValidation.isLow ? 'critical-low' : temperatureValidation.isNormal ? 'normal-range' : ''}">
          ${record.temperature} °F
          ${temperatureValidation.condition ? `<span class="condition-label">${temperatureValidation.condition}</span>` : ''}
        </p>
      </div>
      ` : ''}
      ${record.weight ? `
      <div class="record-detail-item">
        <h4>Weight</h4>
        <p>${record.weight} kg</p>
      </div>
      ` : ''}
      ${record.hba1c ? `
      <div class="record-detail-item">
        <h4>HBA1C Level</h4>
        <p class="${hba1cValidation.isCritical ? 'critical-high' : hba1cValidation.isNormal ? 'normal-range' : ''}">
          ${record.hba1c}%
          ${hba1cValidation.condition ? `<span class="condition-label">${hba1cValidation.condition}</span>` : ''}
        </p>
      </div>
      ` : ''}
      ${record.cholesterol ? `
      <div class="record-detail-item">
        <h4>Cholesterol Level</h4>
        <p class="${cholesterolValidation.isCritical ? 'critical-high' : cholesterolValidation.isNormal ? 'normal-range' : ''}">
          ${record.cholesterol} mg/dL
          ${cholesterolValidation.condition ? `<span class="condition-label">${cholesterolValidation.condition}</span>` : ''}
        </p>
      </div>
      ` : ''}
      ${record.bloodSugar ? `
      <div class="record-detail-item">
        <h4>Blood Sugar Level</h4>
        <p class="${bloodSugarValidation.isCritical ? 'critical-high' : bloodSugarValidation.isLow ? 'critical-low' : bloodSugarValidation.isNormal ? 'normal-range' : ''}">
          ${record.bloodSugar} mg/dL
          ${bloodSugarValidation.condition ? `<span class="condition-label">${bloodSugarValidation.condition}</span>` : ''}
        </p>
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

// Fill the three summary boxes with the first 3 records
function updateSummaryBoxes(records) {
  const ids = ['summary-box-1','summary-box-2','summary-box-3'];
  ids.forEach((boxId, i) => {
    const box = document.getElementById(boxId);
    if (!box) return;
    const record = records[i];
    if (!record) {
      // no record → show dashes
      box.querySelector('.box-title').textContent  = '—';
      box.querySelector('.box-value').textContent  = '—';
      box.querySelector('.box-status').textContent = '—';
    } else {
      box.querySelector('.box-title').textContent  = record.recordType || '—';
      // choose one metric—here weight or bloodPressure for example
      const val = record.weight
        ? `${record.weight} kg`
        : record.bloodPressure
          ? record.bloodPressure
          : '—';
      box.querySelector('.box-value').textContent  = val;
      box.querySelector('.box-status').textContent = `last updated: ${formatDate(record.recordDate)}`;
    }
  });
}

// Add new function to handle editing records
async function showEditRecordForm(record) {
  try {
    const addRecordModal = document.getElementById('add-record-modal');
    const addRecordForm = document.getElementById('add-record-form');
    const modalTitle = addRecordModal.querySelector('.modal2-header h2');
    
    // Change modal title
    modalTitle.textContent = 'Edit Medical Record';
    
    // Fill form with existing record data
    document.getElementById('record-type').value = record.recordType || '';
    document.getElementById('record-date').value = record.recordDate || '';
    document.getElementById('blood-pressure').value = record.bloodPressure || '';
    document.getElementById('heart-rate').value = record.heartRate || '';
    document.getElementById('temperature').value = record.temperature || '';
    document.getElementById('weight').value = record.weight || '';
    document.getElementById('hba1c').value = record.hba1c || '';
    document.getElementById('cholesterol').value = record.cholesterol || '';
    document.getElementById('blood-sugar').value = record.bloodSugar != null ? record.bloodSugar : '';
    document.getElementById('symptoms').value = record.symptoms || '';
    document.getElementById('diagnosis').value = record.diagnosis || '';
    document.getElementById('medications').value = record.medications ? record.medications.join('\n') : '';
    document.getElementById('doctor-name').value = record.doctorName || '';
    document.getElementById('facility').value = record.facility || '';
    document.getElementById('notes').value = record.notes || '';
    
    // Show the modal
    addRecordModal.classList.remove('hidden');
    
    // Remove any existing submit handlers
    const newForm = addRecordForm.cloneNode(true);
    addRecordForm.parentNode.replaceChild(newForm, addRecordForm);
    
    // Add new submit handler for editing
    newForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!auth.currentUser) {
        alert('You must be logged in to edit a record');
        return;
      }
      
      try {
        // Get form values
        const recordData = {
          userId: auth.currentUser.uid,
          recordType: document.getElementById('record-type').value,
          recordDate: document.getElementById('record-date').value,
          bloodPressure: document.getElementById('blood-pressure').value,
          heartRate: document.getElementById('heart-rate').value ? parseInt(document.getElementById('heart-rate').value) : null,
          temperature: document.getElementById('temperature').value ? parseFloat(document.getElementById('temperature').value) : null,
          weight: document.getElementById('weight').value ? parseFloat(document.getElementById('weight').value) : null,
          hba1c: document.getElementById('hba1c').value ? parseFloat(document.getElementById('hba1c').value) : null,
          cholesterol: document.getElementById('cholesterol').value ? parseInt(document.getElementById('cholesterol').value) : null,
          bloodSugar: document.getElementById('blood-sugar').value ? parseInt(document.getElementById('blood-sugar').value) : null,
          symptoms: document.getElementById('symptoms').value,
          diagnosis: document.getElementById('diagnosis').value,
          medications: document.getElementById('medications').value.split('\n').filter(med => med.trim() !== ''),
          doctorName: document.getElementById('doctor-name').value,
          facility: document.getElementById('facility').value,
          notes: document.getElementById('notes').value,
          updatedAt: new Date()
        };
        
        // Update the record in Firestore
        await updateRecord(record.id, recordData);
        
        // Reset form and close modal
        newForm.reset();
        addRecordModal.classList.add('hidden');
        
        // Reset modal title
        modalTitle.textContent = 'Add Medical Record';
        
        // Reload records to update the UI
        await loadMedicalRecordsForUser(auth.currentUser.uid);
        
        // Show success message
        alert('Medical record updated successfully!');
      } catch (error) {
        console.error('Update record error:', error);
        alert('Error updating record: ' + error.message);
      }
    });
  } catch (error) {
    console.error('Error showing edit form:', error);
    alert('Error loading record for editing: ' + error.message);
  }
}

// Add function to update record in Firestore
async function updateRecord(recordId, recordData) {
  try {
    if (!auth.currentUser) {
      throw new Error('You must be logged in to update records');
    }
    
    // Update the record in Firestore
    await updateDoc(doc(db, 'medicalRecords', recordId), recordData);
    console.log('Record updated successfully');
  } catch (error) {
    console.error('Update record error:', error);
    throw error;
  }
}

// Add function to delete record in Firestore
async function deleteRecord(recordId) {
  try {
    if (!auth.currentUser) {
      throw new Error('You must be logged in to delete records');
    }
    await deleteDoc(doc(db, 'medicalRecords', recordId));
    // Reload records to update the UI
    await loadMedicalRecordsForUser(auth.currentUser.uid);
    alert('Medical record deleted successfully!');
  } catch (error) {
    console.error('Delete record error:', error);
    alert('Error deleting record: ' + error.message);
  }
}

// Add validation functions
function validateHBA1C(value) {
  if (!value) return { isValid: true, message: '', condition: '' };
  const num = parseFloat(value);
  if (num < 5 || num > 15) {
    return { isValid: false, message: 'HBA1C must be between 5% and 15%', condition: '' };
  }
  if (num > 10) {
    return { 
      isValid: true, 
      message: 'Critical: HBA1C level is high', 
      isCritical: true,
      condition: 'Diabetic'
    };
  }
  return { isValid: true, message: 'Normal range', isNormal: true, condition: '' };
}

function validateCholesterol(value) {
  if (!value) return { isValid: true, message: '', condition: '' };
  const num = parseInt(value);
  if (num < 9 || num > 700) {
    return { isValid: false, message: 'Cholesterol must be between 9 and 700 mg/dL', condition: '' };
  }
  if (num > 240) {
    return { 
      isValid: true, 
      message: 'Critical: Cholesterol level is high', 
      isCritical: true,
      condition: 'Hypercholesterolemia'
    };
  }
  return { isValid: true, message: 'Normal range', isNormal: true, condition: '' };
}

function validateBloodSugar(value) {
  if (!value) return { isValid: true, message: '', condition: '' };
  const num = parseInt(value);
  if (num < 70 || num > 600) {
    return { isValid: false, message: 'Blood sugar must be between 70 and 600 mg/dL', condition: '' };
  }
  if (num > 200) {
    return { 
      isValid: true, 
      message: 'Critical: Blood sugar level is high', 
      isCritical: true,
      condition: 'Hyperglycemia'
    };
  } else if (num < 100) {
    return { 
      isValid: true, 
      message: 'Critical: Blood sugar level is low', 
      isLow: true,
      condition: 'Hypoglycemia'
    };
  }
  return { isValid: true, message: 'Normal range', isNormal: true, condition: '' };
}

function validateTemperature(value) {
  if (!value) return { isValid: true, message: '', condition: '' };
  const num = parseFloat(value);
  if (num < 90 || num > 110) {
    return { isValid: false, message: 'Temperature must be between 90°F and 110°F', condition: '' };
  }
  if (num > 100.4) {
    return { 
      isValid: true, 
      message: 'Critical: Temperature indicates fever', 
      isCritical: true,
      condition: 'Fever'
    };
  } else if (num < 95) {
    return { 
      isValid: true, 
      message: 'Critical: Temperature indicates hypothermia', 
      isLow: true,
      condition: 'Hypothermia'
    };
  }
  return { isValid: true, message: 'Normal range', isNormal: true, condition: '' };
}

function updateValidationMessage(element, validation) {
  if (!element) return;
  
  element.textContent = validation.message;
  element.className = 'validation-message';
  
  if (!validation.isValid) {
    element.classList.add('error');
  } else if (validation.isCritical) {
    element.classList.add('error');
  } else if (validation.isLow) {
    element.classList.add('warning');
  } else if (validation.isNormal) {
    element.classList.add('success');
  }
}
