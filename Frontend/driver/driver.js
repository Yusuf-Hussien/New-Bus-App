// App State
const state = {
  isTripActive: false,
  passengerCount: 0,
  currentTrip: null,
  currentUser: null,
  signalRConnection: null, // SignalR connection reference
  map: null, // Leaflet map reference
  driverMarker: null, // Driver location marker
  driverCircle: null, // Driver location circle
  studentMarkers: {}, // Student location markers
  studentCircles: {}, // Student location circles
  locationInterval: null, // Location update interval
  isLocationSharing: false, // Location sharing status
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

// API Routes
let apiRoutes = [];

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
async function loadDriverInterface() {
  loadUserInfo();
  loadTripState();
  await loadRoutesFromAPI();
  renderInterface();
  initializeSignalR(); // Initialize SignalR connection
}

function loadUserInfo() {
  // Always use "السائق" instead of actual name
  dom.userName.textContent = "السائق";
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
  return `
        <div class="welcome-message">
            <h1>مرحباً السائق</h1>
            <p>استخدم تطبيق NewBus لإدارة رحلاتك وتتبع حافلتك</p>
        </div>
    `;
}

function renderDashboard() {
  return `
        <div class="driver-dashboard">
            <!-- Dashboard cards removed as requested -->
        </div>
    `;
}

function renderTripForm() {
  // Use API routes if available, otherwise use local routes
  const routesToRender = apiRoutes.length > 0 ? apiRoutes : CONFIG.ROUTES;
  
  return `
        <div class="trip-form">
            <h2 style="color: var(--primary); margin-bottom: 20px;">
                <i class="fas fa-play-circle"></i> بدء رحلة جديدة
            </h2>
            
            ${renderSelect("routeSelect", "اختر المسار", routesToRender)}
            
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
  // Handle API routes format (with from/to) or local routes format (with name)
  const optionsHtml = options
    .map((opt) => {
      const value = opt.id || opt.routeId || "";
      const displayName = opt.name || (opt.from && opt.to ? `${opt.from} ← ${opt.to}` : "");
      return `<option value="${value}">${displayName}</option>`;
    })
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
            <div class="driver-map" id="driverMap" style="height: 500px; width: 100%; position: relative; overflow: hidden;"></div>
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

  // Start location sharing via SignalR
  startLocationSharing();

  // إظهار إشعار النجاح
  if (typeof showToast === "function") {
    showToast("تم بدء الرحلة بنجاح", "success", "بدء الرحلة");
  }
}

async function endTrip() {
  if (!confirm("هل أنت متأكد من إنهاء الرحلة؟")) return;

  // Stop location sharing
  await stopLocationSharing();

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

async function resetTripState() {
  // Stop location sharing if active
  if (state.isLocationSharing) {
    await stopLocationSharing();
  }

  state.isTripActive = false;
  state.passengerCount = 0;
  state.currentTrip = null;
  localStorage.removeItem("currentTrip");
}

// Map Functions
function createDriverMap() {
  // Check if Leaflet is loaded
  if (typeof L === 'undefined') {
    console.error("Leaflet library is not loaded. Please ensure Leaflet is included before this script.");
    return;
  }

  // Check if map div exists
  const mapElement = document.getElementById("driverMap");
  if (!mapElement) {
    console.error("Map element 'driverMap' not found");
    return;
  }

  // Initialize Leaflet map
  const defaultLat = 27.2579; // Hurghada
  const defaultLng = 33.8116;

  try {
    state.map = L.map("driverMap").setView([defaultLat, defaultLng], 13);

    // Add tiles (OpenStreetMap)
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(state.map);

    console.log("Driver map initialized successfully");
  } catch (error) {
    console.error("Error initializing driver map:", error);
  }
}

// Update driver location marker on map
function updateDriverLocationMarker(lat, lng, accuracy) {
  if (!state.map) return;

  // Remove old markers
  if (state.driverMarker) {
    state.map.removeLayer(state.driverMarker);
  }
  if (state.driverCircle) {
    state.map.removeLayer(state.driverCircle);
  }

  // Bus icon
  const busIcon = L.icon({
    iconUrl: 'https://static.vecteezy.com/system/resources/thumbnails/004/433/862/small_2x/bus-icon-with-front-view-public-transportation-station-symbol-for-location-plan-free-vector.jpg',
    iconSize: [32, 37],
    iconAnchor: [16, 37],
    popupAnchor: [0, -37]
  });

  // Add new markers
  state.driverMarker = L.marker([lat, lng], { icon: busIcon })
    .bindPopup("موقعك الحالي - خط العرض: " + lat + ", خط الطول: " + lng)
    .addTo(state.map);

  state.driverCircle = L.circle([lat, lng], {
    radius: accuracy,
    color: "green",
    fillColor: "#51cf66",
    fillOpacity: 0.2,
  }).addTo(state.map);

  // Center map on driver location
  state.map.setView([lat, lng], 15);
}

// Update student location marker on map
function updateStudentLocationMarker(lat, lng, studentId, studentName, facultyName, degree) {
  if (!state.map) return;

  // Remove old markers
  if (state.studentMarkers[studentId]) {
    state.map.removeLayer(state.studentMarkers[studentId]);
  }
  if (state.studentCircles[studentId]) {
    state.map.removeLayer(state.studentCircles[studentId]);
  }

  // Add new markers
  state.studentMarkers[studentId] = L.marker([lat, lng])
    .bindPopup(`الطالب: ${studentName}<br>الكلية: ${facultyName}<br>الدرجة: ${degree}`)
    .addTo(state.map);

  state.studentCircles[studentId] = L.circle([lat, lng], {
    radius: 20,
    color: "blue",
    fillColor: "#3388ff",
    fillOpacity: 0.2,
  }).addTo(state.map);
}

// Remove student marker from map
function removeStudentMarkerFromMap(studentId) {
  if (!state.map) return;

  if (state.studentMarkers[studentId]) {
    state.map.removeLayer(state.studentMarkers[studentId]);
    delete state.studentMarkers[studentId];
  }
  if (state.studentCircles[studentId]) {
    state.map.removeLayer(state.studentCircles[studentId]);
    delete state.studentCircles[studentId];
  }
}

function checkSignalRConnection() {
  return (
    state.signalRConnection &&
    state.signalRConnection.state === signalR.HubConnectionState.Connected
  );
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

// Load Routes from API
async function loadRoutesFromAPI() {
  try {
    const response = (await apiAuthRequest("Routes", "GET")).data;
    
    if (response.success && response.data && Array.isArray(response.data)) {
      // Transform API routes to match the expected format
      apiRoutes = response.data.map((route) => ({
        id: route.id,
        name: `${route.from} ← ${route.to}`,
        from: route.from,
        to: route.to
      }));
      console.log("Loaded routes from API:", apiRoutes.length);
    } else {
      console.warn("Failed to load routes from API:", response.error);
      apiRoutes = [];
    }
  } catch (error) {
    console.error("Error loading routes from API:", error);
    apiRoutes = [];
  }
}


// SignalR Integration
function initializeSignalR() {
  if (!state.currentUser) {
    console.error("No current user found");
    return;
  }

  try {
    const token = state.currentUser?.refreshToken;

    if (!token) {
      console.error("No refresh token found");
      return;
    }

    // Create SignalR connection
    state.signalRConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://newbus.tryasp.net/LiveHub", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    // Setup SignalR event handlers
    setupSignalREventHandlers();

    // Start connection
    state.signalRConnection
      .start()
      .then(() => {
        console.log("SignalR Connected for Driver");
        if (typeof showToast === "function") {
          showToast("تم الاتصال بنجاح بخدمة التتبع المباشر", "success", "الاتصال جاهز");
        }
      })
      .catch((err) => {
        console.error("Connection error:", err);
        if (typeof showToast === "function") {
          showToast("فشل الاتصال بالخادم. يرجى تحديث الصفحة.", "error", "خطأ في الاتصال");
        } else {
          alert("Failed to connect to server. Please refresh the page.");
        }
      });

    // Handle reconnection events
    state.signalRConnection.onreconnected(() => {
      console.log("Reconnected!");
      if (typeof showToast === "function") {
        showToast("تم إعادة الاتصال بنجاح", "success", "إعادة الاتصال");
      }
    });

    state.signalRConnection.onreconnecting(() => {
      console.log("Reconnecting...");
    });

    state.signalRConnection.onclose(() => {
      console.log("Connection closed");
    });
  } catch (error) {
    console.error("Error initializing SignalR:", error);
  }
}

function setupSignalREventHandlers() {
  if (!state.signalRConnection) return;

  // New location from student
  state.signalRConnection.on(
    "NewLocationFromStudent",
    function (lat, lng, studentname, faculyname, degree, studentid) {
      console.log(
        "New location from student:",
        studentid,
        studentname,
        faculyname,
        degree,
        lat,
        lng
      );

      // Update map with student location
      updateStudentLocationMarker(
        parseFloat(lat),
        parseFloat(lng),
        studentid,
        studentname,
        faculyname,
        degree
      );
    }
  );

  // Stop location from student
  state.signalRConnection.on("stoplocationfromstudent", function (studentid) {
    console.log("Student stopped sharing location:", studentid);

    // Remove from map
    removeStudentMarkerFromMap(studentid);

    if (typeof showToast === "function") {
      showToast(
        `توقف الطالب ${studentid} عن مشاركة الموقع`,
        "info",
        "تحديث الموقع"
      );
    }
  });
}

// Location Sharing Functions
function startLocationSharing() {
  if (!state.signalRConnection || !checkSignalRConnection()) {
    if (typeof showToast === "function") {
      showToast("الاتصال غير جاهز. يرجى الانتظار والمحاولة مرة أخرى.", "error", "خطأ");
    } else {
      alert("Connection not ready. Please wait and try again.");
    }
    return;
  }

  if (!navigator.geolocation) {
    if (typeof showToast === "function") {
      showToast("المتصفح لا يدعم تحديد الموقع", "error", "خطأ");
    } else {
      alert("Geolocation is not supported by this browser");
    }
    return;
  }

  // Clear any existing interval
  if (state.locationInterval) {
    clearInterval(state.locationInterval);
  }

  state.isLocationSharing = true;

  // Get driver ID (you might need to adjust this based on your user structure)
  const driverId = state.currentUser?.id || state.currentUser?.userId || 1;

  // Start location updates
  state.locationInterval = setInterval(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        // Send to server via SignalR
        if (checkSignalRConnection()) {
          state.signalRConnection
            .invoke("StartTripForDriver", lat.toString(), lng.toString(), driverId.toString())
            .catch((err) => {
              console.error("Start trip error:", err);
            });
        }

        // Update map marker
        updateDriverLocationMarker(lat, lng, accuracy);
      },
      (error) => {
        console.error("Error getting location:", error.message);
        if (typeof showToast === "function") {
          showToast("تعذر الحصول على موقعك: " + error.message, "error", "خطأ");
        }
      }
    );
  }, 10000); // Every 10 seconds

  // Get initial position
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = position.coords.accuracy;
      updateDriverLocationMarker(lat, lng, accuracy);

      // Send initial location
      if (checkSignalRConnection()) {
        const driverId = state.currentUser?.id || state.currentUser?.userId || 1;
        state.signalRConnection
          .invoke("StartTripForDriver", lat.toString(), lng.toString(), driverId.toString())
          .catch((err) => {
            console.error("Start trip error:", err);
          });
      }
    },
    (error) => {
      console.error("Error getting initial location:", error.message);
    }
  );
}

async function stopLocationSharing() {
  state.isLocationSharing = false;

  // Clear interval
  if (state.locationInterval) {
    clearInterval(state.locationInterval);
    state.locationInterval = null;
  }

  // Remove markers from map
  if (state.driverMarker && state.map) {
    state.map.removeLayer(state.driverMarker);
    state.driverMarker = null;
  }
  if (state.driverCircle && state.map) {
    state.map.removeLayer(state.driverCircle);
    state.driverCircle = null;
  }

  // Stop location sharing on server
  if (checkSignalRConnection()) {
    try {
      await state.signalRConnection.invoke("stoplocationforidriver");
      console.log("Successfully stopped location sharing");
    } catch (err) {
      console.error("Error stopping location:", err);
    }
  }
}

// Cleanup on page unload
window.addEventListener("beforeunload", async function () {
  // Clear location interval
  if (state.locationInterval) {
    clearInterval(state.locationInterval);
  }

  // Stop location sharing if active
  if (state.isLocationSharing && checkSignalRConnection()) {
    try {
      await state.signalRConnection.invoke("stoplocationforidriver");
    } catch (err) {
      console.error("Error stopping location:", err);
    }
  }

  // Stop SignalR connection
  if (state.signalRConnection) {
    try {
      await state.signalRConnection.stop();
    } catch (err) {
      console.error("Error stopping SignalR:", err);
    }
  }
});
