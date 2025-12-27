// ============================
// DOM Elements
// ============================
const API_BASE_URL = "https://newbus.tryasp.net/api/";
const container = document.getElementById("container");
const signUpBtn = document.getElementById("signUp");
const signInBtn = document.getElementById("signIn");
const signUpForm = document.getElementById("signUpForm");
const signInForm = document.getElementById("signInForm");

const error = document.getElementById("error");
const success = document.getElementById("success");
const loginError = document.getElementById("loginError");
const loginSuccess = document.getElementById("loginSuccess");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");

const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const forgotPasswordPage = document.getElementById("forgotPasswordPage");
const forgotBackToSignIn = document.getElementById("forgotBackToSignIn");
const backToStep1 = document.getElementById("backToStep1");
const backToStep2 = document.getElementById("backToStep2");

const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const otpVerificationForm = document.getElementById("otpVerificationForm");
const newPasswordForm = document.getElementById("newPasswordForm");

const forgotError = document.getElementById("forgotError");
const forgotSuccess = document.getElementById("forgotSuccess");
const otpError = document.getElementById("otpError");
const otpSuccess = document.getElementById("otpSuccess");
const passwordError = document.getElementById("passwordError");
const passwordSuccess = document.getElementById("passwordSuccess");

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");
const otpContainer = document.getElementById("otpContainer");
const otpTimer = document.getElementById("timer");
const resendOtpBtn = document.getElementById("resendOtpBtn");
const otpDisplayArea = document.getElementById("otpDisplayArea");

// Mobile buttons
const mobileSignupBtn = document.getElementById("mobileSignupBtn");

// ============================
// Global Variables
// ============================

let resetUserData = null;
let currentOTP = null;
let otpExpiryTime = null;
let otpTimerInterval = null;



// ============================
// API Helpers
// ============================

async function apiRequest(URI, method = "GET", headers = {}, data = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(API_BASE_URL + URI, options);

    // Try to parse JSON error message if present
    let responseData;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    }

    if (!response.ok) {
      // Extract message from API or fallback
      const errorMsg = responseData?.Message || responseData?.error || "Something went wrong. Please try again.";
      //alert(errorMsg);  // Or better: show in a custom error div
      return { success: false, error: errorMsg };
    }

    // 204 No Content (e.g., DELETE success)
    if (response.status === 204) {
      return { success: true, data: null };
    }

    // Successful response with JSON body
    return { success: true, data: responseData || null };

  } catch (error) {
    console.error("API Request Error:", error);
    //alert("Network error. Please check your connection and try again.");
    return { success: false, error: "Network error" };
  }
}

// ============================
// Demo Accounts
// ============================

const DEMO_ACCOUNTS = {
    'passenger@newbus.com': {
        password: '12345678',
        type: 'passenger',
        name: 'John Passenger',
        username: 'john_passenger',
        phone: '+201234567890',
        gender: 'male'
    },
    'driver@newbus.com': {
        password: '12345678',
        type: 'driver',
        name: 'Ahmed Driver',
        username: 'ahmed_driver',
        phone: '+201112223344',
        gender: 'male'
    },
    'admin@newbus.com': {
        password: '12345678',
        type: 'admin',
        name: 'Admin User',
        username: 'admin_user',
        phone: '+201009998877',
        gender: 'male'
    }
};

// ============================
// Utility Functions
// ============================

function shakeElement(element) {
    element.style.animation = "none";
    setTimeout(() => element.style.animation = "shake 0.5s ease-in-out", 10);
}

function showToast(message, isSuccess = true) {
    toastMessage.textContent = message;
    toast.querySelector('i').className = isSuccess ? "fas fa-check-circle" : "fas fa-exclamation-circle";
    toast.classList.add("show", "success-animate");
    setTimeout(() => toast.classList.remove("show", "success-animate"), 3000);
}

function resetMessages() {
    [error, success, loginError, loginSuccess].forEach(el => {
        el.style.display = "none";
        el.textContent = "";
    });
}

function showError(message, type = 'signup') {
    const target = type === 'signup' ? error : loginError;
    target.textContent = message;
    target.style.display = "block";
    shakeElement(target);
}

function showSuccess(message, type = 'signup') {
    const target = type === 'signup' ? success : loginSuccess;
    target.textContent = message;
    target.style.display = "block";
}

