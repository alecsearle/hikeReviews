console.log("connected");

// Define loadReviewsFromServer first since other functions depend on it
function loadReviewsFromServer() {
  fetch("http://localhost:8000/hikes", {
    method: "GET",
    headers: {
      Authorization: authorizationHeader(), // Ensure authorizationHeader() returns the correct token
    },
  })
    .then((response) => {
      if (response.status === 401) {
        console.log("Unauthenticated. Please log in.");
        return; // Exit early if not authenticated
      }

      // Parse JSON if status is 200
      return response.json();
    })
    .then((data) => {
      if (!data) return; // Exit if no data is returned

      console.log("Fetched reviews:", data);

      // Clear the reviewsWrapper before appending new reviews
      let reviewsWrapper = document.querySelector("section");
      reviewsWrapper.innerHTML = "";

      // Loop through the data and add each review
      data.forEach((review) => {
        addHikeReview(review);
      });
    })
    .catch((error) => {
      console.error("Error fetching reviews:", error);
    });
}

function authorizationHeader() {
  let sessionID = localStorage.getItem("sessionID");
  console.log("Session ID Is: ", sessionID);
  if (sessionID) {
    return `Bearer ${sessionID}`;
  } else {
    return null;
  }
}

function createSessionId() {
  fetch("http://localhost:8000/sessions", {
    headers: {
      Authorization: authorizationHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).then(function (response) {
    console.log("RESPONSE: ", response);
    if (response.status == 200) {
      response.json().then(function (session) {
        localStorage.setItem("sessionID", session.id);
        console.log("Session Id from server", session.id);
        console.log("Session data from server", session.data);

        // Only load reviews if user is authenticated
        console.log("ALMOST THERE");
        if (session.data.user_id) {
          console.log("USER ID", session.data.user_id);
          loadReviewsFromServer();
        }
      });
    }
  });
}

let inputFavColor = document.querySelector("#colorPicker");
let saveColorButton = document.querySelector("#save-color-button");

saveColorButton.addEventListener("click", function () {
  console.log("favColor: ", inputFavColor.value);
  document.body.style.backgroundColor = inputFavColor.value;
  let data = "color=" + encodeURIComponent(inputFavColor.value);

  fetch("http://localhost:8000/sessions/settings", {
    headers: {
      Authorization: authorizationHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "PUT",
    body: data,
  }).then(function (response) {
    console.log(response.text);
    document.body.style.backgroundColor = inputFavColor.value;
  });
});

let loginPage = document.getElementById("login");
loginPage.classList.toggle("hidden");

let goToLogin = document.getElementById("goToLogin");
goToLogin.onclick = function () {
  loginPage.classList.toggle("hidden");
  createAccount.classList.toggle("hidden");
};

let goToCreateAccount = document.getElementById("goToCreateAccount");
goToCreateAccount.onclick = function () {
  loginPage.classList.toggle("hidden");
  createAccount.classList.toggle("hidden");
};

let logOut = document.getElementById("logOut");
logOut.onclick = function () {
  landing.classList.toggle("hidden");
  loginPage.classList.toggle("hidden");
};

function setPage(currentPage, nextPage) {
  currentPage.classList.toggle("hidden");
  nextPage.classList.toggle("hidden");
}

let reviewsWrapper = document.querySelector("section");

function addHikeReview(data) {
  let newCard = document.createElement("div");
  newCard.classList.add("card");

  let hikeName = document.createElement("h2");
  hikeName.textContent = data.name;

  let hikeLocation = document.createElement("h3");
  hikeLocation.textContent = data.location;

  let hikeMiles = document.createElement("p");
  hikeMiles.textContent = `${data.miles} miles`;

  let starsContainer = document.createElement("div");
  for (let i = 0; i < parseInt(data.rating); i++) {
    let hikeRating = document.createElement("ion-icon");
    hikeRating.setAttribute("name", "star");
    starsContainer.appendChild(hikeRating);
  }

  let hikeReview = document.createElement("p");
  hikeReview.textContent = data.review;

  let hikePicture = document.createElement("img");
  hikePicture.src = data.picture;
  hikePicture.alt = "Picture of " + data.name;
  hikePicture.classList.add("thumbnail");

  let editButton = document.createElement("button");
  editButton.textContent = "Edit";

  let deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";

  reviewsWrapper.appendChild(newCard);
  newCard.appendChild(hikePicture);
  newCard.appendChild(hikeName);
  newCard.appendChild(hikeLocation);
  newCard.appendChild(hikeMiles);
  newCard.appendChild(starsContainer);
  newCard.appendChild(hikeReview);
  newCard.appendChild(editButton);
  newCard.appendChild(deleteButton);

  // Edit functionality
  editButton.onclick = function () {
    console.log("hike id:", data.id);
    let editContainer = document.getElementById("editReviewContainer");
    editContainer.classList.remove("hidden");

    let editHikeName = document.querySelector("#edit-hike-name");
    let editHikeLocation = document.querySelector("#edit-hike-location");
    let editHikeMiles = document.querySelector("#edit-hike-miles");
    let editHikeRating = document.querySelector("#edit-hike-rating");
    let editHikeReview = document.querySelector("#edit-hike-review");
    let editHikePicture = document.querySelector("#edit-hike-picture");

    // Pre-populate the edit form
    editHikeName.value = data.name;
    editHikeLocation.value = data.location;
    editHikeMiles.value = data.miles;
    editHikeRating.value = data.rating;
    editHikeReview.value = data.review;
    editHikePicture.value = data.picture;

    let saveEditButton = document.getElementById("save-edit-button");
    saveEditButton.onclick = function () {
      // Get the current values from the form when save is clicked
      let editData = "name=" + encodeURIComponent(editHikeName.value);
      editData += "&location=" + encodeURIComponent(editHikeLocation.value);
      editData += "&miles=" + encodeURIComponent(editHikeMiles.value);
      editData += "&rating=" + encodeURIComponent(editHikeRating.value);
      editData += "&review=" + encodeURIComponent(editHikeReview.value);
      editData += "&picture=" + encodeURIComponent(editHikePicture.value);

      fetch(`http://localhost:8000/hikes/${data.id}`, {
        method: "PUT",
        body: editData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: authorizationHeader(), // Add authorization header
        },
      })
        .then(function (response) {
          if (response.ok) {
            console.log("Updated Review");
            // Hide the edit container
            editContainer.classList.add("hidden");
            // Clear the reviews and reload
            reviewsWrapper.innerHTML = "";
            loadReviewsFromServer();
          } else {
            console.error("Failed to update review");
            alert("Failed to update review. Please try again.");
          }
        })
        .catch((error) => {
          console.error("Error updating review:", error);
          alert("Error updating review. Please try again.");
        });
    };
  };

  // Delete functionality
  deleteButton.onclick = function () {
    if (confirm("Do you actually wanna delete this?") == true) {
      fetch("http://localhost:8000/hikes/" + data.id, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            console.log("Deleted hike with ID:", data.id);
            newCard.remove();
          } else {
            console.error("Failed to delete the hike review.");
          }
        })
        .catch((error) => console.error("Error:", error));
    }
  };
}

