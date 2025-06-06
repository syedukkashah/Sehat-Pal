document.addEventListener("DOMContentLoaded", () => {
  const checkbox = document.getElementById("modeToggle");
  const body     = document.body;
  const KEY      = "sehatpalDarkMode";

  // Init from storage or system preference
  const saved = localStorage.getItem(KEY);
  const dark  = saved === "dark"
              || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (dark) {
    body.classList.add("dark-mode");
    checkbox.checked = true;
  }

  // Toggle on click
  checkbox.addEventListener("change", () => {
    const isDark = checkbox.checked;
    body.classList.toggle("dark-mode", isDark);
    localStorage.setItem(KEY, isDark ? "dark" : "light");
  });
});




const searchIcon = document.getElementById("searchIcon");
const searchBarWrap = document.getElementById("searchBarContainer");
const searchOverlay = document.getElementById("searchOverlay");
const searchSubmit = document.getElementById("searchSubmit");
const searchBar = document.getElementById("searchBar"); 

// Helper function to close the search bar
// function closeSearchBar() {
//   searchBarWrap.classList.remove("active");
//   searchOverlay.classList.remove("active");
// }

// // Helper function to trigger shake animation
// function shakeSearchBar() {
//   searchBarWrap.classList.add("shake");
//   setTimeout(() => {
//     searchBarWrap.classList.remove("shake");
//   }, 400);
// }

// // Open/close on icon click
// searchIcon.addEventListener("click", e => {
//   e.preventDefault();
//   searchBarWrap.classList.toggle("active");
//   searchOverlay.classList.toggle("active");
//   e.stopPropagation();
// });

// // Hide search bar when clicking outside
// document.addEventListener("click", function (event) {
//   const hasText = searchBar.value.trim().length > 0;

//   if (!searchBarWrap.contains(event.target) && !searchIcon.contains(event.target)) {
//     if (!hasText) {
//       closeSearchBar();
//     } else {
//       shakeSearchBar();
//     }
//   }
// });

// // Hide search bar when pressing Escape key
// document.addEventListener("keydown", function (event) {
//   if (event.key === "Escape") {
//     const hasText = searchBar.value.trim().length > 0;

//     if (!hasText) {
//       closeSearchBar();
//     } else {
//       shakeSearchBar();
//     }
//   }
// });

// // Submit button behavior
// searchSubmit.addEventListener("click", e => {
//   e.preventDefault();
//   const query = searchBar.value.trim();

//   if (query) {
//     console.log("search for", query);
//     closeSearchBar();
//   } else {
//     shakeSearchBar();
//   }
// });





document.addEventListener("DOMContentLoaded", function () {
  const button = document.querySelector(".custom-btn-3");
  const arrow = document.querySelector(".arrow-icon");

  button.addEventListener("mousedown", function () {
    arrow.style.transform = "translateX(10px)";
    arrow.style.transition = "transform 0.2s ease-in-out";
  });

  button.addEventListener("mouseup", function () {
    arrow.style.transform = "translateX(0)";
  });

  button.addEventListener("mouseleave", function () {
    arrow.style.transform = "translateX(0)";
  });
});


const animatedElements = document.querySelectorAll('.animate');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      const delay = index * 200; // 100ms staggered delay
      setTimeout(() => {
        entry.target.classList.add('show');
      }, delay);
      observer.unobserve(entry.target); // optional: remove if you want to re-trigger on scroll
    }
  });
}, {
  threshold: 0.1
});

animatedElements.forEach(el => observer.observe(el));

const animatedEls = document.querySelectorAll('.section1-content.animate');


document.addEventListener('DOMContentLoaded', () => {
  const historyPanel = document.getElementById('chatHistoryPanel');
  const toggleBtn = document.getElementById('toggleHistory');

  if (historyPanel && toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const hidden = historyPanel.classList.toggle('collapsed');
      toggleBtn.innerHTML = hidden
        ? '<i class="bi bi-chevron-right"></i>'
        : '<i class="bi bi-chevron-left"></i>';
    });
  }
});


