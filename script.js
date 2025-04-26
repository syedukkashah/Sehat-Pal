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

document.getElementById("searchIcon").addEventListener("click", function (event) {
    event.preventDefault();
    let searchBar = document.getElementById("searchBarContainer");

    // Toggle 'active' class to trigger the slide-in effect
    searchBar.classList.toggle("active");

    // Prevent the click from bubbling up (so it doesn't immediately close)
    event.stopPropagation();
});

// Hide search bar when clicking outside
document.addEventListener("click", function (event) {
    let searchBar = document.getElementById("searchBarContainer");
    let searchIcon = document.getElementById("searchIcon");

    // If the click is NOT inside the search bar or on the search icon, hide it
    if (!searchBar.contains(event.target) && !searchIcon.contains(event.target)) {
        searchBar.classList.remove("active");
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


document.addEventListener('DOMContentLoaded', () => {
  const historyPanel = document.getElementById('chatHistoryPanel');
  const toggleBtn    = document.getElementById('toggleHistory');

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
  const email  = params.get('email') || '';

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