// Add new review functionality
let addReviewButton = document.querySelector("#add-review-button");

function addNewReview() {
  console.log("Add Review button clicked");
  let inputHikeName = document.querySelector("#input-hike-name");
  let inputHikeLocation = document.querySelector("#input-hike-location");
  let inputHikeMiles = document.querySelector("#input-hike-miles");
  let inputHikeRating = document.querySelector("#input-hike-rating");
  let inputHikeReview = document.querySelector("#input-hike-review");
  let inputHikePicture = document.querySelector("#input-hike-picture");

  let data =
    "name=" +
    encodeURIComponent(inputHikeName.value) +
    "&location=" +
    encodeURIComponent(inputHikeLocation.value) +
    "&miles=" +
    encodeURIComponent(inputHikeMiles.value) +
    "&rating=" +
    encodeURIComponent(inputHikeRating.value) +
    "&review=" +
    encodeURIComponent(inputHikeReview.value) +
    "&picture=" +
    encodeURIComponent(inputHikePicture.value);

  fetch("http://localhost:8000/hikes", {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: authorizationHeader(),
    },
  })
    .then(function (response) {
      if (response.ok) {
        console.log("New review created!");
        loadReviewsFromServer();
        // Clear input fields
        inputHikeName.value = "";
        inputHikeLocation.value = "";
        inputHikeMiles.value = "";
        inputHikeRating.value = "";
        inputHikeReview.value = "";
        inputHikePicture.value = "";
      } else {
        console.error("Failed to create new review.");
      }
    })
    .catch((error) => console.error("Error creating review:", error));
}

