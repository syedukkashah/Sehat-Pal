// WARNING: This approach exposes your API key in the frontend code
// Only use this for educational/demo purposes

const INFERMEDICA_APP_ID = "700efbc5";  // Your App ID
const INFERMEDICA_APP_KEY = "e9ba22397f798c58459d4003aed6284a"; // Your App Key

// Main API call function
async function callInfermedicaApi(endpoint, data) {
  try {
    const response = await fetch(`https://api.infermedica.com/v3/${endpoint}`, {
      method: 'POST',
      headers: {
        'App-Id': INFERMEDICA_APP_ID,
        'App-Key': INFERMEDICA_APP_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Infermedica API error:", error);
    throw error;
  }
}

// Specific API endpoints
export async function parseSymptoms(text, age, sex) {
  return callInfermedicaApi('parse', {
    text: text,
    age: { value: age },
    sex: sex
  });
}

export async function getDiagnosis(evidence, age, sex) {
  return callInfermedicaApi('diagnosis', {
    evidence: evidence,
    age: { value: age },
    sex: sex
  });
}

export async function explainSymptom(symptomId) {
  return callInfermedicaApi('explain', {
    id: symptomId,
    choiceId: 'present'
  });
}

export async function getSuggestedSymptoms(evidence, age, sex) {
  return callInfermedicaApi('suggest', {
    evidence: evidence,
    age: { value: age },
    sex: sex
  });
}

// Helper to format evidence
export function formatEvidence(symptoms) {
  return symptoms.map(symptom => ({
    id: symptom.id,
    choice_id: symptom.choice_id
  }));
} 