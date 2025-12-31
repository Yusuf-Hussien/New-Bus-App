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
//const backToStep2 = document.getElementById("backToStep2");

document.getElementById('sendOtpBtn').addEventListener('click', handleRequstingOtpSubmit);
document.getElementById('submitOTPandPasswordBtn').addEventListener('click', handleNewPasswordSubmit);

const forgotPasswordForm = document.getElementById("forgotPasswordForm");
//const otpVerificationForm = document.getElementById("otpVerificationForm");
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
const submitOTPandPasswordBtn = document.getElementById("submitOTPandPasswordBtn");
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

let accountTypeForOTP = null;
function showStep(stepNumber) {
    [step1, step2].forEach(s => s.classList.remove("active"));
    if (stepNumber === 1) step1.classList.add("active");
    if (stepNumber === 2) step2.classList.add("active");
    //if (stepNumber === 3) step3.classList.add("active");
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

function getEnteredOTP() {
    return Array.from(otpContainer.querySelectorAll('.otp-input')).map(i => i.value).join('');
}


async function sendOTPRequest(email, accountTypeForOTP)
{    
       const ACCOUNT_TYPE_URI = {
        admin: 'Admins/OTPResetPassword',
        driver: 'Drivers/OTPResetPassword',
        passenger: 'Students/OTPResetPassword'
        };

        const response = apiRequest(ACCOUNT_TYPE_URI[accountTypeForOTP],"POST", {}, email);
        showForgotSuccess("OTP Sent Successfully to your Email");
        return;
    }

async function sendNewPasswordRequest(otp, newPassword,accountTypeForOTP)
    {
        const ACCOUNT_TYPE_URI = {
        admin: 'Admins/ChangePassword',
        driver: 'Drivers/ChangePassword',
        passenger: 'Students/ChangePassword'
        };

        const body = {
            password: newPassword,
            otp: otp
        };

        const response = apiRequest(ACCOUNT_TYPE_URI[accountTypeForOTP],"POST",{}, body);
        if(response.success)
            showForgotSuccess("OTP Sent Successfully to your Email");
        else 
            showForgotError("Failed to update password."+response?.Message);
    }

// ============================
// Forgot Password Handlers
// ============================

function handleRequstingOtpSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("forgotEmail").value.trim();
    const accountTypeForOTP = document.getElementById("accountTypeForOTP").value;
    
    forgotError.style.display = forgotSuccess.style.display = "none";

    if (!email || !accountTypeForOTP) {
        showForgotError("Please enter email and account type");
        return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showForgotError("Please enter a valid email address");
        return;
    }

    sendOTPRequest(email, accountTypeForOTP);
    accountTypeForPassword = accountTypeForOTP;
    showStep(2);
}

async function handleNewPasswordSubmit(e) {
    e.preventDefault();
    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword = document.getElementById("confirmNewPassword").value;
    const otp = getEnteredOTP();
    
    otpError.style.display = otpSuccess.style.display = "none";

    if (otp.length !== 6) {
        showOtpError("Please enter the complete 6-digit OTP");
        return;
    }

    passwordError.style.display = passwordSuccess.style.display = "none";

    if (newPassword.length < 8) {
        showPasswordError("Password must be at least 8 characters");
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        showPasswordError("Passwords do not match");
        return;
    }

    if (await updateUserPassword(otp, newPassword,accountTypeForPassword)) {
        showOtpSuccess("OTP verified successfully and Password updated!");
        //showPasswordSuccess("Password updated successfully!");
        setTimeout(() => {
            hideForgotPasswordPage();
            showToast("Password has been reset successfully!");
        }, 10);
    } else {
        showPasswordError("Failed to update password. Please try again.");
    }
}

async function updateUserPassword(otp, newPassword,accountTypeForOTP) {
    try {
        const response = await sendNewPasswordRequest(otp, newPassword,accountTypeForOTP);
        if (response?.success) return true;
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
            document.getElementById("loginEmail").value = userData.userName;
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

async function handleSignInSubmit(event) {
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

    if (await handleLogin(email, password, selectedAccountType)) return;

    showError("Invalid email or password", 'login');
}

async function handleLogin(email, password, selectedAccountType) {

    const userData = {
        userName: email,
        password: password,
    };

    const URI = {
        admin: 'Auth/LoginAdmin',
        driver: 'Auth/LoginDriver',
        passenger: 'Auth/LoginStudent'
    };

    const response = await apiRequest(URI[selectedAccountType], "POST", {}, userData);
    
    if (!response?.success) {
        const errorMsg = response?.error || "Login failed. Please check your credentials.";
        showError(errorMsg, 'login');
        return false;
    }

    saveUserCookies(email, response.data, selectedAccountType);
    return true;
}

function saveUserCookies(email, userData, accountType) {
    if (!userData) {
        console.error("No user data provided");
        showError("Login failed - no user data", 'login');
        return;
    }

    const accessToken = userData.data.accessToken || '';
    const refreshToken = userData.data.refreshToken || '';

    // Calculate exact expiration times
    const accessTokenExpiresAt = Date.now() + (30 * 60 * 1000);        // 30 minutes
    const refreshTokenExpiresAt = Date.now() + (10 * 24 * 60 * 60 * 1000); // 10 days

    // Save to localStorage/sessionStorage for better security
    const sessionData = {
        userName: email,
        accessToken,
        refreshToken,
        accessTokenExpiresAt,    // Useful for proactive refresh
        refreshTokenExpiresAt,
    };

    // Use localStorage for persistence across tabs
    localStorage.setItem('userSession', JSON.stringify(sessionData));
    
    // Alternatively, use sessionStorage for tab-specific sessions
    //sessionStorage.setItem('userSession', JSON.stringify(sessionData));

    // Show success message and redirect
    showSuccess("Login successful! Redirecting...", 'login');
    redirectBasedOnAccountType(accountType);
}


function redirectBasedOnAccountType(accountType) {    
    // التحقق من أن الصفحات موجودة
    const pages = {
        passenger: 'passenger.html',
        driver: 'driver.html',
        admin: 'admin.html'
    };
    
    if (pages[accountType]) {
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
        resendOtpBtn.addEventListener("click", handleRequstingOtpSubmit);
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
        forgotPasswordForm.addEventListener("submit", handleRequstingOtpSubmit);
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
                    //redirectBasedOnAccountType(userAccountType);
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