// The base URL of your backend API
const API_BASE_URL = 'http://localhost:3000';

// A variable to store the JWT token after login
let authToken = null;

// --- DOM Element Selections ---
// Forms
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');

// Inputs
const registerUsernameInput = document.getElementById('register-username');
const registerPasswordInput = document.getElementById('register-password');
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');

// Buttons
const getProfileButton = document.getElementById('get-profile-button');

// Display Areas
const messageArea = document.getElementById('message-area');
const responseOutput = document.getElementById('response-output');

// --- Helper Functions ---

/**
 * Displays a message to the user.
 * @param {string} message The message to display.
 * @param {boolean} isError If true, the message will be styled as an error.
 */
function displayMessage(message, isError = false) {
    messageArea.textContent = message;
    messageArea.className = 'message'; // Reset classes
    if (message) {
        messageArea.classList.add(isError ? 'error' : 'success');
    }
}

/**
 * Displays the raw JSON response from the API.
 * @param {object} data The data to display.
 */
function displayResponse(data) {
    responseOutput.textContent = JSON.stringify(data, null, 2);
}

// --- API Call Functions ---

// 1. Register User
registerForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission
    displayMessage(''); // Clear previous messages

    const username = registerUsernameInput.value;
    const password = registerPasswordInput.value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        displayResponse(data);

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        displayMessage('User registered successfully! You can now log in.');
        registerForm.reset();

    } catch (error) {
        displayMessage(error.message, true);
    }
});

// 2. Login User
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    displayMessage('');

    const username = loginUsernameInput.value;
    const password = loginPasswordInput.value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        displayResponse(data);

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // --- IMPORTANT: Store the token ---
        authToken = data.token;
        displayMessage('Login successful!');
        loginForm.reset();

    } catch (error) {
        displayMessage(error.message, true);
    }
});

// 3. Get User Profile (Protected)
getProfileButton.addEventListener('click', async () => {
    displayMessage('');

    if (!authToken) {
        displayMessage('You must be logged in to view your profile.', true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
            method: 'GET',
            headers: {
                // --- IMPORTANT: Send the token in the Authorization header ---
                'Authorization': `Bearer ${authToken}`,
            },
        });

        const data = await response.json();
        displayResponse(data);

        if (!response.ok) {
            throw new Error(data.message || 'Could not fetch profile');
        }

        displayMessage('Profile data fetched successfully.');

    } catch (error) {
        displayMessage(error.message, true);
    }
});