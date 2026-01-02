// App State
const state = {
  isTripActive: false,
  passengerCount: 0,
  currentTrip: null,
  currentUser: null,
};

// Configuration
const API_BASE_URL = "https://newbus.tryasp.net/api/";

const CONFIG = {
  ROUTES: [
    { id: "city-campus", name: "المدينة الجامعية ← الجامعة" },
    { id: "dahar-feroz", name: "موقف الدهار ← الفيروز" },
    { id: "biology-dahar", name: "كلية تربية الاحياء ← موقف الدهار" },
    { id: "feroz-campus", name: "الفيروز ← الجامعة" },
  ],
  STATIONS: [
    { name: "المدينة الجامعية", top: "20%", left: "20%" },
    { name: "موقف الدهار", top: "40%", left: "40%" },
    { name: "كلية تربية الاحياء", top: "60%", left: "60%" },
    { name: "الفيروز", top: "30%", left: "80%" },
    { name: "الجامعة", top: "70%", left: "80%" },
  ],
  MAX_PASSENGERS: 60,
  MIN_PASSENGERS: 0,
};

// DOM Elements
const dom = {
  mainContent: document.getElementById("mainContent"),
  userName: document.getElementById("userName"),
};

// Auth Functions
function checkAuth() {
  state.currentUser = JSON.parse(localStorage.getItem("userSession"));
 if(state.currentUser == null) {
    window.location.href = "login.html";
    return false;
  }
  else if(state.currentUser.refreshTokenExpiresAt < Date.now()) {
    showAccessDenied();
    window.location.href = "login.html";
    return false;
  }
  if (state.currentUser.userAccountType !== "driver") {
    showAccessDenied();
    return false;
  }

  return true;
}

function showAccessDenied() {
  dom.mainContent.innerHTML = `
        <div class="access-denied">
            <i class="fas fa-exclamation-triangle"></i>
            <h2>غير مسموح بالوصول</h2>
            <p>هذه الصفحة مخصصة للسائقين فقط. يرجى تسجيل الدخول بحساب سائق.</p>
            <button class="btn" onclick="handleLogout()">
                <i class="fas fa-sign-in-alt"></i> تسجيل الدخول بحساب آخر
            </button>
        </div>
    `;
}

function handleLogout() {
  if (!confirm("هل تريد تسجيل الخروج؟")) return;

  if (state.currentUser) {
    state.currentUser.isLoggedIn = false;
    apiRequest("Auth/Logout", "POST", {}, {
      refreshToken: state.currentUser.refreshToken
    }).catch((error) => { 
      console.error("خطأ أثناء تسجيل الخروج:", error); 
    });
    localStorage.setItem("userSession", JSON.stringify(null));
  }
  window.location.href = "login.html";
}

// Load Functions
function loadDriverInterface() {
  loadUserInfo();
  loadTripState();
  renderInterface();
}

function loadUserInfo() {
  // استخدام دالة getProfileData من profile.js إذا كانت موجودة
  if (typeof getProfileData === "function") {
    const profile = getProfileData();
    dom.userName.textContent =
      profile.firstName || state.currentUser.name || "السائق";
  } else {
    dom.userName.textContent = state.currentUser.name || "السائق";
  }
}

function loadTripState() {
  const savedTrip = JSON.parse(localStorage.getItem("currentTrip"));

  if (savedTrip && savedTrip.isActive) {
    state.isTripActive = true;
    state.currentTrip = savedTrip;
    state.passengerCount = savedTrip.passengerCount || 0;
  }
}

// Render Functions
function renderInterface() {
  dom.mainContent.innerHTML = `
        ${renderWelcomeMessage()}
        ${renderDashboard()}
        ${state.isTripActive ? renderActiveTrip() : renderTripForm()}
        ${renderMap()}
    `;

  createDriverMap();
  if (!state.isTripActive) setupTripFormEvents();

  // إضافة زر Complete Trip إذا كانت هناك رحلة نشطة
  if (state.isTripActive) {
    const completeTripBtn = document.getElementById("completeTripBtn");
    if (completeTripBtn) {
      completeTripBtn.addEventListener("click", toggleTripCompletion);
    }
  }
}

