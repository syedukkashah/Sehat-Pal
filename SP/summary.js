// at top of records.js (or summary.js)
import { auth, db,
    collection, query, where,
    orderBy, limit, getDocs }
 from './firebase.js';

// helper to format the recordDate exactly like your formatDate above
function formatDate(dateString) {
const d = new Date(dateString);
return d.toLocaleDateString(undefined, {
year: 'numeric', month: 'long', day: 'numeric'
});
}

// ▶︎ Load and display the most recent blood pressure, heart rate, and weight records into your summary boxes
export async function loadSummaryBoxes() {
  if (!auth.currentUser) return;
  const q = query(
    collection(db, 'medicalRecords'),
    where('userId', '==', auth.currentUser.uid),
    limit(100) // fetch more in case some records are missing fields
  );
  const snap = await getDocs(q);

  // Gather all records and sort by recordDate (descending)
  const allRecords = [];
  snap.forEach(doc => {
    const data = doc.data();
    if (data.recordDate) {
      allRecords.push({ ...data });
    }
  });
  allRecords.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));

  // Find the most recent for each metric
  let latestBP = null, latestHR = null, latestWeight = null;
  for (const rec of allRecords) {
    if (!latestBP && rec.bloodPressure) latestBP = rec;
    if (!latestHR && rec.heartRate) latestHR = rec;
    if (!latestWeight && rec.weight) latestWeight = rec;
    if (latestBP && latestHR && latestWeight) break;
  }

  // Fill the boxes
  const boxes = [1,2,3].map(i => document.getElementById(`summary-box-${i}`));

  // Box 1: Blood Pressure
  if (boxes[0]) {
    boxes[0].querySelector('.box-title').textContent  = 'blood pressure';
    boxes[0].querySelector('.box-value').textContent  = latestBP ? `${latestBP.bloodPressure} mmHg` : '—';
    boxes[0].querySelector('.box-status').textContent = latestBP && latestBP.recordDate ? `date: ${formatDate(latestBP.recordDate)}` : '—';
  }
  // Box 2: Heart Rate
  if (boxes[1]) {
    boxes[1].querySelector('.box-title').textContent  = 'heart rate';
    boxes[1].querySelector('.box-value').textContent  = latestHR ? `${latestHR.heartRate} bpm` : '—';
    boxes[1].querySelector('.box-status').textContent = latestHR && latestHR.recordDate ? `date: ${formatDate(latestHR.recordDate)}` : '—';
  }
  // Box 3: Weight
  if (boxes[2]) {
    boxes[2].querySelector('.box-title').textContent  = 'weight';
    boxes[2].querySelector('.box-value').textContent  = latestWeight ? `${latestWeight.weight} kg` : '—';
    boxes[2].querySelector('.box-status').textContent = latestWeight && latestWeight.recordDate ? `date: ${formatDate(latestWeight.recordDate)}` : '—';
  }
}