// ============================
// Forgot Password Functions
// ============================

function showForgotPasswordPage() {
    forgotPasswordPage.classList.add("active");
    container.style.display = "none";
    showStep(1);
    resetForgotPasswordForm();
}

function hideForgotPasswordPage() {
    forgotPasswordPage.classList.remove("active");
    container.style.display = "flex";
    resetUserData = null;
    clearOtpTimer();
}

function showStep(stepNumber) {
    [step1, step2, step3].forEach(s => s.classList.remove("active"));
    if (stepNumber === 1) step1.classList.add("active");
    if (stepNumber === 2) step2.classList.add("active");
    if (stepNumber === 3) step3.classList.add("active");
}

function resetForgotPasswordForm() {
    forgotPasswordForm.reset();
    forgotError.style.display = forgotSuccess.style.display = "none";
    forgotError.textContent = forgotSuccess.textContent = "";
}

function resetStep3() {
    newPasswordForm.reset();
    passwordError.style.display = passwordSuccess.style.display = "none";
    passwordError.textContent = passwordSuccess.textContent = "";
}

function resetOtpForm() {
    otpContainer.querySelectorAll('.otp-input').forEach(input => {
        input.value = '';
        input.classList.remove('filled');
    });
    otpError.style.display = otpSuccess.style.display = "none";
    otpError.textContent = otpSuccess.textContent = "";
}

// ============================
// OTP Functions
// ============================

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateAndSendOTP() {
    currentOTP = generateOTP();
    otpExpiryTime = Date.now() + 3 * 60 * 1000;

    otpDisplayArea.innerHTML = `
        <div class="otp-display-container">
            <div class="otp-instruction"><strong>Enter this OTP in the boxes below:</strong></div>
            <div class="otp-display">${currentOTP.split('').join(' ')}</div>
            <div class="otp-instruction" style="font-size: 12px;">(This is a simulation. OTP would be sent in real app)</div>
        </div>
    `;
    
    resetOtpForm();
    startOtpTimer();
    showOtpSuccess("OTP generated successfully! Enter the 6-digit code above.");
    
    const firstInput = otpContainer.querySelector('[data-index="0"]');
    if (firstInput) firstInput.focus();
}

function startOtpTimer() {
    clearOtpTimer();
    
    function updateTimer() {
        const timeLeft = otpExpiryTime - Date.now();
        if (timeLeft <= 0) {
            clearInterval(otpTimerInterval);
            otpTimer.textContent = "00:00";
            otpTimer.parentElement.style.color = "#e74c3c";
            return;
        }
        
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        otpTimer.textContent = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
    }
    
    updateTimer();
    otpTimerInterval = setInterval(updateTimer, 1000);
}

function clearOtpTimer() {
    if (otpTimerInterval) {
        clearInterval(otpTimerInterval);
        otpTimerInterval = null;
    }
}

function getEnteredOTP() {
    return Array.from(otpContainer.querySelectorAll('.otp-input')).map(i => i.value).join('');
}

// ============================
// Forgot Password Handlers
// ============================

function handleForgotPasswordSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("forgotEmail").value.trim();
    const phone = document.getElementById("forgotPhone").value.trim();
    const username = document.getElementById("forgotUsername").value.trim();

    forgotError.style.display = forgotSuccess.style.display = "none";

    if (!email || !phone || !username) {
        showForgotError("Please enter email, phone, and username");
        return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showForgotError("Please enter a valid email address");
        return;
    }

    const users = JSON.parse(localStorage.getItem('newbus_users')) || [];
    let foundUser = users.find(u => u.email === email && u.phone === phone && u.username === username);

    if (!foundUser && DEMO_ACCOUNTS[email]) {
        const demo = DEMO_ACCOUNTS[email];
        if (demo.phone === phone && demo.username === username) {
            foundUser = { ...demo, email, isDemo: true };
        }
    }

    if (foundUser) {
        resetUserData = foundUser;
        showForgotSuccess("Identity verified! Generating OTP...");
        setTimeout(() => {
            showStep(2);
            generateAndSendOTP();
        }, 1000);
    } else {
        showForgotError("No account found with these details. Make sure all information matches.");
    }
}