document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.information-box').forEach(box => {
    const btn = box.querySelector('.edit-btn');
    const inputs = box.querySelectorAll('.info-input');
    const footer = box.querySelector('.last-updated');

    btn.addEventListener('click', () => {
      const editing = btn.getAttribute('data-editing') === 'true';

      if (!editing) {
        // Enter edit mode
        inputs.forEach(input => input.removeAttribute('readonly'));
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        btn.setAttribute('data-editing', 'true');
      } else {
        // Save mode
        inputs.forEach(input => input.setAttribute('readonly', ''));
        btn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
        btn.setAttribute('data-editing', 'false');

        const now = new Date();
        footer.textContent = 'Last updated: ' + now.toLocaleString();
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // Only run this code on the password reset page
  if (window.location.pathname.includes('reset-password.html')) {
    // 1) Grab their email from ?email=... in the URL
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email') || '';

    // 2) Update the checkbox label
    const confirmLabel = document.getElementById('confirmEmailLabel');
    if (confirmLabel) {
      confirmLabel.textContent = 'Confirm Email: ' + (email || '[no email supplied]');
    }

    // 3) Disable the "Save New Password" link until checked
    const saveLink = document.querySelector('.btn-login');
    if (saveLink) {
      // stash the real target
      const targetHref = saveLink.getAttribute('href');
      saveLink.removeAttribute('href');
      saveLink.classList.add('disabled');
      saveLink.setAttribute('aria-disabled', 'true');

      // 4) Wire up the checkbox
      const confirmCb = document.getElementById('confirmEmailCheckbox');
      if (confirmCb) {
        confirmCb.addEventListener('change', () => {
          if (confirmCb.checked) {
            saveLink.setAttribute('href', targetHref);
            saveLink.classList.remove('disabled');
            saveLink.removeAttribute('aria-disabled');
          } else {
            saveLink.removeAttribute('href');
            saveLink.classList.add('disabled');
            saveLink.setAttribute('aria-disabled', 'true');
          }
        });
      }
    }
  }
});

// ── Chat "Send" Logic ──

// ❶ Grab chat elements
const sendBtn      = document.getElementById("sendBtn");
const chatInput    = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

// ❷ Utility: scroll to bottom
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ❸ Utility: append a user bubble
function appendUserMessage(text) {
  const wrapper = document.createElement("div");
  wrapper.className = "message-wrapper user-wrapper d-flex justify-content-end mb-3";

  const bubble = document.createElement("div");
  bubble.className = "message user p-1";
  bubble.textContent = text;

  const avatar = document.createElement("img");
  avatar.src = "imgs/user-avatar.png"; 
  avatar.alt = "You";
  avatar.className = "avatar";

  wrapper.appendChild(bubble);
  wrapper.appendChild(avatar);
  chatMessages.appendChild(wrapper);

  scrollToBottom();
}

// ❻ Helper to append a bot bubble
function appendBotMessage(text) {
  const wrapper = document.createElement("div");
  wrapper.className = "message-wrapper bot-wrapper d-flex mb-3";

  const avatar = document.createElement("img");
  avatar.src = "imgs/sehatpal - logo - black.png";
  avatar.alt = "SehatPal";
  avatar.className = "avatar";

  const bubble = document.createElement("div");
  bubble.className = "message bot p-1";
  
  // Add specific classes based on message content
  if (text.includes("❓")) {
    bubble.classList.add("question-message");
  } else if (text.includes("📊")) {
    bubble.classList.add("diagnosis-message");
  } else if (text.includes("❌")) {
    bubble.classList.add("error-message");
  }
  
  // Process text by lines
  let lastLineHadEmoji = false;
  const formattedText = text.split('\n').map((line, index) => {
    // Skip empty lines
    if (!line.trim()) {
      return '<br>';
    }
    
    // Add extra styling for bullet points
    if (line.trim().startsWith('•')) {
      return `<span class="ms-2">${line}</span>`;
    }
    
    // Check if this line starts with an emoji
    const startsWithEmoji = /^[\u{1F300}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/u.test(line.trim());
    
    // Add section break class if this line starts with emoji and previous line didn't
    if (startsWithEmoji && !lastLineHadEmoji && index > 0) {
      lastLineHadEmoji = true;
      // Replace the emoji with a span-wrapped version
      const emojiMatch = line.match(/^([\u{1F300}-\u{1F6FF}]|[\u{2600}-\u{26FF}])/u);
      if (emojiMatch) {
        const emoji = emojiMatch[0];
        const restOfLine = line.slice(emoji.length);
        return `<span class="emoji-section-start"><span class="emoji">${emoji}</span>${restOfLine}</span>`;
      }
    }
    
    lastLineHadEmoji = startsWithEmoji;
    
    // Enhance emojis with special class
    return line.replace(/([\u{1F300}-\u{1F6FF}]|[\u{2600}-\u{26FF}])/gu, '<span class="emoji">$1</span>');
  }).join('<br>');
  
  // Use innerHTML instead of textContent to render formatted text
  bubble.innerHTML = formattedText;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);

  scrollToBottom();
}

// Import the diagnosis module
import { startDiagnosis, processDiagnosisInput, isInDiagnosis, endDiagnosis } from './diagnosis.js';

// Import chat persistence module
import { 
  saveChatSession, 
  saveChatMessage, 
  loadChatSessions, 
  loadChatMessages, 
  deleteChatSession, 
  renameChatSession 
} from './chatPersistence.js';

import { auth, onAuthStateChanged } from './firebase.js';

// ❼ Enhanced "getBotReply" with diagnosis capability
async function getBotReply(userText) {
  // Check for diagnosis commands
  const lowerText = userText.toLowerCase();
  
  if (lowerText === 'diagnose me' || lowerText === 'check symptoms' || lowerText.includes('diagnose')) {
    return await startDiagnosis();
  }
  
  if (lowerText === 'stop diagnosis' || lowerText === 'cancel') {
    if (isInDiagnosis()) {
      return endDiagnosis();
    }
    return "❌ No active diagnosis session to cancel.";
  }
  
  // If we're in an active diagnosis, process input through the diagnosis system
  if (isInDiagnosis()) {
    return await processDiagnosisInput(userText);
  }
  
  // Default responses for non-diagnosis mode
  if (lowerText.includes('hello') || lowerText.includes('hi')) {
    return "👋 Hello! I'm SehatPal, your health assistant. How can I help you today?";
  }
  
  if (lowerText.includes('help')) {
    return "ℹ️ I can help you diagnose symptoms. Here are your options:\n\n💡 Type 'diagnose me' to start the symptom checker\n💡 Answer my questions about your symptoms\n💡 Type 'cancel' to stop a diagnosis at any time\n\nHow can I assist you today?";
  }
  
  // Default fallback
  return "👋 I'm here to help with medical concerns.\n\n💡 Type 'diagnose me' to check your symptoms\n💡 Type 'help' to see all available options";
}

// ── Chat History Functionality ──
let isReplaying = false;

// ❶ Session storage in memory
const sessions = {};          // { sessionId: [ {from:'user'|'bot', text}, ... ] }
let currentSessionId = null;  // e.g. 'Chat 1'

// Mapping between local session IDs and Firestore session IDs
let sessionMapping = {};    // { localSessionId: firestoreId }

// grab the DOM nodes
const historyList = document.getElementById('chatHistoryList');
const newChatBtn  = document.getElementById('newChatBtn');

// ❷ Create a new session
async function createNewSession() {
  // name = Chat 1, Chat 2, …
  const id = `Chat ${Object.keys(sessions).length + 1}`;

  // seed with exactly one welcome message
  sessions[id] = [
    { from: 'bot',
      text: "👋 Hello! I'm SehatPal, your health assistant. How can I help you today?\nYou can type in 'diagnose me' to get started.\nDISCLAIMER:\nThis is NOT a substitute for a medical diagnosis.\nPlease seek professional help from a licensed medical person/doctor." }
  ];

  currentSessionId = id;
  renderHistory();
  loadSession(id);
  
  // Save the new session to Firestore
  if (auth.currentUser) {
    try {
      const firestoreId = await saveChatSession(id, id);
      if (firestoreId) {
        sessionMapping[id] = firestoreId;
        
        // Save the welcome message
        await saveChatMessage(firestoreId, 'bot', "👋 Hello! I'm SehatPal, your health assistant. How can I help you today?\nYou can type in 'diagnose me' to get started.\nDISCLAIMER:\nThis is NOT a substitute for a medical diagnosis.\nPlease seek professional help from a licensed medical person/doctor.");
      }
    } catch (error) {
      console.error('Error saving new session:', error);
    }
  }
}

// Modular renderHistory with custom delete confirmation
async function renderHistory() {
  if (!historyList) return;
  historyList.innerHTML = '';

  Object.keys(sessions).forEach(oldId => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center justify-content-between position-relative';

    // Label
    const label = document.createElement('span');
    label.textContent = oldId;
    label.className = `${oldId === currentSessionId ? 'fw-bold' : ''}`;
    li.appendChild(label);

    // Icon container (hidden by default, shown on hover)
    const iconContainer = document.createElement('div');
    iconContainer.className = 'd-flex align-items-center gap-2 opacity-0';
    iconContainer.style.transition = 'opacity 0.2s';

    // Pencil icon for renaming
    const editIcon = document.createElement('i');
    editIcon.className = 'fa-solid fa-pen-to-square text-secondary';
    editIcon.style.cursor = 'pointer';
    editIcon.title = 'Rename chat';
    editIcon.addEventListener('click', e => {
      e.stopPropagation();
      label.contentEditable = true;
      label.focus();
      const sel = document.getSelection();
      sel.collapse(label.firstChild, label.textContent.length);
      
      function commitRename() {
        label.contentEditable = false;
        const newName = label.textContent.trim();
        if (!newName || newName === oldId) {
          label.textContent = oldId;
        } else {
          // Rename in memory
          sessions[newName] = sessions[oldId];
          delete sessions[oldId];
          if (currentSessionId === oldId) currentSessionId = newName;
          
          // Rename in Firestore if authenticated
          if (auth.currentUser && sessionMapping[oldId]) {
            renameChatSession(sessionMapping[oldId], newName)
              .then(success => {
                if (success) {
                  // Update the mapping
                  sessionMapping[newName] = sessionMapping[oldId];
                  delete sessionMapping[oldId];
                }
              })
              .catch(error => console.error('Error renaming chat:', error));
          }
        }
        renderHistory();
      }
      
      label.addEventListener('blur', commitRename);
      label.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          label.blur();
        }
      });
    });
    iconContainer.appendChild(editIcon);

    // Trash icon for deletion
    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'bi bi-trash-fill text-secondary';
    deleteIcon.style.cursor = 'pointer';
    deleteIcon.title = 'Delete chat';
    deleteIcon.addEventListener('click', e => {
      e.stopPropagation();
      const chatName = label.textContent.trim();
      showDeleteConfirm(oldId, chatName);
    });
    iconContainer.appendChild(deleteIcon);

    li.appendChild(iconContainer);

    // Show icons on hover
    li.addEventListener('mouseenter', () => iconContainer.classList.replace('opacity-0','opacity-100'));
    li.addEventListener('mouseleave', () => iconContainer.classList.replace('opacity-100','opacity-0'));

    // Clicking row loads session
    li.addEventListener('click', () => {
      if (oldId !== currentSessionId) loadSession(oldId);
    });

    historyList.appendChild(li);
  });
}

