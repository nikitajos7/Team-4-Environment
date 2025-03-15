import {
    auth,
    db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    doc,
    setDoc,
    updateDoc,
    serverTimestamp,
    getDoc,
    displayUserPoints,
    updateUserPoints,
    updatePlantImage,
    calculateEmissions
} from "./firebase.js";

// DOM elements for authentication
const signInButton = document.getElementById("sign-in-button");
const signOutButton = document.getElementById("sign-out-button");
const userInfoContainer = document.getElementById("user-info-container");
const userInfo = document.getElementById("user-info");
const signOutContainer = document.getElementById("sign-out-container");

// DOM elements for modals
const signupModal = document.getElementById("signup-modal");
const signinModal = document.getElementById("signin-modal");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const signinEmail = document.getElementById("signin-email");
const signinPassword = document.getElementById("signin-password");
const submitSignup = document.getElementById("submit-signup");
const submitSignin = document.getElementById("submit-signin");
const signupError = document.getElementById("signup-error");
const signinError = document.getElementById("signin-error");

// Set up button click handlers
if (signInButton) {
    signInButton.addEventListener("click", function (e) {
        e.preventDefault();
        openAuthModal('signin-modal');
    });
}

if (signOutButton) {
    signOutButton.addEventListener("click", function (e) {
        e.preventDefault();
        signOut(auth)
            .then(() => {
                console.log("User signed out successfully");
            })
            .catch((error) => {
                console.error("Error signing out:", error);
            });
    });
}

if (submitSignup) {
    submitSignup.addEventListener("click", function () {
        const email = signupEmail.value;
        const password = signupPassword.value;

        signupError.style.display = "none";

        if (!email || !password) {
            signupError.textContent = "Please enter both email and password";
            signupError.style.display = "block";
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    createdAt: serverTimestamp(),
                    points: 0
                })
                    .then(() => {
                        console.log("User data stored in Firestore");
                        closeAuthModal('signup-modal');
                    })
                    .catch((error) => {
                        console.error("Error storing user data:", error);
                    });
            })
            .catch((error) => {
                signupError.textContent = error.message;
                signupError.style.display = "block";
                console.error("Error signing up:", error);
            });
    });
}

if (submitSignin) {
    submitSignin.addEventListener("click", function () {
        const email = signinEmail.value;
        const password = signinPassword.value;

        signinError.style.display = "none";

        if (!email || !password) {
            signinError.textContent = "Please enter both email and password";
            signinError.style.display = "block";
            return;
        }

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                const userRef = doc(db, "users", user.uid);

                getDoc(userRef).then((docSnapshot) => {
                    if (docSnapshot.exists()) {
                        updateDoc(userRef, {
                            lastLogin: serverTimestamp()
                        })
                            .then(() => {
                                console.log("User login time updated");
                                closeAuthModal('signin-modal');
                            })
                            .catch((error) => {
                                console.error("Error updating user data:", error);
                            });
                    } else {
                        setDoc(userRef, {
                            email: user.email,
                            createdAt: serverTimestamp(),
                            lastLogin: serverTimestamp(),
                            points: 0
                        })
                            .then(() => {
                                console.log("User document created");
                                closeAuthModal('signin-modal');
                            })
                            .catch((error) => {
                                console.error("Error creating user document:", error);
                            });
                    }
                }).catch((error) => {
                    console.error("Error checking user document:", error);
                });
            })
            .catch((error) => {
                signinError.textContent = error.message;
                signinError.style.display = "block";
                console.error("Error signing in:", error);
            });
    });
}

// Listen for auth state changes
onAuthStateChanged(auth, function (user) {
    if (user) {
        const displayName = user.displayName || user.email.split('@')[0] || 'User';
        userInfo.textContent = `Welcome, ${displayName}`;

        userInfoContainer.style.display = "block";
        signOutContainer.style.display = "block";
        signInButton.style.display = "none";

        displayUserPoints();
    } else {
        userInfoContainer.style.display = "none";
        signOutContainer.style.display = "none";
        signInButton.style.display = "inline-block";
    }
});

// Modal functions
function openAuthModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "flex";
        const inputs = modal.querySelectorAll('input');
        const errors = modal.querySelectorAll('.error-message');

        inputs.forEach(input => input.value = '');
        errors.forEach(error => error.style.display = 'none');
    }
}

function closeAuthModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    }
}

// Close modals when clicking outside
window.addEventListener('click', function (event) {
    if (event.target === signupModal) {
        closeAuthModal('signup-modal');
    } else if (event.target === signinModal) {
        closeAuthModal('signin-modal');
    }
});

// Setup sticky header
function setupStickyHeader() {
    const header = document.querySelector(".main-header");
    const headerPlaceholder = document.getElementById("header-placeholder");

    if (!header || !headerPlaceholder) {
        console.error("Missing header elements");
        return;
    }

    headerPlaceholder.style.height = header.offsetHeight + "px";

    window.onscroll = function () {
        if (window.scrollY > 0) {
            header.classList.add("sticky", "shrink");
            headerPlaceholder.style.height = header.offsetHeight + "px";
        } else {
            header.classList.remove("sticky", "shrink");
            headerPlaceholder.style.height = header.offsetHeight + "px";
        }
    };
}

// Start when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    setupStickyHeader();
});

window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.displayUserPoints = displayUserPoints;
window.updateUserPoints = updateUserPoints;
window.updatePlantImage = updatePlantImage;

//calc
document.getElementById('calculate-button').addEventListener('click', calculateEmissions);