function handleOtpVerificationSubmit(e) {
    e.preventDefault();
    const enteredOTP = getEnteredOTP();
    otpError.style.display = otpSuccess.style.display = "none";

    if (enteredOTP.length !== 6) {
        showOtpError("Please enter the complete 6-digit OTP");
        return;
    }
    
    if (Date.now() > otpExpiryTime) {
        showOtpError("OTP has expired. Please request a new one.");
        return;
    }

    if (enteredOTP === currentOTP) {
        showOtpSuccess("OTP verified successfully!");
        clearOtpTimer();
        setTimeout(() => showStep(3), 1000);
    } else {
        showOtpError("Invalid OTP. Please try again.");
        shakeElement(otpError);
    }
}

function handleNewPasswordSubmit(e) {
    e.preventDefault();
    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword = document.getElementById("confirmNewPassword").value;

    passwordError.style.display = passwordSuccess.style.display = "none";

    if (newPassword.length < 8) {
        showPasswordError("Password must be at least 8 characters");
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        showPasswordError("Passwords do not match");
        return;
    }

    if (updateUserPassword(resetUserData, newPassword)) {
        showPasswordSuccess("Password updated successfully!");
        setTimeout(() => {
            hideForgotPasswordPage();
            showToast("Password has been reset successfully!");
        }, 1500);
    } else {
        showPasswordError("Failed to update password. Please try again.");
    }
}

function updateUserPassword(userData, newPassword) {
    try {
        const users = JSON.parse(localStorage.getItem('newbus_users')) || [];

        if (userData.isDemo) {
            const idx = users.findIndex(u => u.email === userData.email);
            if (idx === -1) {
                users.push({
                    ...userData,
                    password: newPassword,
                    isDemoBased: true,
                    id: Date.now(),
                    createdAt: new Date().toISOString()
                });
            } else {
                users[idx].password = newPassword;
            }
        } else {
            const idx = users.findIndex(u => u.email === userData.email);
            if (idx !== -1) {
                users[idx].password = newPassword;
            }
        }

        localStorage.setItem('newbus_users', JSON.stringify(users));
        return true;
    } catch (err) {
        console.error("Error updating password:", err);
        return false;
    }
}

// ============================
// OTP UI Messages
// ============================

function showForgotError(msg) {
    forgotError.textContent = msg;
    forgotError.style.display = "block";
    shakeElement(forgotError);
}

function showForgotSuccess(msg) {
    forgotSuccess.textContent = msg;
    forgotSuccess.style.display = "block";
}

function showOtpError(msg) {
    otpError.textContent = msg;
    otpError.style.display = "block";
    shakeElement(otpError);
}

function showOtpSuccess(msg) {
    otpSuccess.textContent = msg;
    otpSuccess.style.display = "block";
}

function showPasswordError(msg) {
    passwordError.textContent = msg;
    passwordError.style.display = "block";
    shakeElement(passwordError);
}

function showPasswordSuccess(msg) {
    passwordSuccess.textContent = msg;
    passwordSuccess.style.display = "block";
}

// ============================
// Sign Up Logic
// ============================

async function handleSignUpSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const gender = document.getElementById("gender").value;
    const faculty = document.getElementById("faculty").value;
    const level = document.getElementById("level").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    resetMessages();
    
    // Validation
    if (!validateSignUp(name, email, username, phone, gender, faculty,level, password, confirmPassword)) return;
    
    /*if (isEmailRegistered(email)) {
        showError("This email is already registered");
        return;
    }*/
    
    /*if (isUsernameTaken(username)) {
        showError("Username is already taken");
        return;
    }*/

    // Create user data
    const userData = {
        firstName:name,
        secondName: "second", 
        thirdName: "third",
        lastName: "last",
        email: email,
        phone: phone,
        gender: gender,
        username: username,
        password: password,
        facultyId: faculty,
        level: level,
    };

    // Save to localStorage
    //const users = JSON.parse(localStorage.getItem('newbus_users')) || [];
    //users.push(userData);
    //localStorage.setItem('newbus_users', JSON.stringify(users));

    // Send sign up request to API
    const signUpResponse = await signUpRequest(userData);
    
    // Show success message
    if (signUpResponse.success) {
        showSignUpSuccess(userData);
    } else {
        showSignUpError(signUpResponse.error);
    }
    
    // Reset the form but keep success message
    document.getElementById("signUpForm").reset();
}

