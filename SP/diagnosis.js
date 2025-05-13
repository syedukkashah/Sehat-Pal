import { parseSymptoms, getDiagnosis, explainSymptom, getSuggestedSymptoms, formatEvidence } from './infermedica-api.js';

// State management for diagnosis session
let diagnosisSession = {
  active: false,
  age: null,
  sex: null,
  symptoms: [],
  currentQuestion: null
};

// Start a new diagnosis session
export async function startDiagnosis() {
  // Reset the session
  diagnosisSession = {
    active: true,
    age: null,
    sex: null,
    symptoms: [],
    currentQuestion: null
  };
  
  return "🩺 Welcome to SehatPal's Symptom Checker\n\nI'll ask you a series of questions to understand your symptoms better.\n\n❓ First, please tell me your age.\n\n💡 Example: '28' or '42 years old'";
}

// Process user input based on the current state of diagnosis
export async function processDiagnosisInput(userInput) {
  if (!diagnosisSession.active) {
    return null; // Not in diagnosis mode
  }
  
  try {
    // Step 1: Collect age
    if (diagnosisSession.age === null) {
      const age = parseInt(userInput);
      if (isNaN(age) || age < 0 || age > 130) {
        return "❌ Please provide a valid age (0-130).\n\n💡 Examples:\n• '28'\n• '42'\n• '35 years old'";
      }
      diagnosisSession.age = age;
      return "❓ Thank you. Please specify your biological sex (male/female) for medical accuracy.\n\n💡 Example: 'male' or 'female'";
    }
    
    // Step 2: Collect biological sex
    if (diagnosisSession.sex === null) {
      const sex = userInput.toLowerCase();
      if (sex === 'male' || sex === 'm') {
        diagnosisSession.sex = 'male';
      } else if (sex === 'female' || sex === 'f') {
        diagnosisSession.sex = 'female';
      } else {
        return "❌ Please specify either 'male' or 'female' for biological sex.\n\n💡 Examples:\n• 'male'\n• 'female'\n• 'm'\n• 'f'";
      }
      
      return "❓ Thank you. Please describe your symptoms briefly.\n\n💡 Examples:\n• 'I have a headache and fever for 2 days'\n• 'My throat hurts when I swallow'\n• 'Stomach pain and nausea since yesterday'";
    }
    
    // If we have a current question, process the answer
    if (diagnosisSession.currentQuestion) {
      return await processAnswer(userInput);
    }
    
    // Otherwise, collect initial symptoms
    return await addSymptomAndGetQuestion(userInput);
  } catch (error) {
    console.error("Error in diagnosis processing:", error);
    return "❌ I encountered an error processing your input. Let's try again.";
  }
}

// Process natural language to extract symptoms
async function addSymptomAndGetQuestion(userInput) {
  try {
    // Use Infermedica API to parse symptoms from text
    const parsedData = await parseSymptoms(
      userInput,
      diagnosisSession.age,
      diagnosisSession.sex
    );
    
    if (parsedData.mentions && parsedData.mentions.length > 0) {
      // Add identified symptoms to our list
      for (const mention of parsedData.mentions) {
        // Check if symptom already exists
        const exists = diagnosisSession.symptoms.some(s => s.id === mention.id);
        if (!exists) {
          diagnosisSession.symptoms.push({
            id: mention.id,
            choice_id: mention.choice_id || 'present',
            source: 'user_input'
          });
        }
      }
      
      // Get the next diagnostic question
      return await getNextQuestion();
    } else {
      return "❌ I couldn't identify any symptoms in your message.\n\n💡 Please be more specific about how you're feeling. Examples:\n• 'I have a fever and sore throat'\n• 'My stomach hurts and I feel nauseous'\n• 'I've been coughing for 3 days and have chest pain'";
    }
  } catch (error) {
    console.error("Error parsing symptoms:", error);
    return "❌ I had trouble understanding your symptoms.\n\n💡 Try to be specific about:\n• What symptoms you're experiencing\n• How long you've had them\n• The severity of each symptom";
  }
}