function renderWelcomeMessage() {
  let driverName = state.currentUser.name || "عزيزي السائق";

  // استخدام دالة getProfileData إذا كانت موجودة
  if (typeof getProfileData === "function") {
    const profile = getProfileData();
    driverName = profile.firstName || driverName;
  }

  return `
        <div class="welcome-message">
            <h1>مرحباً ${driverName}</h1>
            <p>استخدم تطبيق NewBus لإدارة رحلاتك وتتبع حافلتك</p>
        </div>
    `;
}

function renderDashboard() {
  return `
        <div class="driver-dashboard">
            <div class="dashboard-card">
                <div class="card-header">
                    <div class="card-icon primary">
                        <i class="fas fa-road"></i>
                    </div>
                    <div class="card-title">رحلات اليوم</div>
                </div>
                <div style="text-align: center; padding: 20px 0;">
                    <div style="font-size: 3rem; font-weight: 700; color: var(--primary);">3</div>
                    <div style="color: var(--gray);">رحلة مكتملة</div>
                </div>
            </div>
            <div class="dashboard-card">
                <div class="card-header">
                    <div class="card-icon success">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="card-title">متوسط الوقت</div>
                </div>
                <div style="text-align: center; padding: 20px 0;">
                    <div style="font-size: 3rem; font-weight: 700; color: var(--success);">24</div>
                    <div style="color: var(--gray);">دقيقة للرحلة</div>
                </div>
            </div>
            <!-- تم حذف بطاقة الركاب اليوم حسب الطلب -->
        </div>
    `;
}

function renderTripForm() {
  return `
        <div class="trip-form">
            <h2 style="color: var(--primary); margin-bottom: 20px;">
                <i class="fas fa-play-circle"></i> بدء رحلة جديدة
            </h2>
            
            ${renderSelect("routeSelect", "اختر المسار", CONFIG.ROUTES)}
            
            <div style="text-align: center; margin: 25px 0;">
                <label class="form-label">عدد الركاب الحالي</label>
                <div class="passenger-count">
                    <button class="count-btn" id="decreasePassengers">-</button>
                    <div class="count-display" id="passengerCountDisplay">${
                      state.passengerCount
                    }</div>
                    <button class="count-btn" id="increasePassengers">+</button>
                </div>
            </div>
            
            <button class="action-btn start" id="startTripBtn">
                <i class="fas fa-play"></i> بدء الرحلة
            </button>
        </div>
    `;
}

function renderSelect(id, label, options) {
  const optionsHtml = options
    .map((opt) => `<option value="${opt.id}">${opt.name}</option>`)
    .join("");

  return `
        <div class="form-group">
            <label class="form-label">${label}</label>
            <select class="form-control" id="${id}">
                <option value="">-- ${label} --</option>
                ${optionsHtml}
            </select>
        </div>
    `;
}

function renderActiveTrip() {
  // الحصول على حالة إكمال الرحلة من localStorage
  const tripCompletionStatus = JSON.parse(
    localStorage.getItem("tripCompletionStatus")
  ) || {
    isCompleted: false,
    lastUpdated: null,
  };

  const completeBtnText = tripCompletionStatus.isCompleted
    ? '<i class="fas fa-check-circle"></i> الرحلة مكتملة'
    : '<i class="fas fa-times-circle"></i> الرحلة غير مكتملة (الحافلة ممتلئة)';

  const completeBtnClass = tripCompletionStatus.isCompleted ? "" : "incomplete";

  return `
        <div class="active-trip">
            <div class="trip-header">
                <div class="trip-title">
                    <i class="fas fa-bus"></i> الرحلة الجارية
                </div>
                <div style="background: var(--success); color: white; padding: 5px 15px; border-radius: 20px; font-weight: 600;">
                    🟢 نشطة
                </div>
            </div>
            
            ${renderTripDetails()}
            ${renderTripStats()}
            
            <!-- زر Complete Trip الجديد -->
            <button class="complete-trip-btn ${completeBtnClass}" id="completeTripBtn">
                ${completeBtnText}
            </button>
            
            <button class="action-btn end" id="endTripBtn" style="margin-top: 25px;">
                <i class="fas fa-stop"></i> إنهاء الرحلة
            </button>
        </div>
    `;
}