async function signUpRequest(userData) {
    return apiRequest("Students/SignUp", "POST", {}, userData);
}

function showSignUpSuccess(userData) {
    const successMessage = document.getElementById("success");
    
    successMessage.innerHTML = `
        <div style="text-align: center; padding: 15px;">
            <i class="fas fa-check-circle" style="color: #28a745; font-size: 24px; margin-bottom: 10px; display: block;"></i>
            <h3 style="color: #155724; margin-bottom: 10px;">Account Created Successfully!</h3>
            <p style="margin-bottom: 5px;"><strong>Welcome, ${userData.firstName}!</strong></p>
            <p style="color: #0c5460; font-size: 14px; margin-bottom: 15px;">
                Your account has been created!.
            </p>
            <p style="font-size: 13px; color: #6c757d;">
                You can now sign in with your email: <strong>${userData.email}</strong>
            </p>
            <button id="autoSwitchToSignIn" style="
                background: var(--primary-color);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: var(--border-radius-medium);
                font-size: 14px;
                cursor: pointer;
                margin-top: 15px;
                transition: all 0.3s ease;
            ">
                <i class="fas fa-sign-in-alt"></i> Switch to Sign In
            </button>
        </div>
    `;
    
    successMessage.style.display = "block";
    
    // Add event listener to the switch button
    const switchBtn = document.getElementById('autoSwitchToSignIn');
    if (switchBtn) {
        switchBtn.addEventListener('click', () => {
            container.classList.remove("right-panel-active");
            resetMessages();
            
            // Auto-fill email in sign in form for convenience
            document.getElementById("loginEmail").value = userData.email;
        });
    }
    
    // Auto switch after 5 seconds
    setTimeout(() => {
        if (container.classList.contains("right-panel-active")) {
            container.classList.remove("right-panel-active");
            resetMessages();
            document.getElementById("loginEmail").value = userData.email;
        }
    }, 5000);
}

function showSignUpError(errorMessage = "Something went wrong. Please try again.") {
    const errorContainer = document.getElementById("error");
    
    errorContainer.innerHTML = `
        <div style="
            text-align: center; 
            padding: 30px 20px; 
            background: linear-gradient(135deg, #fff0f0 0%, #ffe6e6 100%);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(220, 53, 69, 0.2);
            position: relative;
            overflow: hidden;
            max-width: 420px;
            margin: 20px auto;
            border: 1px solid #ff8787;
        ">
            <!-- Subtle fallen leaves for theme consistency -->
            <i class="fas fa-leaf" style="position: absolute; top: 10px; left: 20px; color: #c0392b; opacity: 0.4; font-size: 20px; transform: rotate(20deg);"></i>
            <i class="fas fa-leaf" style="position: absolute; top: 15px; right: 30px; color: #e74c3c; opacity: 0.3; font-size: 18px; transform: rotate(-30deg);"></i>
            <i class="fas fa-leaf" style="position: absolute; bottom: 20px; left: 40px; color: #d63031; opacity: 0.4; font-size: 22px; transform: rotate(45deg);"></i>

            <i class="fas fa-exclamation-triangle" style="
                color: #e74c3c; 
                font-size: 48px; 
                margin-bottom: 15px; 
                display: block;
                text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            "></i>
            
            <h3 style="
                color: #c0392b; 
                margin: 0 0 12px 0; 
                font-size: 24px;
                font-weight: 600;
            ">
                Oops! We Hit a Snag
            </h3>
            
            <p style="
                color: #a93226; 
                font-size: 16px; 
                margin: 15px 0 20px 0;
                line-height: 1.6;
                max-width: 340px;
                margin-left: auto;
                margin-right: auto;
            ">
                ${errorMessage}
            </p>
            
            <p style="
                font-size: 14px; 
                color: #7f3f3f; 
                margin: 10px 0 25px 0;
            ">
                Please check your details and try again.
            </p>
            
            <button id="retrySignUp" style="
                background: linear-gradient(to right, #e74c3c, #c0392b);
                color: white;
                border: none;
                padding: 12px 28px;
                border-radius: 50px;
                font-size: 15px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
                transition: all 0.3s ease;
                font-weight: 500;
            "
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(231,76,60,0.5)'"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(231,76,60,0.4)'">
                <i class="fas fa-redo-alt"></i> Try Again
            </button>
        </div>
    `;
    
    errorContainer.style.display = "block";

    // Optional: Add click handler to retry (e.g., clear form or just dismiss)
    const retryBtn = document.getElementById('retrySignUp');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            resetMessages(); // Hide error and success messages
            // Optionally scroll to form or focus first input
            document.querySelector('#signUpForm input')?.focus();
        });
    }

    // Auto-hide error after 8 seconds (optional – errors usually stay until user acts)
    // Comment out if you want it to persist
    /*
    setTimeout(() => {
        if (errorContainer.style.display === "block") {
            errorContainer.style.display = "none";
        }
    }, 8000);
    */
}