// Get the next question from the API
async function getNextQuestion() {
  try {
    // Format evidence for the API
    const evidence = formatEvidence(diagnosisSession.symptoms);
    
    // Call the diagnosis endpoint
    const diagnosisData = await getDiagnosis(
      evidence,
      diagnosisSession.age,
      diagnosisSession.sex
    );
    
    // If we have a question, store and display it
    if (diagnosisData.question) {
      diagnosisSession.currentQuestion = diagnosisData.question;
      
      // Format the question text with the question emoji
      let questionText = "❓ " + diagnosisData.question.text;
      
      // Check if this is a question with predefined choices
      const hasChoices = diagnosisData.question.items && diagnosisData.question.items.length > 0;
      
      // Log question details for debugging
      console.log("Question type:", diagnosisData.question.type);
      console.log("Has choices:", hasChoices);
      console.log("Question text:", diagnosisData.question.text);
      if (hasChoices) {
        console.log("Choices:", diagnosisData.question.items.map(item => item.name).join(", "));
      }
      
      // Add examples of expected answers based on question type and content
      if (diagnosisData.question.type === 'single' && hasChoices) {
        // For single choice questions
        questionText += "\n\n📋 Options:";
        diagnosisData.question.items.forEach((item, index) => {
          questionText += `\n${index + 1}. ${item.name}`;
        });
        questionText += "\n\n💡 Please answer with 'yes', 'no', or select a number (e.g., '1', '2').";
        questionText += "\n• You can also say 'I don't know' or 'not sure' if uncertain";
      } else if (diagnosisData.question.type === 'group_single' && hasChoices) {
        // For group single questions
        questionText += "\n\n📋 Options:";
        diagnosisData.question.items.forEach((item, index) => {
          questionText += `\n${index + 1}. ${item.name}`;
        });
        questionText += "\n\n💡 Please select one option by number (e.g., '1', '2').";
        questionText += "\n• You can also say 'none' or 'neither' if none apply";
        questionText += "\n• Or 'I don't know' if you're not sure";
      } else if (diagnosisData.question.type === 'group_multiple' && hasChoices) {
        // For group multiple questions
        questionText += "\n\n📋 Options:";
        diagnosisData.question.items.forEach((item, index) => {
          questionText += `\n${index + 1}. ${item.name}`;
        });
        questionText += "\n\n💡 Please list all that apply by number (e.g., '1, 3', '2 and 4').";
        questionText += "\n• You can also say 'all' or 'none' if applicable";
      } else {
        // Handle free-text questions based on content patterns
        const questionLower = diagnosisData.question.text.toLowerCase();
        
        // Detect question type based on content
        if (questionLower.includes("how long") || questionLower.includes("when did") || 
            questionLower.includes("since when") || questionLower.includes("duration")) {
          // Duration questions
          questionText += "\n\n💡 Please specify the duration. Examples:";
          questionText += "\n• '2 days' or just '2' (I'll assume days)";
          questionText += "\n• 'Since yesterday morning'";
          questionText += "\n• '3-4 hours' or 'several hours'";
          questionText += "\n• '1 week' or just 'a week'";
          questionText += "\n• 'I don't know' if you're not sure";
        } else if (questionLower.includes("how severe") || questionLower.includes("intensity") || 
                  questionLower.includes("how bad") || questionLower.includes("how strong") || 
                  questionLower.includes("how much") || questionLower.includes("rate")) {
          // Severity questions
          questionText += "\n\n💡 Please rate the severity. Examples:";
          questionText += "\n• 'Mild'";
          questionText += "\n• 'Moderate'";
          questionText += "\n• 'Severe'";
          questionText += "\n• 'Very intense'";
          questionText += "\n• Or a number from 1-10 (10 being worst)";
        } else if (questionLower.includes("temperature") || questionLower.includes("fever") || 
                  questionLower.includes("how hot") || questionLower.includes("thermometer")) {
          // Temperature questions
          questionText += "\n\n💡 Please provide your temperature reading or description:";
          questionText += "\n• '38.5°C' or '101.3°F'";
          questionText += "\n• 'High fever' or 'mild fever'";
          questionText += "\n• 'Slight fever' or 'no fever'";
          questionText += "\n• 'I haven't checked' if you don't know";
        } else if (questionLower.includes("where") || questionLower.includes("location") || 
                  questionLower.includes("which part") || questionLower.includes("what area")) {
          // Location questions
          questionText += "\n\n💡 Please specify the location. Examples:";
          questionText += "\n• 'Upper right abdomen'";
          questionText += "\n• 'Behind my left eye'";
          questionText += "\n• 'Lower back'";
          questionText += "\n• 'All over my head'";
          questionText += "\n• 'Moving from one side to another'";
        } else if (questionLower.includes("how often") || questionLower.includes("frequency") || 
                  questionLower.includes("frequently") || questionLower.includes("how many times")) {
          // Frequency questions
          questionText += "\n\n💡 Please describe the frequency. Examples:";
          questionText += "\n• 'Several times a day'";
          questionText += "\n• 'Every hour' or 'hourly'";
          questionText += "\n• 'Constantly' or 'non-stop'";
          questionText += "\n• 'Only at night'";
          questionText += "\n• 'Just once so far'";
        } else if (questionLower.includes("color") || questionLower.includes("appearance") || 
                  questionLower.includes("look like") || questionLower.includes("describe")) {
          // Appearance questions
          questionText += "\n\n💡 Please describe the appearance in detail. Examples:";
          questionText += "\n• 'Yellow-greenish'";
          questionText += "\n• 'Clear with some blood'";
          questionText += "\n• 'Dark and tarry'";
          questionText += "\n• 'Watery and clear'";
          questionText += "\n• 'Haven't noticed' if you're not sure";
        } else if (questionLower.includes("vomiting") || questionLower.includes("throwing up") || 
                  questionLower.includes("nausea")) {
          // Vomiting-specific questions
          questionText += "\n\n💡 Please describe your vomiting. Examples:";
          questionText += "\n• 'Started yesterday, about 3 times so far'";
          questionText += "\n• 'Every hour for the past 6 hours'";
          questionText += "\n• 'Once this morning, hasn't happened again'";
          questionText += "\n• 'Continuously for the past day'";
          questionText += "\n• 'With blood' or 'yellow fluid' (if applicable)";
        } else {
          // Generic response for other question types
          questionText += "\n\n💡 Please provide a clear, specific answer to help with diagnosis.";
          questionText += "\n• Be brief but include important details";
          questionText += "\n• You can say 'I don't know' if you're not sure";
        }
      }
      
      // If we have potential conditions, show them
      if (diagnosisData.conditions && diagnosisData.conditions.length > 0) {
        const topConditions = diagnosisData.conditions.slice(0, 3);
        questionText += "\n\n📊 Possible matches based on your symptoms:";
        topConditions.forEach((condition, index) => {
          const matchPercent = Math.round(condition.probability * 100);
          questionText += `\n➡️ ${condition.name} (Your symptoms match ${matchPercent}% with this condition)`;
        });
      }
      
      return questionText;
    } 
    
    // If we have conditions but no more questions, show final diagnosis
    if (diagnosisData.conditions && diagnosisData.conditions.length > 0) {
      diagnosisSession.active = false;
      
      const topConditions = diagnosisData.conditions.slice(0, 3);
      let result = "📊 Based on your symptoms, here are the possible conditions:\n\n";
      
      topConditions.forEach((condition, index) => {
        const matchPercent = Math.round(condition.probability * 100);
        result += `➡️ ${condition.name} - Your symptoms match ${matchPercent}% with this condition`;
        if (condition.common_name) {
          result += `\n   ℹ️ Commonly known as: ${condition.common_name}`;
        }
        result += "\n\n";
      });
      
      result += "⚠️ IMPORTANT: This is not a medical diagnosis. Please consult with a healthcare professional.";
      
      return result;
    }
    
    // No conditions found
    diagnosisSession.active = false;
    return "❌ I don't have enough information to suggest a diagnosis.\n\n⚠️ Please consult with a healthcare professional for proper evaluation.";
  } catch (error) {
    console.error("Error getting next question:", error);
    return "❌ I encountered a problem with the diagnosis process. Let's try again.";
  }
}

