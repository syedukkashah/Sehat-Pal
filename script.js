// IndexedDB Setup
const DB_NAME = "sehatpalDB";
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject("Failed to open database");
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore("users", { keyPath: "email" });
      db.createObjectStore("medicalRecords", { keyPath: "userEmail" });
      db.createObjectStore("chatHistory", { keyPath: "userEmail" });
    };
  });
}

// IndexedDB Helpers
async function saveUser(user) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["users"], "readwrite");
    const store = transaction.objectStore("users");
    const request = store.put(user);
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Failed to save user");
  });
}

async function getUser(email) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["users"], "readonly");
    const store = transaction.objectStore("users");
    const request = store.get(email);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Failed to get user");
  });
}

async function saveMedicalRecords(userEmail, records) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["medicalRecords"], "readwrite");
    const store = transaction.objectStore("medicalRecords");
    const request = store.put({ userEmail, records });
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Failed to save medical records");
  });
}

async function getMedicalRecords(userEmail) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["medicalRecords"], "readonly");
    const store = transaction.objectStore("medicalRecords");
    const request = store.get(userEmail);
    request.onsuccess = () => resolve(request.result?.records || {});
    request.onerror = () => reject("Failed to get medical records");
  });
}

async function saveChatHistory(userEmail, conversation) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["chatHistory"], "readwrite");
    const store = transaction.objectStore("chatHistory");
    const request = store.put({ userEmail, conversation });
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Failed to save chat history");
  });
}

async function getChatHistory(userEmail) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["chatHistory"], "readonly");
    const store = transaction.objectStore("chatHistory");
    const request = store.get(userEmail);
    request.onsuccess = () => resolve(request.result?.conversation || []);
    request.onerror = () => reject("Failed to get chat history");
  });
}

// Authentication
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.querySelector("#signupForm");
  const signinForm = document.querySelector("#signinForm");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = signupForm.querySelector("#email").value;
      const password = signupForm.querySelector("#password").value;
      const confirmPassword = signupForm.querySelector("#confirmPassword").value;
      const age = signupForm.querySelector("#age").value;
      const sex = signupForm.querySelector("#sex").value;
      const allergies = signupForm.querySelector("#allergies").value;
      const conditions = signupForm.querySelector("#conditions").value;

      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      const user = {
        email,
        password,
        medicalHistory: { age: parseInt(age), sex, allergies, conditions }
      };

      try {
        await saveUser(user);
        await saveMedicalRecords(email, { age, sex, allergies, conditions });
        localStorage.setItem("currentUser", email);
        window.location.href = "home.html";
      } catch (error) {
        alert("Error signing up: " + error);
      }
    });
  }

  if (signinForm) {
    signinForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = signinForm.querySelector("#email").value;
      const password = signinForm.querySelector("#password").value;

      try {
        const user = await getUser(email);
        if (user && user.password === password) {
          localStorage.setItem("currentUser", email);
          window.location.href = "home.html";
        } else {
          alert("Invalid email or password");
        }
      } catch (error) {
        alert("Error signing in: " + error);
      }
    });
  }
});

