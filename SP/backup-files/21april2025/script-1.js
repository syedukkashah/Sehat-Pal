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