function renderTripDetails() {
  if (!state.currentTrip) return "";

  return `
        <div style="margin-bottom: 20px;">
            <div style="font-size: 1.1rem; margin-bottom: 10px;">
                <strong>المسار:</strong> ${state.currentTrip.routeName}
            </div>
            <div style="font-size: 1.1rem; margin-bottom: 10px;">
                <strong>الحافلة:</strong> ${state.currentTrip.busNumber}
            </div>
            <div style="font-size: 1.1rem;">
                <strong>وقت البدء:</strong> ${state.currentTrip.startTime}
            </div>
        </div>
    `;
}

function renderTripStats() {
  return `
        <div class="trip-stats">
            <div class="stat-item">
                <div class="stat-value">${state.passengerCount}</div>
                <div class="stat-label">عدد الركاب</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">24</div>
                <div class="stat-label">دقيقة متبقية</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">65%</div>
                <div class="stat-label">إكمال الرحلة</div>
            </div>
        </div>
    `;
}

function renderMap() {
  return `
        <div class="driver-map-container">
            <div class="map-title">
                <i class="fas fa-map-marked-alt"></i> خريطة الرحلة
            </div>
            <div class="driver-map" id="driverMap"></div>
        </div>
    `;
}

// Trip Form Events
function setupTripFormEvents() {
  document
    .getElementById("increasePassengers")
    ?.addEventListener("click", increasePassengers);
  document
    .getElementById("decreasePassengers")
    ?.addEventListener("click", decreasePassengers);
  document.getElementById("startTripBtn")?.addEventListener("click", startTrip);
}

function increasePassengers() {
  if (state.passengerCount < CONFIG.MAX_PASSENGERS) {
    state.passengerCount++;
    updatePassengerCount();
  }
}

function decreasePassengers() {
  if (state.passengerCount > CONFIG.MIN_PASSENGERS) {
    state.passengerCount--;
    updatePassengerCount();
  }
}

function updatePassengerCount() {
  const display = document.getElementById("passengerCountDisplay");
  if (display) display.textContent = state.passengerCount;
}

// Trip Functions
function startTrip() {
  const routeSelect = document.getElementById("routeSelect");

  if (!routeSelect.value) {
    // استخدام showToast إذا كان موجوداً، وإلا استخدام alert
    if (typeof showToast === "function") {
      showToast("الرجاء اختيار المسار قبل بدء الرحلة", "error", "بيانات ناقصة");
    } else {
      alert("الرجاء اختيار المسار قبل بدء الرحلة");
    }
    return;
  }

  const routeName = routeSelect.options[routeSelect.selectedIndex].text;

  // الحصول على رقم لوحة الحافلة من البروفايل
  let busNumber = "غير محدد";
  if (typeof getProfileData === "function") {
    const profile = getProfileData();
    busNumber = profile.plateNoBus || "غير محدد";
  }

  state.isTripActive = true;
  state.currentTrip = {
    isActive: true,
    routeName: routeName,
    busNumber: busNumber,
    passengerCount: state.passengerCount,
    startTime: new Date().toLocaleTimeString(),
    startDate: new Date().toISOString(),
  };

  saveTripToStorage();
  renderInterface();

  // إضافة مستمع الحدث لزر إنهاء الرحلة
  const endTripBtn = document.getElementById("endTripBtn");
  if (endTripBtn) {
    endTripBtn.addEventListener("click", endTrip);
  }

  // إضافة مستمع الحدث لزر Complete Trip
  const completeTripBtn = document.getElementById("completeTripBtn");
  if (completeTripBtn && typeof toggleTripCompletion === "function") {
    completeTripBtn.addEventListener("click", toggleTripCompletion);
  }

  // إظهار إشعار النجاح
  if (typeof showToast === "function") {
    showToast("تم بدء الرحلة بنجاح", "success", "بدء الرحلة");
  }
}

function endTrip() {
  if (!confirm("هل أنت متأكد من إنهاء الرحلة؟")) return;

  saveCompletedTrip();
  resetTripState();
  renderInterface();

  // إظهار إشعار النجاح
  if (typeof showToast === "function") {
    showToast(
      "تم إنهاء الرحلة بنجاح وتخزين بياناتها",
      "success",
      "إنهاء الرحلة"
    );
  } else {
    alert("تم إنهاء الرحلة بنجاح وتخزين بياناتها");
  }
}

function saveTripToStorage() {
  localStorage.setItem("currentTrip", JSON.stringify(state.currentTrip));
}

