// ============================
// DOM Elements
// ============================

// Main container & panels
const container = document.getElementById("container");
const signUpBtn = document.getElementById("signUp");
const signInBtn = document.getElementById("signIn");
const signUpForm = document.getElementById("signUpForm");
const signInForm = document.getElementById("signInForm");

// Messages & Toast
const error = document.getElementById("error");
const success = document.getElementById("success");
const loginError = document.getElementById("loginError");
const loginSuccess = document.getElementById("loginSuccess");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");

// Forgot Password Page
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const forgotPasswordPage = document.getElementById("forgotPasswordPage");
const backToSignIn = document.getElementById("backToSignIn");
const backToStep1 = document.getElementById("backToStep1");
const backToStep2 = document.getElementById("backToStep2");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const otpVerificationForm = document.getElementById("otpVerificationForm");
const newPasswordForm = document.getElementById("newPasswordForm");

// Forgot Password Messages & Steps
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

// Mobile signup button
const mobileSignupBtn = document.getElementById('mobileSignupBtn');

// ============================
// Global Variables
// ============================
let resetUserData = null;
let currentOTP = null;
let otpExpiryTime = null;
let otpTimerInterval = null;

// ============================
// Demo Accounts
// ============================
const DEMO_ACCOUNTS = {
  'passenger@newbus.com': { password: '123456', type: 'passenger', name: 'John Passenger', username: 'john_passenger', phone: '+201234567890', gender: 'male' },
  'driver@newbus.com': { password: '123456', type: 'driver', name: 'Ahmed Driver', username: 'ahmed_driver', phone: '+201112223344', gender: 'male' },
  'admin@newbus.com': { password: '123456', type: 'admin', name: 'Admin User', username: 'admin_user', phone: '+201009998877', gender: 'male' }
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
  forgotError.style.display = "none";
  forgotError.textContent = "";
  forgotSuccess.style.display = "none";
  forgotSuccess.textContent = "";
}

function resetStep3() {
  newPasswordForm.reset();
  passwordError.style.display = "none";
  passwordError.textContent = "";
  passwordSuccess.style.display = "none";
  passwordSuccess.textContent = "";
}

function resetOtpForm() {
  otpContainer.querySelectorAll('.otp-input').forEach(input => {
    input.value = '';
    input.classList.remove('filled');
  });
  otpError.style.display = "none"; otpError.textContent = "";
  otpSuccess.style.display = "none"; otpSuccess.textContent = "";
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
  if (otpTimerInterval) { clearInterval(otpTimerInterval); otpTimerInterval = null; }
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

  if (!email || !phone || !username) { showForgotError("Please enter email, phone, and username"); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showForgotError("Please enter a valid email address"); return; }

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
    setTimeout(() => { showStep(2); generateAndSendOTP(); }, 1000);
  } else showForgotError("No account found with these details. Make sure all information matches.");
}

function handleOtpVerificationSubmit(e) {
  e.preventDefault();
  const enteredOTP = getEnteredOTP();
  otpError.style.display = otpSuccess.style.display = "none";

  if (enteredOTP.length !== 6) { showOtpError("Please enter the complete 6-digit OTP"); return; }
  if (Date.now() > otpExpiryTime) { showOtpError("OTP has expired. Please request a new one."); return; }

  if (enteredOTP === currentOTP) {
    showOtpSuccess("OTP verified successfully!");
    clearOtpTimer();
    setTimeout(() => showStep(3), 1000);
  } else { showOtpError("Invalid OTP. Please try again."); shakeElement(otpError); }
}

function handleNewPasswordSubmit(e) {
  e.preventDefault();
  const newPassword = document.getElementById("newPassword").value;
  const confirmNewPassword = document.getElementById("confirmNewPassword").value;

  passwordError.style.display = passwordSuccess.style.display = "none";

  if (newPassword.length < 8) { showPasswordError("Password must be at least 8 characters"); return; }
  if (newPassword !== confirmNewPassword) { showPasswordError("Passwords do not match"); return; }

  if (updateUserPassword(resetUserData, newPassword)) {
    showPasswordSuccess("Password updated successfully!");
    setTimeout(() => { hideForgotPasswordPage(); showToast("Password has been reset successfully!"); }, 1500);
  } else showPasswordError("Failed to update password. Please try again.");
}