// Custom modal for delete confirmation
document.body.insertAdjacentHTML('beforeend', `
  <div class="modal fade" id="deleteConfirmModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Confirm Deletion</h2>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body text-center">
          <h4 id="confirmMessage">Are you sure you want to delete this chat?</4>
        </div>
        <div class="modal-footer justify-content-center">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" id="confirmDeleteBtn" class="btn btn-danger">Delete</button>
        </div>
      </div>
    </div>
  </div>
`);

let deleteTargetId = null;
function showDeleteConfirm(sessionId, displayName) {
  deleteTargetId = sessionId;
  document.getElementById('confirmMessage').textContent = `Delete "${displayName}" and all its messages?`;
  new bootstrap.Modal(document.getElementById('deleteConfirmModal')).show();
}

document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  if (!deleteTargetId) return;
  
  // Delete the session from Firestore if authenticated
  if (auth.currentUser && sessionMapping[deleteTargetId]) {
    try {
      await deleteChatSession(sessionMapping[deleteTargetId]);
      delete sessionMapping[deleteTargetId];
    } catch (error) {
      console.error('Error deleting chat session:', error);
    }
  }
  
  // Delete from memory
  delete sessions[deleteTargetId];
  const keys = Object.keys(sessions);
  currentSessionId = keys.length ? keys[0] : null;
  renderHistory();
  if (currentSessionId) loadSession(currentSessionId);
  else chatMessages.innerHTML = '';
  deleteTargetId = null;
  bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();
});

