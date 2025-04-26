// document.getElementById("searchIcon").addEventListener("click", function(event) {
//     event.preventDefault(); // Prevents page jump on click
//     let searchBar = document.getElementById("searchBarContainer");

//     // Toggle visibility
//     if (searchBar.style.display === "none" || searchBar.style.display === "") {
//         searchBar.style.display = "block";
//     } else {
//         searchBar.style.display = "none";
//     }

//     // Prevent the click from bubbling up (so it doesn't immediately close)
//     event.stopPropagation();
// });

// // Hide search bar when clicking outside
// document.addEventListener("click", function(event) {
//     let searchBar = document.getElementById("searchBarContainer");
//     let searchIcon = document.getElementById("searchIcon");

//     // If the click is NOT inside the search bar or on the search icon, hide it
//     if (!searchBar.contains(event.target) && !searchIcon.contains(event.target)) {
//         searchBar.style.display = "none";
//     }
// });

// document.getElementById("searchIcon").addEventListener("click", function (event) {
//     event.preventDefault();
//     let searchBar = document.getElementById("searchBarContainer");

//     // Toggle 'active' class to trigger the slide-in effect
//     searchBar.classList.toggle("active");

//     // Prevent the click from bubbling up (so it doesn't immediately close)
//     event.stopPropagation();
// });

// // Hide search bar when clicking outside
// document.addEventListener("click", function (event) {
//     let searchBar = document.getElementById("searchBarContainer");
//     let searchIcon = document.getElementById("searchIcon");

//     // If the click is NOT inside the search bar or on the search icon, hide it
//     if (!searchBar.contains(event.target) && !searchIcon.contains(event.target)) {
//         searchBar.classList.remove("active");
//     }
// });

const searchIcon    = document.getElementById("searchIcon");
const searchBarWrap = document.getElementById("searchBarContainer");
const searchOverlay = document.getElementById("searchOverlay");
const searchSubmit  = document.getElementById("searchSubmit");
const searchBar     = document.getElementById("searchBar"); // you forgot to define this globally!

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

  // 3) Disable the “Save New Password” link until checked
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


// // script.js

// // How long (in ms) the loader must stay visible at minimum
// const MIN_DISPLAY_TIME = 3000; // 3 seconds

// // Record when we started loading
// const loadStart = Date.now();

// window.addEventListener('load', () => {
//   const pre    = document.getElementById('preloader');
//   const main   = document.getElementById('main-content');

//   // Calculate how much time has passed since we started
//   const elapsed = Date.now() - loadStart;
//   // Compute remaining time to reach MIN_DISPLAY_TIME
//   const waitFor = Math.max(0, MIN_DISPLAY_TIME - elapsed);

//   // Wait the remainder, then fade out
//   setTimeout(() => {
//     pre.classList.add('fade-out');

//     // After the CSS fade-out (0.5s), remove the overlay and show content
//     setTimeout(() => {
//       pre.remove();
//       main.classList.remove('hidden');
//     }, 500);

//   }, waitFor);
// });

// script.js

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