// ============================
// Update User Password
// ============================
function updateUserPassword(userData, newPassword) {
  try {
    const users = JSON.parse(localStorage.getItem('newbus_users')) || [];

    if (userData.isDemo) {
      const idx = users.findIndex(u => u.email === userData.email);
      if (idx === -1) users.push({ ...userData, password: newPassword, isDemoBased: true, id: Date.now(), createdAt: new Date().toISOString() });
      else users[idx].password = newPassword;
    } else {
      const idx = users.findIndex(u => u.email === userData.email);
      if (idx !== -1) users[idx].password = newPassword;
    }

    localStorage.setItem('newbus_users', JSON.stringify(users));
    return true;
  } catch (err) { console.error("Error updating password:", err); return false; }
}

// ============================
// OTP UI Messages
// ============================
function showForgotError(msg) { forgotError.textContent = msg; forgotError.style.display="block"; shakeElement(forgotError); }
function showForgotSuccess(msg) { forgotSuccess.textContent = msg; forgotSuccess.style.display="block"; }
function showOtpError(msg) { otpError.textContent = msg; otpError.style.display="block"; shakeElement(otpError); }
function showOtpSuccess(msg) { otpSuccess.textContent = msg; otpSuccess.style.display="block"; }
function showPasswordError(msg) { passwordError.textContent = msg; passwordError.style.display="block"; shakeElement(passwordError); }
function showPasswordSuccess(msg) { passwordSuccess.textContent = msg; passwordSuccess.style.display="block"; }

// ============================
// Sign Up / Sign In Handlers
// ============================
function togglePanel(isSignUp) { container.classList.toggle("right-panel-active", isSignUp); resetMessages(); }

signUpBtn.addEventListener("click", () => togglePanel(true));
signInBtn.addEventListener("click", () => togglePanel(false));
signUpForm.addEventListener("submit", handleSignUpSubmit);
signInForm.addEventListener("submit", handleSignInSubmit);
resendOtpBtn.addEventListener("click", generateAndSendOTP);

document.getElementById("signupBackToSignIn")?.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
  window.scrollTo(0,0);
});

// ============================
// OTP Input Handling
// ============================
otpContainer.addEventListener('input', e => {
  if (!e.target.classList.contains('otp-input')) return;
  const idx = parseInt(e.target.dataset.index);
  if (e.target.value.length === 1 && idx < 5) otpContainer.querySelector(`[data-index="${idx+1}"]`)?.focus();
  e.target.classList.toggle('filled', e.target.value.length === 1);
});

otpContainer.addEventListener('keydown', e => {
  if (!e.target.classList.contains('otp-input')) return;
  const idx = parseInt(e.target.dataset.index);
  if (e.key === 'Backspace' && e.target.value === '' && idx > 0) otpContainer.querySelector(`[data-index="${idx-1}"]`)?.focus();
});

// ============================
// Sign Up Logic
// ============================
function handleSignUpSubmit(event) {
  event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const username = document.getElementById("username").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const gender = document.getElementById("gender").value;
  const accountType = document.getElementById("accountType").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  resetMessages();
  if (!validateSignUp(name,email,username,phone,gender,accountType,password,confirmPassword)) return;
  if (isEmailRegistered(email)) { showError("This email is already registered"); return; }
  if (isUsernameTaken(username)) { showError("Username is already taken. Please choose another one"); return; }

  createUserAccount(name,email,username,phone,gender,accountType,password);
}

function validateSignUp(name,email,username,phone,gender,accountType,password,confirmPassword) {
  if (!name) { showError("Please enter your full name"); return false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError("Please enter a valid email"); return false; }
  if (!username || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) { showError("Username must be 3-20 characters"); return false; }
  if (!phone || !/^[+]?[0-9\s\-\(\)]{10,}$/.test(phone)) { showError("Please enter a valid phone number"); return false; }
  if (!gender) { showError("Please select your gender"); return false; }
  if (!accountType) { showError("Please select account type"); return false; }
  if (password.length < 8) { showError("Password must be at least 8 characters"); return false; }
  if (password !== confirmPassword) { showError("Passwords do not match!"); return false; }
  return true;
}