// ============================
// Sign In Logic - FIXED
// ============================

function handleSignInSubmit(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const selectedAccountType = document.querySelector('input[name="loginAccountType"]:checked').value;

    resetMessages();
    
    if (!email) {
        showError("Please enter your email", 'login');
        return;
    }
    
    if (!password) {
        showError("Please enter your password", 'login');
        return;
    }

    console.log("Login attempt:", { email, password, selectedAccountType });

    if (tryDemoLogin(email, password, selectedAccountType)) return;
    if (tryLocalLogin(email, password, selectedAccountType)) return;

    showError("Invalid email or password", 'login');
}

function tryDemoLogin(email, password, selectedAccountType) {
    if (!DEMO_ACCOUNTS[email] || DEMO_ACCOUNTS[email].password !== password) return false;
    
    const account = DEMO_ACCOUNTS[email];
    if (account.type !== selectedAccountType) {
        showError(`Please select "${account.type}" account type to login`, 'login');
        return false;
    }
    
    const userData = {
        id: Date.now(),
        email,
        name: account.name,
        username: account.username,
        phone: account.phone,
        gender: account.gender,
        accountType: account.type,
        isLoggedIn: true,
        isDemo: true
    };
    
    console.log("Demo login successful:", userData);
    saveUserSession(userData);
    return true;
}

function tryLocalLogin(email, password, selectedAccountType) {
    const users = JSON.parse(localStorage.getItem('newbus_users')) || [];
    console.log("Total users in localStorage:", users.length);
    
    const user = users.find(u => u.email === email);
    
    if (!user) {
        console.log("User not found with email:", email);
        return false;
    }
    
    console.log("User found:", { 
        email: user.email, 
        password: user.password ? "***" : "missing",
        accountType: user.accountType 
    });
    
    // التحقق من كلمة المرور
    if (user.password !== password) {
        console.log("Password mismatch");
        console.log("Input password:", password);
        console.log("Stored password:", user.password);
        return false;
    }
    
    if (user.accountType !== selectedAccountType) {
        showError(`Please select "${user.accountType}" account type to login`, 'login');
        return false;
    }
    
    // تحديث حالة تسجيل الدخول في localStorage
    const updatedUsers = users.map(u => {
        if (u.email === email) {
            return { ...u, isLoggedIn: true };
        }
        return u;
    });
    
    localStorage.setItem('newbus_users', JSON.stringify(updatedUsers));
    
    const loggedInUser = { ...user, isLoggedIn: true };
    console.log("Local login successful:", loggedInUser);
    saveUserSession(loggedInUser);
    return true;
}

function saveUserSession(userData) {
    console.log("Saving user session to localStorage...");
    
    // تأكد من أن isLoggedIn = true
    const sessionData = {
        ...userData,
        isLoggedIn: true,
        lastLogin: new Date().toISOString()
    };
    
    // حفظ البيانات في localStorage
    localStorage.setItem('currentUser', JSON.stringify(sessionData));
    localStorage.setItem('userAccountType', userData.accountType);
    localStorage.setItem('userName', userData.name);
    
    // Debug: عرض ما تم حفظه
    console.log("Saved to localStorage:");
    console.log("- currentUser:", JSON.parse(localStorage.getItem('currentUser')));
    console.log("- userAccountType:", localStorage.getItem('userAccountType'));
    console.log("- userName:", localStorage.getItem('userName'));
    
    // Show success message and redirect
    showSuccess("Login successful! Redirecting...", 'login');
    
    setTimeout(() => {
        console.log("Redirecting to:", userData.accountType);
        redirectBasedOnAccountType(userData.accountType);
    }, 1500);
}