// ❹ Load a session's messages into the chat window
function loadSession(id) {
  if (!chatMessages) return;
  currentSessionId = id;
  
  // make current session active in UI
  renderHistory();

  // clear the chat window
  chatMessages.innerHTML = '';

  // replay each saved message
  if (sessions[id] && sessions[id].length > 0) {
    isReplaying = true;
    sessions[id].forEach(message => {
      if (message.from === 'user') {
        appendUserMessage(message.text);
      } else {
        appendBotMessage(message.text);
      }
    });
    isReplaying = false;
  } else {
    // If no messages, add a default welcome message
    console.log("No messages found for session, adding default welcome");
    isReplaying = true;
    const welcomeMsg = "👋 Hello! I'm SehatPal, your health assistant. How can I help you today?\nYou can type in 'diagnose me' to get started.\nDISCLAIMER: This is NOT a substitute for a medical diagnosis.\nPlease seek professional help from a licensed medical person/doctor.";
    appendBotMessage(welcomeMsg);
    sessions[id] = [{ from: 'bot', text: welcomeMsg }];
    isReplaying = false;
  }
}

// ❺ Hook into your existing appenders to record messages
// keep originals
const _appendUser = appendUserMessage;
appendUserMessage = async function(text) {
  _appendUser(text);
  if(!isReplaying){
    sessions[currentSessionId].push({from:'user', text});
    
    // Save to Firestore if authenticated
    if (auth.currentUser && sessionMapping[currentSessionId]) {
      try {
        await saveChatMessage(sessionMapping[currentSessionId], 'user', text);
      } catch (error) {
        console.error('Error saving user message:', error);
      }
    }
  }
};