function saveCompletedTrip() {
  const completedTrips =
    JSON.parse(localStorage.getItem("completedTrips")) || [];

  if (state.currentTrip) {
    state.currentTrip.endTime = new Date().toLocaleTimeString();
    state.currentTrip.isActive = false;
    completedTrips.push(state.currentTrip);
    localStorage.setItem("completedTrips", JSON.stringify(completedTrips));
  }
}

function resetTripState() {
  state.isTripActive = false;
  state.passengerCount = 0;
  state.currentTrip = null;
  localStorage.removeItem("currentTrip");
}

// Map Functions
function createDriverMap() {
  const map = document.getElementById("driverMap");
  if (!map) return;

  createBusMarker(map);
  createStationMarkers(map);

  if (state.isTripActive) animateBus();
}

function createBusMarker(map) {
  const busMarker = document.createElement("div");
  busMarker.className = "bus-marker";
  busMarker.title = "موقع حافلتك";

  Object.assign(busMarker.style, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "30px",
    height: "30px",
    background: "var(--primary)",
    borderRadius: "50%",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
    boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
    border: "3px solid white",
  });

  busMarker.innerHTML = '<i class="fas fa-bus"></i>';
  map.appendChild(busMarker);
}

function createStationMarkers(map) {
  CONFIG.STATIONS.forEach((station) => {
    const marker = document.createElement("div");
    marker.className = "station-marker";
    marker.title = station.name;

    Object.assign(marker.style, {
      position: "absolute",
      top: station.top,
      left: station.left,
      width: "12px",
      height: "12px",
      background: "var(--warning)",
      borderRadius: "50%",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      border: "2px solid white",
    });

    map.appendChild(marker);
  });
}

function animateBus() {
  const busMarker = document.querySelector(".bus-marker");
  if (!busMarker) return;

  let position = 0;
  const animationInterval = setInterval(() => {
    if (!state.isTripActive) {
      clearInterval(animationInterval);
      return;
    }

    position = (position + 0.5) % 100;
    busMarker.style.left = `${20 + position * 0.6}%`;
    busMarker.style.top = `${30 + Math.sin(position * 0.1) * 20}%`;
  }, 100);
}

// دالة toggleTripCompletion إذا لم تكن موجودة في profile.js
if (typeof toggleTripCompletion === "undefined") {
  function toggleTripCompletion() {
    const tripCompletionStatus = JSON.parse(
      localStorage.getItem("tripCompletionStatus")
    ) || {
      isCompleted: false,
      lastUpdated: null,
    };

    tripCompletionStatus.isCompleted = !tripCompletionStatus.isCompleted;
    tripCompletionStatus.lastUpdated = new Date().toISOString();

    localStorage.setItem(
      "tripCompletionStatus",
      JSON.stringify(tripCompletionStatus)
    );

    // تحديث الزر في الواجهة
    const button = document.getElementById("completeTripBtn");
    if (button) {
      if (tripCompletionStatus.isCompleted) {
        button.classList.remove("incomplete");
        button.innerHTML = '<i class="fas fa-check-circle"></i> الرحلة مكتملة';
      } else {
        button.classList.add("incomplete");
        button.innerHTML =
          '<i class="fas fa-times-circle"></i> الرحلة غير مكتملة (الحافلة ممتلئة)';
      }
    }

    // إظهار إشعار
    if (typeof showToast === "function") {
      const message = tripCompletionStatus.isCompleted
        ? "تم تعليم الرحلة كمكتملة بنجاح"
        : "تم تعليم الرحلة كغير مكتملة (الحافلة ممتلئة)";
      showToast(message, "success", "حالة الرحلة");
    }

    return tripCompletionStatus;
  }
}

// Initialize App
document.addEventListener("DOMContentLoaded", function () {
  if (checkAuth()) {
    loadDriverInterface();

    // تهيئة زر العائم للهواتف إذا كانت الدالة موجودة
    if (typeof setupFloatingButton === "function") {
      setupFloatingButton();
    }
  }
});







// ============================
// API Helpers
// ============================

async function apiAuthRequest(URI, method = "GET", headers = {}, data = null) {
  if (state.currentUser.accessTokenExpiresAt < Date.now()) 
    headers["Authorization"] = `Bearer ${state.currentUser?.refreshToken || ""}`;
  else 
    headers["Authorization"] = `Bearer ${state.currentUser?.accessToken || ""}`;
  
  return await apiRequest(URI, method, headers, data);
}

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