function redirectBasedOnAccountType(accountType) {
    console.log("Attempting redirect to:", accountType);
    
    // التحقق من أن الصفحات موجودة
    const pages = {
        passenger: 'passenger.html',
        driver: 'driver.html',
        admin: 'admin.html'
    };
    
    if (pages[accountType]) {
        console.log("Redirecting to:", pages[accountType]);
        window.location.href = pages[accountType];
    } else {
        console.error("Unknown account type or page not found:", accountType);
        showError(`Page for ${accountType} not found!`, 'login');
    }
}

// ============================
// Validation Helpers
// ============================

function validateSignUp(name, email, username, phone, gender, faculty,level, password, confirmPassword) {
    if (!name) {
        showError("Please enter your full name");
        return false;
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError("Please enter a valid email");
        return false;
    }
    
    if (!username || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        showError("Username must be 3-20 characters");
        return false;
    }
    
    if (!phone || !/^[+]?[0-9]{10,15}$/.test(phone)) {
        showError("Please enter valid phone number");
        return false;
    }
    
    if (!gender) {
        showError("Please select gender");
        return false;
    }
    
    if (!faculty) {
        showError("Please select faculty");
        return false;
    }

    if (!level) {
        showError("Please select level");
        return false;
    }
    
    if (!password || password.length < 8) {
        showError("Password must be at least 8 characters");
        return false;
    }
    
    if (password !== confirmPassword) {
        showError("Passwords do not match");
        return false;
    }
    
    return true;
}

function isEmailRegistered(email) {
    const users = JSON.parse(localStorage.getItem('newbus_users')) || [];
    return users.some(u => u.email === email);
}

function isUsernameTaken(username) {
    const users = JSON.parse(localStorage.getItem('newbus_users')) || [];
    return users.some(u => u.username === username);
}

// ============================
// Form Reset Functions
// ============================

function resetSignUpForm() {
    // Reset form values
    if (signUpForm) {
        signUpForm.reset();
    }
    
    // Reset messages
    resetMessages();
}

// ============================
// Event Listeners
// ============================

// Initialize event listeners
function initEventListeners() {
    console.log("Initializing event listeners...");
    
    // Main navigation
    if (signUpBtn) {
        signUpBtn.addEventListener("click", () => {
            console.log("Sign Up button clicked");
            container.classList.add("right-panel-active");
            resetSignUpForm();
        });
    } else {
        console.error("Sign Up button not found!");
    }
    
    if (signInBtn) {
        signInBtn.addEventListener("click", () => {
            console.log("Sign In button clicked");
            container.classList.remove("right-panel-active");
            resetMessages();
        });
    } else {
        console.error("Sign In button not found!");
    }

    // Form submissions
    if (signUpForm) {
        signUpForm.addEventListener("submit", handleSignUpSubmit);
    } else {
        console.error("Sign Up form not found!");
    }
    
    if (signInForm) {
        signInForm.addEventListener("submit", handleSignInSubmit);
    } else {
        console.error("Sign In form not found!");
    }

    // Mobile Signup Button
    if (mobileSignupBtn) {
        mobileSignupBtn.addEventListener("click", function(e) {
            e.preventDefault();
            console.log("Mobile Sign Up button clicked!");
            
            container.classList.add("right-panel-active");
            
            // Reset login messages
            loginError.style.display = "none";
            loginSuccess.style.display = "none";
            loginError.textContent = "";
            loginSuccess.textContent = "";
            
            window.scrollTo(0, 0);
        });
    } else {
        console.log("Mobile signup button not found (optional)");
    }

    // Forgot Password
    if (resendOtpBtn) {
        resendOtpBtn.addEventListener("click", generateAndSendOTP);
    }
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", (e) => {
            e.preventDefault();
            showForgotPasswordPage();
        });
    }
    
    if (forgotBackToSignIn) {
        forgotBackToSignIn.addEventListener("click", (e) => {
            e.preventDefault();
            hideForgotPasswordPage();
        });
    }
    
    if (backToStep1) {
        backToStep1.addEventListener("click", (e) => {
            e.preventDefault();
            showStep(1);
        });
    }
    
    if (backToStep2) {
        backToStep2.addEventListener("click", (e) => {
            e.preventDefault();
            showStep(2);
        });
    }

    // Forgot password forms
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", handleForgotPasswordSubmit);
    }
    
    if (otpVerificationForm) {
        otpVerificationForm.addEventListener("submit", handleOtpVerificationSubmit);
    }
    
    if (newPasswordForm) {
        newPasswordForm.addEventListener("submit", handleNewPasswordSubmit);
    }

    // OTP input handling
    if (otpContainer) {
        otpContainer.addEventListener('input', e => {
            if (!e.target.classList.contains('otp-input')) return;
            
            const idx = parseInt(e.target.dataset.index);
            if (e.target.value.length === 1 && idx < 5) {
                otpContainer.querySelector(`[data-index="${idx + 1}"]`)?.focus();
            }
            
            e.target.classList.toggle('filled', e.target.value.length === 1);
        });

        otpContainer.addEventListener('keydown', e => {
            if (!e.target.classList.contains('otp-input')) return;
            
            const idx = parseInt(e.target.dataset.index);
            if (e.key === 'Backspace' && e.target.value === '' && idx > 0) {
                otpContainer.querySelector(`[data-index="${idx - 1}"]`)?.focus();
            }
        });
    }

    // Back to Sign In from Sign Up (dynamic event delegation)
    document.addEventListener('click', function(e) {
        if (e.target && (e.target.id === 'signupBackToSignIn' || e.target.closest('#signupBackToSignIn'))) {
            e.preventDefault();
            container.classList.remove("right-panel-active");
            resetMessages();
        }
        
        // Auto switch button from success message
        if (e.target && e.target.id === 'autoSwitchToSignIn') {
            e.preventDefault();
            container.classList.remove("right-panel-active");
            resetMessages();
        }
    });
    
    console.log("Event listeners initialized successfully");
}