// Process answers to questions
async function processAnswer(userInput) {
  try {
    const question = diagnosisSession.currentQuestion;
    diagnosisSession.currentQuestion = null;
    
    // Handle "I don't know" or unclear answers
    const lowerInput = userInput.toLowerCase().trim();
    if (lowerInput === "i don't know" || lowerInput === "dont know" || lowerInput === "don't know" || 
        lowerInput === "not sure" || lowerInput === "unsure" || lowerInput === "idk") {
      
      // Add symptom with 'unknown' choice for this question
      if (question.items) {
        for (const item of question.items) {
          diagnosisSession.symptoms.push({
            id: item.id,
            choice_id: 'unknown',
            source: 'user_input'
          });
        }
      }
      
      return await getNextQuestion();
    }
    
    // Process single choice questions
    if (question.type === 'single') {
      let choiceId = null;
      
      // Check if user entered a number
      const optionIndex = parseInt(userInput) - 1;
      if (!isNaN(optionIndex) && optionIndex >= 0 && optionIndex < question.items.length) {
        choiceId = 'present';
      } 
      // Check for yes/no responses
      else if (lowerInput.includes('yes') || lowerInput === 'y') {
        choiceId = 'present';
      } else if (lowerInput.includes('no') || lowerInput === 'n') {
        choiceId = 'absent';
      } else {
        // Check for exact text matches with options
        for (let i = 0; i < question.items.length; i++) {
          if (question.items[i].name.toLowerCase() === lowerInput) {
            choiceId = 'present';
            break;
          }
        }
        
        if (!choiceId) {
          // Couldn't parse the answer
          return "❌ I didn't understand your answer.\n\n💡 Please reply with:\n• 'yes' or 'no'\n• A number (e.g., '1')\n• Or 'I don't know' if you're not sure";
        }
      }
      
      // Add to evidence
      for (const item of question.items) {
        diagnosisSession.symptoms.push({
          id: item.id,
          choice_id: choiceId,
          source: 'question'
        });
      }
    } else if (question.type === 'group_single' || question.type === 'group_multiple') {
      // Handle none/neither responses
      if (lowerInput === 'none' || lowerInput === 'neither' || lowerInput === 'none of these' || 
          lowerInput === 'none of the above') {
        // Mark all options as absent
        for (const item of question.items) {
          diagnosisSession.symptoms.push({
            id: item.id,
            choice_id: 'absent',
            source: 'question'
          });
        }
      } 
      // Handle 'all' responses for group_multiple
      else if (question.type === 'group_multiple' && 
              (lowerInput === 'all' || lowerInput === 'all of them' || lowerInput === 'all of the above')) {
        // Mark all options as present
        for (const item of question.items) {
          diagnosisSession.symptoms.push({
            id: item.id,
            choice_id: 'present',
            source: 'question'
          });
        }
      }
      // Handle number selections
      else {
        // Parse numbers from response (e.g., "1, 3" or "2 and 4")
        const numberPattern = /\d+/g;
        const matches = lowerInput.match(numberPattern);
        
        if (!matches || matches.length === 0) {
          // Couldn't parse any numbers
          return "❌ I didn't understand your selection.\n\n💡 Please respond with:\n• Number(s) from the options list (e.g., '1' or '1, 3')\n• 'None' if none apply\n• 'All' if all apply (for multiple choice)\n• 'I don't know' if you're not sure";
        }
        
        // Process selected numbers
        const selectedIndices = matches.map(num => parseInt(num) - 1);
        
        // For group_single, only use the first selection
        if (question.type === 'group_single' && selectedIndices.length > 0) {
          selectedIndices.splice(1); // Keep only the first selection
        }
        
        // Mark selected options as present, others as absent
        for (let i = 0; i < question.items.length; i++) {
          diagnosisSession.symptoms.push({
            id: question.items[i].id,
            choice_id: selectedIndices.includes(i) ? 'present' : 'absent',
            source: 'question'
          });
        }
      }
    }
    
    // Get next question
    return await getNextQuestion();
  } catch (error) {
    console.error("Error processing answer:", error);
    return "❌ I had trouble understanding your answer. Please try again with a clearer response.";
  }
}

// Check if a diagnosis session is active
export function isInDiagnosis() {
  return diagnosisSession.active;
}

// End the current diagnosis session
export function endDiagnosis() {
  diagnosisSession.active = false;
  return "✅ Diagnosis session ended.\n\nYou can start a new one anytime by typing 'diagnose me'.";
} 