if (addReviewButton) {
  addReviewButton.onclick = addNewReview;
}

// Toggle visibility for the add review container
let addReviewBtn = document.getElementById("myBtn");
let addReviewContainer = document.getElementById("addReviewContainer");

if (addReviewBtn) {
  addReviewBtn.onclick = function () {
    addReviewContainer.classList.toggle("hidden");
  };
}

function loginUser() {
  console.log("Login User button clicked");
  let email = document.querySelector("#login-email");
  let password = document.querySelector("#login-password");

  let data =
    "email=" +
    encodeURIComponent(email.value) +
    "&password=" +
    encodeURIComponent(password.value);

  fetch("http://localhost:8000/sessions/auth", {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: authorizationHeader(),
    },
  })
    .then(function (response) {
      if (response.status == 201) {
        return response.json();
      }
      throw new Error("Login failed");
    })
    .then(function (data) {
      localStorage.setItem("sessionID", data.session_id);
      setPage(login, landing);
      let logout = document.getElementById("logOut");
      logout.classList.toggle("hidden");
      console.log("User Found and logged in");

      // Clear input fields
      email.value = "";
      password.value = "";

      // Load reviews now that we're authenticated
      loadReviewsFromServer();

      alert("You are now signed into your account");
    })
    .catch((error) => {
      console.error("Error logging in user:", error);
      alert("Unable to login user with that email");
    });
}

let loginUserButton = document.querySelector("#login-user-button");
if (loginUserButton) {
  loginUserButton.onclick = loginUser;
}

function addUser() {
  console.log("Add User button clicked");
  let first_name = document.querySelector("#signup-first-name");
  let last_name = document.querySelector("#signup-last-name");
  let email = document.querySelector("#signup-email");
  let password = document.querySelector("#signup-password");

  let data =
    "first_name=" +
    encodeURIComponent(first_name.value) +
    "&last_name=" +
    encodeURIComponent(last_name.value) +
    "&email=" +
    encodeURIComponent(email.value) +
    "&password=" +
    encodeURIComponent(password.value);

  fetch("http://localhost:8000/users", {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: authorizationHeader(),
    },
  })
    .then(function (response) {
      response.text().then(function (text) {
        if (response.status == 201) {
          setPage(createAccount, login);
          console.log("New user created!");
          alert(text);

          // Clear input fields
          first_name.value = "";
          last_name.value = "";
          email.value = "";
          password.value = "";
        } else {
          console.error("Failed to create new user.");
          alert(text);
        }
      });
    })
    .catch((error) => console.error("Error creating user:", error));
}

let addUserButton = document.querySelector("#add-user-button");
if (addUserButton) {
  addUserButton.onclick = addUser;
}

// Font size functionality
document.addEventListener("DOMContentLoaded", function () {
  const fontSizeSelector = document.getElementById("font-size-selector");
  const body = document.body;

  function applyFontSize(size) {
    body.style.fontSize = size;
  }

  const savedFontSize = localStorage.getItem("fontSize");
  if (savedFontSize) {
    applyFontSize(savedFontSize);
    fontSizeSelector.value = savedFontSize;
  }

  if (fontSizeSelector) {
    fontSizeSelector.addEventListener("change", function () {
      const selectedFontSize = fontSizeSelector.value;
      applyFontSize(selectedFontSize);
      localStorage.setItem("fontSize", selectedFontSize);
    });
  }
});

// Initial session creation
createSessionId();