// ============================
// Initialize Application
// ============================

// Initialize all event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Content Loaded - Initializing login system...");
    initEventListeners();
    
    // Auto-focus email field on sign in page
    if (!container.classList.contains("right-panel-active")) {
        setTimeout(() => {
            const loginEmail = document.getElementById("loginEmail");
            if (loginEmail) {
                loginEmail.focus();
                console.log("Auto-focused login email field");
            }
        }, 300);
    }
    
    // Debug: عرض بيانات localStorage الحالية
    console.log("Current localStorage data:");
    const users = JSON.parse(localStorage.getItem('newbus_users')) || [];
    console.log("Registered users:", users.length);
    users.forEach(user => {
        //console.log(`- ${user.email} (${user.accountType})`);
    });
});

// ============================
// Page Load Check - UPDATED
// ============================

// Check if user is already logged in
window.addEventListener('load', function() {
    console.log("Page loaded - checking authentication...");
    
    const currentUser = localStorage.getItem('currentUser');
    const userAccountType = localStorage.getItem('userAccountType');
    
    console.log("currentUser from localStorage:", currentUser);
    console.log("userAccountType from localStorage:", userAccountType);
    
    if (currentUser) {
        try {
            const userData = JSON.parse(currentUser);
            console.log("Parsed userData:", userData);
            
            if (userData.isLoggedIn === true && userAccountType) {
                console.log("User is already logged in, redirecting to:", userAccountType);
                
                // تأخير قليل للتأكد من تحميل الصفحة
                setTimeout(() => {
                    redirectBasedOnAccountType(userAccountType);
                }, 500);
            } else {
                console.log("User is not logged in or missing data");
                console.log("isLoggedIn:", userData.isLoggedIn);
                console.log("userAccountType:", userAccountType);
            }
        } catch (error) {
            console.error("Error parsing currentUser:", error);
        }
    } else {
        console.log("No currentUser found in localStorage");
    }
});

// ============================
// Debug Functions - للتحقق من المشكلة
// ============================

function debugLocalStorage() {
    console.log("=== LOCALSTORAGE DEBUG ===");
    console.log("All localStorage keys:", Object.keys(localStorage));
    
    const users = JSON.parse(localStorage.getItem('newbus_users')) || [];
    console.log("Number of users:", users.length);
    console.log("All users:", users);
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log("Current user:", currentUser);
    
    console.log("User account type:", localStorage.getItem('userAccountType'));
    console.log("User name:", localStorage.getItem('userName'));
}