const _appendBot = appendBotMessage;
appendBotMessage = async function(text) {
  _appendBot(text);
  if(!isReplaying){
    sessions[currentSessionId].push({from:'bot', text});
    
    // Save to Firestore if authenticated
    if (auth.currentUser && sessionMapping[currentSessionId]) {
      try {
        await saveChatMessage(sessionMapping[currentSessionId], 'bot', text);
      } catch (error) {
        console.error('Error saving bot message:', error);
      }
    }
  }
};

// Load chat history from Firestore when authenticated
async function loadChatHistoryFromFirestore() {
  if (!auth.currentUser) return;
  
  try {
    // Clear any existing sessions
    Object.keys(sessions).forEach(id => delete sessions[id]);
    sessionMapping = {};
    
    // Load all sessions
    const userSessions = await loadChatSessions();
    
    if (userSessions.length === 0) {
      // No sessions found, create a new one
      createNewSession();
      return;
    }
    
    // Process each session
    for (const session of userSessions) {
      // Create local session
      const localId = session.localId || `Chat ${Object.keys(sessions).length + 1}`;
      sessions[localId] = [];
      sessionMapping[localId] = session.id;
      
      // Load messages for this session
      const messages = await loadChatMessages(session.id);
      
      // Add messages to local storage
      messages.forEach(msg => {
        sessions[localId].push({
          from: msg.from,
          text: msg.text
        });
      });
    }
    
    // Set current session to the first one
    currentSessionId = Object.keys(sessions)[0];
    renderHistory();
    loadSession(currentSessionId);
  } catch (error) {
    console.error('Error loading chat history:', error);
    // Clear any existing sessions first to prevent state conflicts
    Object.keys(sessions).forEach(id => delete sessions[id]);
    sessionMapping = {};
    // Create a new fresh session
    createNewSession();
  }
}

// Listen for auth state changes to load chat history
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, load their chat history
    loadChatHistoryFromFirestore();
  } else {
    // User is signed out
    if (window.location.pathname.includes('chatbot.html')) {
      // If we're on the chatbot page, create a new session (for guest use)
      createNewSession();
    }
  }
});

// Chatbot functionality - Only initialize if we're on the chatbot page
document.addEventListener('DOMContentLoaded', () => {
  // Check if chat elements exist before trying to use them
  const sendBtn = document.getElementById("sendBtn");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");
  
  if (sendBtn && chatInput && chatMessages) {
    // Initialize chat if all elements exist
    
    // Create first message in the chat will be handled by auth state change
    
    // ❽ Single async handler for send
    sendBtn.addEventListener("click", async () => {
      const text = chatInput.value.trim();
      if (!text) return;          // ignore empty
    
      // 1️⃣ add user message
      appendUserMessage(text);
      chatInput.value = "";
      chatInput.focus();
    
      // 2️⃣ get & add bot reply
      const botReply = await getBotReply(text);
      appendBotMessage(botReply);
    });
    
    // also send on Enter key
    chatInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendBtn.click();
      }
    });
    
    // Chat history functionality - only initialize if elements exist
    const historyList = document.getElementById('chatHistoryList');
    const newChatBtn = document.getElementById('newChatBtn');
    
    if (historyList && newChatBtn) {
      // Initialize chat history will be handled by auth state change
      
      // Set up new chat button
      newChatBtn.addEventListener('click', createNewSession);
    }
  }
});

import { loadSummaryBoxes } from './summary.js';

document.addEventListener('DOMContentLoaded', () => {
  // Only run on home page
  if (document.getElementById('summary-box-1')) {
    // Wait for Firebase auth to be ready
    import('./firebase.js').then(({ auth, onAuthStateChanged }) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          loadSummaryBoxes();
        }
      });
    });
  }
});

// Add event listener for "Go to Login" button
document.addEventListener('DOMContentLoaded', () => {
  // Add event listener for "Go to Login" button
  const goToLoginBtn = document.getElementById('go-to-login');
  if (goToLoginBtn) {
    goToLoginBtn.addEventListener('click', () => {
      window.location.href = 'signin.html';
    });
  }
});


