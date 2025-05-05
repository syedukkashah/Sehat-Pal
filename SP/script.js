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
const searchBar = document.getElementById("searchBar"); // you forgot to define this globally!

// Helper function to close the search bar
function closeSearchBar() {
  searchBarWrap.classList.remove("active");
  searchOverlay.classList.remove("active");
}

// Helper function to trigger shake animation
function shakeSearchBar() {
  searchBarWrap.classList.add("shake");
  setTimeout(() => {
    searchBarWrap.classList.remove("shake");
  }, 400);
}

// Open/close on icon click
searchIcon.addEventListener("click", e => {
  e.preventDefault();
  searchBarWrap.classList.toggle("active");
  searchOverlay.classList.toggle("active");
  e.stopPropagation();
});

// Hide search bar when clicking outside
document.addEventListener("click", function (event) {
  const hasText = searchBar.value.trim().length > 0;

  if (!searchBarWrap.contains(event.target) && !searchIcon.contains(event.target)) {
    if (!hasText) {
      closeSearchBar();
    } else {
      shakeSearchBar();
    }
  }
});

// Hide search bar when pressing Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const hasText = searchBar.value.trim().length > 0;

    if (!hasText) {
      closeSearchBar();
    } else {
      shakeSearchBar();
    }
  }
});

// Submit button behavior
searchSubmit.addEventListener("click", e => {
  e.preventDefault();
  const query = searchBar.value.trim();

  if (query) {
    console.log("search for", query);
    closeSearchBar();
  } else {
    shakeSearchBar();
  }
});





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

  toggleBtn.addEventListener('click', () => {
    const hidden = historyPanel.classList.toggle('collapsed');
    toggleBtn.innerHTML = hidden
      ? '<i class="bi bi-chevron-right"></i>'
      : '<i class="bi bi-chevron-left"></i>';
  });
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
  // 1) Grab their email from ?email=... in the URL
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email') || '';

  // 2) Update the checkbox label
  const confirmLabel = document.getElementById('confirmEmailLabel');
  confirmLabel.textContent = 'Confirm Email: ' + (email || '[no email supplied]');

  // 3) Disable the "Save New Password" link until checked
  const saveLink = document.querySelector('.btn-login');
  // stash the real target
  const targetHref = saveLink.getAttribute('href');
  saveLink.removeAttribute('href');
  saveLink.classList.add('disabled');
  saveLink.setAttribute('aria-disabled', 'true');

  // 4) Wire up the checkbox
  const confirmCb = document.getElementById('confirmEmailCheckbox');
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
});

const MIN_DISPLAY_TIME = 5000; // ms
const startTime = Date.now();

const pre = document.getElementById('preloader');
const main = document.getElementById('main-content');
const bar = document.querySelector('.loading-progress');
const status = document.querySelector('.loading-status');

const statusPct = document.querySelector('.status-pct');

// ❶ Kick off the progress updater
function updateProgress() {
  const elapsed = Date.now() - startTime;
  const pct = Math.min(100, Math.floor((elapsed / MIN_DISPLAY_TIME) * 100));
  bar.style.width = pct + '%';
  statusPct.textContent = pct + '%';

  if (elapsed < MIN_DISPLAY_TIME) {
    requestAnimationFrame(updateProgress);
  }
}
requestAnimationFrame(updateProgress);

// ❷ When the page fully loads, ensure we're at 100%, then fade out
window.addEventListener('load', () => {
  // snap to full bar/text
  bar.style.width = '100%';
  statusPct.textContent = '100%';

  const elapsed = Date.now() - startTime;
  const waitFor = Math.max(0, MIN_DISPLAY_TIME - elapsed);

  setTimeout(() => {
    pre.classList.add('fade-out');
    setTimeout(() => {
      pre.remove();
      main.classList.remove('hidden');
    }, 600); // match your fade-out duration
  }, waitFor);
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
  bubble.textContent = text;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);

  scrollToBottom();
}

// ❼ Stubbed "getBotReply" – replace with real API call
async function getBotReply(userText) {
  // TODO: replace with actual fetch/WebSocket call
  return `🤖 You said: "${userText}"`;
}

// Chatbot functionality - Only initialize if we're on the chatbot page
document.addEventListener('DOMContentLoaded', () => {
  // Check if chat elements exist before trying to use them
  const sendBtn = document.getElementById("sendBtn");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");
  
  if (sendBtn && chatInput && chatMessages) {
    // Initialize chat if all elements exist
    
    // Create first message in the chat
    if (chatMessages.children.length === 0) {
      appendBotMessage("Hi, I'm SehatPal! How can I help you today?");
    }
    
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
      // Initialize chat history
      if (Object.keys(sessions).length === 0) {
        createNewSession();
      } else {
        renderHistory();
        loadSession(currentSessionId || Object.keys(sessions)[0]);
      }
      
      // Set up new chat button
      newChatBtn.addEventListener('click', createNewSession);
    }
  }
});

// ── Chat History Functionality ──
let isReplaying = false;

// ❶ Session storage in memory
const sessions = {};          // { sessionId: [ {from:'user'|'bot', text}, ... ] }
let currentSessionId = null;  // e.g. 'Chat 1'