function isEmailRegistered(email) { return (JSON.parse(localStorage.getItem('newbus_users'))||[]).some(u=>u.email===email); }
function isUsernameTaken(username) { return (JSON.parse(localStorage.getItem('newbus_users'))||[]).some(u=>u.username===username); }

function createUserAccount(name,email,username,phone,gender,accountType,password) {
  const userData = { id: Date.now(), name,email,username,phone,gender,accountType,password,isLoggedIn:true,createdAt:new Date().toISOString() };
  const users = JSON.parse(localStorage.getItem('newbus_users')) || [];
  users.push(userData);
  localStorage.setItem('newbus_users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(userData));
  localStorage.setItem('userAccountType', accountType);
  localStorage.setItem('userName', name);
  showSuccess("Account created successfully! Redirecting...");
  setTimeout(()=>showToast("Account created successfully!"),500);
  signUpForm.reset();
  setTimeout(()=>redirectBasedOnAccountType(accountType),2000);
}

// ============================
// Sign In Logic
// ============================
function handleSignInSubmit(event) {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const selectedAccountType = document.querySelector('input[name="loginAccountType"]:checked').value;

  resetMessages();
  if (!email) { showError("Please enter your email",'login'); return; }
  if (!password) { showError("Please enter your password",'login'); return; }

  if (tryDemoLogin(email,password,selectedAccountType)) return;
  if (tryLocalLogin(email,password,selectedAccountType)) return;

  showError("Invalid email or password",'login');
}

function tryDemoLogin(email,password,selectedAccountType){
  if (!DEMO_ACCOUNTS[email] || DEMO_ACCOUNTS[email].password!==password) return false;
  const account = DEMO_ACCOUNTS[email];
  if (account.type!==selectedAccountType){ showError(`Please select "${account.type}" account type to login`,'login'); return false; }
  saveUserSession({id:Date.now(),email,name:account.name,username:account.username,phone:account.phone,gender:account.gender,accountType:
  account.type,password:account.password,isLoggedIn:true,createdAt:new Date().toISOString()});
  redirectBasedOnAccountType(account.type);
  return true;
}
// Save session & redirect
function saveUserSession(userData, accountType, userName) {
  localStorage.setItem('currentUser', JSON.stringify(userData));
  localStorage.setItem('userAccountType', accountType);
  localStorage.setItem('userName', userName);
  showSuccess("Signing in...", 'login');
  setTimeout(() => redirectBasedOnAccountType(accountType), 1500);
}

// Try demo login (complete)
function tryDemoLogin(email, password, selectedAccountType){
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
  saveUserSession(userData, account.type, account.name);
  return true;
}

// Try local login (complete)
function tryLocalLogin(email, password, selectedAccountType) {
  const users = JSON.parse(localStorage.getItem('newbus_users')) || [];
  const user = users.find(u => u.email === email);
  if (!user || user.password !== password) return false;
  if (user.accountType !== selectedAccountType) {
    showError(`Please select "${user.accountType}" account type to login`, 'login');
    return false;
  }
  user.isLoggedIn = true;
  saveUserSession(user, user.accountType, user.name);
  return true;
}

// ============================
// Forgot Password Navigation
// ============================

// تصحيح: استخدام الـ id الصحيح
const forgotBackToSignIn = document.getElementById("forgotBackToSignIn");

// إضافة event listeners لجميع أزرار التنقل
forgotPasswordLink?.addEventListener("click", (e) => {
  e.preventDefault();
  showForgotPasswordPage();
});

forgotBackToSignIn?.addEventListener("click", (e) => {
  e.preventDefault();
  hideForgotPasswordPage();
});

backToStep1?.addEventListener("click", (e) => {
  e.preventDefault();
  showStep(1);
});

backToStep2?.addEventListener("click", (e) => {
  e.preventDefault();
  showStep(2);
});

// إضافة event listeners للنماذج
forgotPasswordForm?.addEventListener("submit", handleForgotPasswordSubmit);
otpVerificationForm?.addEventListener("submit", handleOtpVerificationSubmit);
newPasswordForm?.addEventListener("submit", handleNewPasswordSubmit);