// Existing Functionality (Search, Dark Mode, etc.)
document.addEventListener("DOMContentLoaded", () => {
  const checkbox = document.getElementById("modeToggle");
  const body = document.body;
  const KEY = "sehatpalDarkMode";

  const saved = localStorage.getItem(KEY);
  const dark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (dark) {
    body.classList.add("dark-mode");
    checkbox.checked = true;
  }

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

function closeSearchBar() {
  searchBarWrap.classList.remove("active");
  searchOverlay.classList.remove("active");
}

function shakeSearchBar() {
  searchBarWrap.classList.add("shake");
  setTimeout(() => searchBarWrap.classList.remove("shake"), 400);
}

searchIcon.addEventListener("click", (e) => {
  e.preventDefault();
  searchBarWrap.classList.toggle("active");
  searchOverlay.classList.toggle("active");
  e.stopPropagation();
});

document.addEventListener("click", (event) => {
  const hasText = searchBar.value.trim().length > 0;
  if (!searchBarWrap.contains(event.target) && !searchIcon.contains(event.target)) {
    if (!hasText) closeSearchBar();
    else shakeSearchBar();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    const hasText = searchBar.value.trim().length > 0;
    if (!hasText) closeSearchBar();
    else shakeSearchBar();
  }
});

searchSubmit.addEventListener("click", (e) => {
  e.preventDefault();
  const query = searchBar.value.trim();
  if (query) {
    console.log("search for", query);
    closeSearchBar();
  } else {
    shakeSearchBar();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector(".custom-btn-3");
  const arrow = document.querySelector(".arrow-icon");
  if (button && arrow) {
    button.addEventListener("mousedown", () => {
      arrow.style.transform = "translateX(10px)";
      arrow.style.transition = "transform 0.2s ease-in-out";
    });
    button.addEventListener("mouseup", () => {
      arrow.style.transform = "translateX(0)";
    });
    button.addEventListener("mouseleave", () => {
      arrow.style.transform = "translateX(0)";
    });
  }
});

const animatedElements = document.querySelectorAll(".animate");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const delay = index * 200;
        setTimeout(() => entry.target.classList.add("show"), delay);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);
animatedElements.forEach((el) => observer.observe(el));

document.addEventListener("DOMContentLoaded", () => {
  const historyPanel = document.getElementById("chatHistoryPanel");
  const toggleBtn = document.getElementById("toggleHistory");
  if (historyPanel && toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const hidden = historyPanel.classList.toggle("collapsed");
      toggleBtn.innerHTML = hidden ? '<i class="bi bi-chevron-right"></i>' : '<i class="bi bi-chevron-left"></i>';
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".information-box").forEach((box) => {
    const btn = box.querySelector(".edit-btn");
    const inputs = box.querySelectorAll(".info-input");
    const footer = box.querySelector(".last-updated");
    if (btn && footer) {
      btn.addEventListener("click", () => {
        const editing = btn.getAttribute("data-editing") === "true";
        if (!editing) {
          inputs.forEach((input) => input.removeAttribute("readonly"));
          btn.innerHTML = '<i class="fa-solid fa-check"></i>';
          btn.setAttribute("data-editing", "true");
        } else {
          inputs.forEach((input) => input.setAttribute("readonly", ""));
          btn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
          btn.setAttribute("data-editing", "false");
          const now = new Date();
          footer.textContent = "Last updated: " + now.toLocaleString();
        }
      });
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const email = params.get("email") || "";
  const confirmLabel = document.getElementById("confirmEmailLabel");
  if (confirmLabel) {
    confirmLabel.textContent = "Confirm Email: " + (email || "[no email supplied]");
  }
  const saveLink = document.querySelector(".btn-login");
  if (saveLink) {
    const targetHref = saveLink.getAttribute("href");
    saveLink.removeAttribute("href");
    saveLink.classList.add("disabled");
    saveLink.setAttribute("aria-disabled", "true");
    const confirmCb = document.getElementById("confirmEmailCheckbox");
    if (confirmCb) {
      confirmCb.addEventListener("change", () => {
        if (confirmCb.checked) {
          saveLink.setAttribute("href", targetHref);
          saveLink.classList.remove("disabled");
          saveLink.removeAttribute("aria-disabled");
        } else {
          saveLink.removeAttribute("href");
          saveLink.classList.add("disabled");
          saveLink.setAttribute("aria-disabled", "true");
        }
      });
    }
  }
});

const MIN_DISPLAY_TIME = 5000;
const startTime = Date.now();
const pre = document.getElementById("preloader");
const main = document.getElementById("main-content");
const bar = document.querySelector(".loading-progress");
const status = document.querySelector(".loading-status");
const statusPct = document.querySelector(".status-pct");

function updateProgress() {
  const elapsed = Date.now() - startTime;
  const pct = Math.min(100, Math.floor((elapsed / MIN_DISPLAY_TIME) * 100));
  if (bar && statusPct) {
    bar.style.width = pct + "%";
    statusPct.textContent = pct + "%";
  }
  if (elapsed < MIN_DISPLAY_TIME) {
    requestAnimationFrame(updateProgress);
  }
}
requestAnimationFrame(updateProgress);

window.addEventListener("load", () => {
  if (bar && statusPct) {
    bar.style.width = "100%";
    statusPct.textContent = "100%";
  }
  const elapsed = Date.now() - startTime;
  const waitFor = Math.max(0, MIN_DISPLAY_TIME - elapsed);
  setTimeout(() => {
    if (pre) pre.classList.add("fade-out");
    setTimeout(() => {
      if (pre) pre.remove();
      if (main) main.classList.remove("hidden");
    }, 600);
  }, waitFor);
});

// Infermedica API Integration
const INFERMEDICA_URL = "https://api.infermedica.com/v3/diagnosis";
const APP_ID = "700efbc5"; // Replace with your App-ID
const APP_KEY = "e9ba22397f798c58459d4003aed6284a"; // Replace with your App-Key
// SECURITY WARNING: Hardcoding API keys in frontend is insecure. For production, use a backend proxy or environment variables.

let chatState = {
  userEmail: null,
  age: null,
  sex: null,
  symptoms: [],
  currentQuestion: null
};

// Simple symptom mapping (replace with /symptoms endpoint in production)
const symptomMap = {
  fever: "s_98",
  cough: "s_99",
  headache: "s_21",
  "sore throat": "s_502"
};

// Parse medical data (e.g., blood pressure)
function parseMedicalData(input) {
  const doc = nlp(input);
  const data = {};
  
  // Blood pressure (e.g., "blood pressure 120/80")
  if (doc.match("blood pressure #Number/#Number").found) {
    data.bloodPressure = doc.match("#Number/#Number").text();
  }
  
  // Heart rate (e.g., "heart rate 72")
  if (doc.match("heart rate #Number").found) {
    data.heartRate = doc.match("#Number").text();
  }
  
  // Temperature (e.g., "temperature 98.6")
  if (doc.match("temperature #Number").found) {
    data.temperature = doc.match("#Number").text();
  }
  
  return data;
}
// Parse symptoms
function parseSymptoms(input) {
  const words = input.toLowerCase().split(/[, ]+/);
  const symptoms = [];
  words.forEach((word) => {
    if (symptomMap[word]) {
      symptoms.push({ id: symptomMap[word], choice_id: "present" });
    }
  });
  return symptoms;
}

// Append message to chat window
async function appendMessage(content, isUser = false) {
  const chatMessages = document.querySelector(".chatbot-messages");
  if (!chatMessages) return;
  const messageDiv = document.createElement("div");
  messageDiv.className = isUser ? "message user-message" : "message bot-message";
  messageDiv.innerHTML = `<p>${content}</p>`;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Save to chat history
  const userEmail = localStorage.getItem("currentUser");
  if (userEmail) {
    const conversation = await getChatHistory(userEmail);
    conversation.push({ sender: isUser ? "user" : "bot", message: content, timestamp: new Date().toISOString() });
    await saveChatHistory(userEmail, conversation);
  }
}

// Update chat history panel
async function updateChatHistoryPanel() {
  const userEmail = localStorage.getItem("currentUser");
  const historyPanel = document.querySelector(".chatbot-history");
  if (!userEmail || !historyPanel) return;

  const conversation = await getChatHistory(userEmail);
  historyPanel.innerHTML = "<h3>Past Conversations</h3>";
  conversation.forEach((msg) => {
    const msgDiv = document.createElement("div");
    msgDiv.className = `history-message ${msg.sender}-message`;
    msgDiv.innerHTML = `<p><strong>${msg.sender.toUpperCase()}</strong>: ${msg.message} <br><small>${new Date(
      msg.timestamp
    ).toLocaleString()}</small></p>`;
    historyPanel.appendChild(msgDiv);
  });
}

// Send API request
async function sendDiagnosisRequest() {
  try {
    const response = await fetch(INFERMEDICA_URL, {
      method: "POST",
      headers: {
        "App-Id": APP_ID,
        "App-Key": APP_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sex: chatState.sex,
        age: chatState.age,
        evidence: chatState.symptoms
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    chatState.currentQuestion = result.question;
    return result;
  } catch (error) {
    console.error("API request failed:", error);
    appendMessage("Sorry, I couldn't process your request. Please try again.");
    return null;
  }
}

// Display API response
async function displayBotResponse(response) {
  if (!response) return;

  if (response.conditions && response.conditions.length > 0) {
    const conditions = response.conditions
      .map((c) => `${c.name} (${(c.probability * 100).toFixed(1)}%)`)
      .join(", ");
    await appendMessage(`Possible conditions: ${conditions}`);
  }

  if (response.question && response.question.text) {
    await appendMessage(response.question.text);
  }
}

// Chatbot logic
document.addEventListener("DOMContentLoaded", async () => {
  const chatInput = document.querySelector(".chatbot-input");
  const sendBtn = document.querySelector(".chatbot-send");
  if (!chatInput || !sendBtn) return;

  // Initialize chat state
  const userEmail = localStorage.getItem("currentUser");
  if (userEmail) {
    chatState.userEmail = userEmail;
    const user = await getUser(userEmail);
    chatState.age = user.medicalHistory.age;
    chatState.sex = user.medicalHistory.sex;
    await updateChatHistoryPanel();
  } else {
    await appendMessage("Please sign in to use the chatbot.");
    return;
  }

  sendBtn.addEventListener("click", async () => {
    const input = chatInput.value.trim();
    if (!input) return;

    await appendMessage(input, true);
    chatInput.value = "";

    // Parse medical data
    const medicalData = parseMedicalData(input);
    if (Object.keys(medicalData).length > 0) {
      const records = await getMedicalRecords(chatState.userEmail);
      Object.assign(records, medicalData);
      await saveMedicalRecords(chatState.userEmail, records);
      await appendMessage("Updated your medical records with: " + JSON.stringify(medicalData));
    }

    // Parse symptoms or answer question
    if (!chatState.currentQuestion) {
      const newSymptoms = parseSymptoms(input);
      chatState.symptoms.push(...newSymptoms);
    } else {
      const answer = input.toLowerCase().includes("yes")
        ? "present"
        : input.toLowerCase().includes("no")
        ? "absent"
        : null;
      if (answer) {
        chatState.symptoms.push({
          id: chatState.currentQuestion.items[0].id,
          choice_id: answer
        });
      } else {
        await appendMessage("Please answer with 'yes' or 'no'.");
        return;
      }
    }

    // Send API request
    const response = await sendDiagnosisRequest();
    await displayBotResponse(response);
    await updateChatHistoryPanel();
  });

  chatInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      sendBtn.click();
    }
  });
});