// grab the DOM nodes
const historyList = document.getElementById('chatHistoryList');
const newChatBtn  = document.getElementById('newChatBtn');

// ❷ Create a new session
function createNewSession() {
  // name = Chat 1, Chat 2, …
  const id = `Chat ${Object.keys(sessions).length + 1}`;

  // seed with exactly one welcome message
  sessions[id] = [
    { from: 'bot',
      text: "Hi, I'm SehatPal! How can I help you today?" }
  ];

  currentSessionId = id;
  renderHistory();
  loadSession(id);
}

// ❸ Render the history panel
// function renderHistory() {
//   historyList.innerHTML = '';
//   Object.keys(sessions).forEach(id => {
//     const li = document.createElement('li');
//     li.className = 'list-group-item d-flex align-items-center';
//     li.textContent = id;
//     li.addEventListener('click', () => loadSession(id));
//     if (id === currentSessionId) {
//       li.classList.add('active');  // highlight current
//     }
//     historyList.appendChild(li);
//   });
// }
// ── Render the history panel with rename icons ──
// function renderHistory() {
//   historyList.innerHTML = '';

//   Object.keys(sessions).forEach(oldId => {
//     const li = document.createElement('li');
//     li.className = 'list-group-item d-flex align-items-center justify-content-between';

//     // 1) Label
//     const label = document.createElement('span');
//     label.textContent = oldId;
//     label.className = oldId === currentSessionId ? 'fw-bold' : '';
//     label.contentEditable = false;
//     label.spellcheck = false;
//     label.style.minWidth = '60px';
//     label.style.outline = 'none';

//     // commitRename as before…
//     function commitRename() {
//       label.contentEditable = false;
//       const newName = label.textContent.trim();
//       if (!newName || newName === oldId) {
//         label.textContent = oldId;
//       } else if (!(newName in sessions)) {
//         sessions[newName] = sessions[oldId];
//         delete sessions[oldId];
//         if (currentSessionId === oldId) currentSessionId = newName;
//       }
//       renderHistory();
//     }
//     label.addEventListener('blur', commitRename);
//     label.addEventListener('keydown', e => {
//       if (e.key === 'Enter') {
//         e.preventDefault();
//         label.blur();
//       }
//     });

//     li.appendChild(label);

//     // 2) Pencil icon for renaming
//     const editIcon = document.createElement('i');
//     editIcon.className = 'fa-solid fa-pen-to-square ms-2 text-secondary';
//     editIcon.style.cursor = 'pointer';
//     editIcon.title = 'Rename chat';
//     editIcon.addEventListener('click', e => {
//       e.stopPropagation();
//       label.contentEditable = true;
//       label.focus();
//       const sel = document.getSelection();
//       sel.collapse(label.firstChild, label.textContent.length);
//     });
//     li.appendChild(editIcon);

//     // 3) Trash icon for deletion
//     const deleteIcon = document.createElement('i');
//     deleteIcon.className = 'bi bi-trash-fill ms-2 text-danger';
//     deleteIcon.style.cursor = 'pointer';
//     deleteIcon.title = 'Delete chat';
//     deleteIcon.addEventListener('click', e => {
//       e.stopPropagation();
//       // remove session
//       delete sessions[oldId];
//       // if it was current, pick another or clear
//       const keys = Object.keys(sessions);
//       currentSessionId = keys.length
//         ? keys[ keys.indexOf(oldId) > 0 ? keys.indexOf(oldId)-1 : 0 ]
//         : null;
//       renderHistory();
//       if (currentSessionId) loadSession(currentSessionId);
//       else chatMessages.innerHTML = '';  // no sessions left
//     });
//     li.appendChild(deleteIcon);

//     // 4) Clicking row loads session
//     li.addEventListener('click', e => {
//       if (e.target === editIcon || e.target === deleteIcon) return;
//       loadSession(oldId);
//     });

//     historyList.appendChild(li);
//   });
// }
// Modular renderHistory with custom delete confirmation
function renderHistory() {
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
    });
    iconContainer.appendChild(editIcon);

    // Trash icon for deletion
    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'bi bi-trash-fill text-secondary';
    deleteIcon.style.cursor = 'pointer';
    deleteIcon.title = 'Delete chat';
    deleteIcon.addEventListener('click', e => {
      // e.stopPropagation();
      // showDeleteConfirm(oldId);
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

document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
  if (!deleteTargetId) return;
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
  currentSessionId = id;
  
  // make current session active in UI
  renderHistory();

  // clear the chat window
  chatMessages.innerHTML = '';

  // re-append the static welcome (optional)
  //appendBotMessage("Hi, I'm SehatPal! How can I help you today?");
  
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
  }
}

// ❺ Hook into your existing appenders to record messages
// keep originals
const _appendUser = appendUserMessage;
appendUserMessage = function(text) {
  _appendUser(text);
  if(!isReplaying){
    sessions[currentSessionId].push({from:'user', text});
  }
};

const _appendBot = appendBotMessage;
appendBotMessage = function(text) {
  _appendBot(text);
  if(!isReplaying){
    sessions[currentSessionId].push({from:'bot', text});
  }
};


// ❻ Wire up "New Chat" button
// newChatBtn.addEventListener('click', () => {
//   createNewSession();
// });

// ❼ On page load: kick off the very first session
createNewSession();


