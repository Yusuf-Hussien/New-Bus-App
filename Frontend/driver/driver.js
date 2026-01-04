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
  knownStudents: new Set(), // Track known students to prevent duplicate notifications
  currentDriverLocation: null, // Store current driver location
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
    localStorage.setItem("currentTrip", JSON.stringify(null));

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

  // Set up event listeners for active trip buttons
  if (state.isTripActive) {
    setupActiveTripButtons();
  }

  // Setup fit to location button
  setupFitToLocationButton();
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
            
            <div class="form-group">
                <label class="form-label">حالة الحافلة</label>
                <select class="form-control" id="statusTripSelect">
                    <option value="1">متاحة (الحافلة متاحة للركاب)</option>
                    <option value="2">ممتلئة (الحافلة ممتلئة)</option>
                </select>
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
  // Get current statusTripId from trip
  const currentStatusTripId = state.currentTrip?.statusTripId || 1;
  const isFull = currentStatusTripId === 2;

  const completeBtnText = isFull
    ? '<i class="fas fa-times-circle"></i> الحافلة ممتلئة'
    : '<i class="fas fa-check-circle"></i> الحافلة متاحة';

  const completeBtnClass = isFull ? "incomplete" : "";

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
  const currentStatusTripId = state.currentTrip?.statusTripId || 1;
  const statusText = currentStatusTripId === 2 ? "ممتلئة" : "متاحة";
  
  return `
        <div class="trip-stats">
            <div class="stat-item">
                <div class="stat-value">${statusText}</div>
                <div class="stat-label">حالة الحافلة</div>
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
        <div class="driver-map-container" style="height: 500px; width: 100%;">
            <div class="map-title">
                <i class="fas fa-map-marked-alt"></i> خريطة الرحلة
            </div>
            <div class="driver-map" id="driverMap" style="height: calc(500px - 85px); margin-buttom: 50px;  position: relative; "></div>
        </div>
        <button class="fit-to-location-btn" id="fitToLocationBtn" style="display: none;">
            <i class="fas fa-crosshairs"></i> العودة إلى موقعي
        </button>
    `;
}

// Trip Form Events
function setupTripFormEvents() {
  document.getElementById("startTripBtn")?.addEventListener("click", startTrip);
}

// Setup event listeners for active trip buttons
function setupActiveTripButtons() {
  // Setup end trip button (finish trip and stop SignalR location sharing)
  const endTripBtn = document.getElementById("endTripBtn");
  if (endTripBtn) {
    // Remove existing listener to prevent duplicates
    endTripBtn.replaceWith(endTripBtn.cloneNode(true));
    const newEndTripBtn = document.getElementById("endTripBtn");
    newEndTripBtn.addEventListener("click", endTrip);
  }

  // Setup complete trip button (update trip status: full/available)
  const completeTripBtn = document.getElementById("completeTripBtn");
  if (completeTripBtn) {
    // Remove existing listener to prevent duplicates
    completeTripBtn.replaceWith(completeTripBtn.cloneNode(true));
    const newCompleteTripBtn = document.getElementById("completeTripBtn");
    // Use inline function to ensure we use the driver.js version (driverUpdateTripStatus)
    newCompleteTripBtn.addEventListener("click", driverUpdateTripStatus);
  }
}

// Trip Functions
async function startTrip() {
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

  // Check SignalR connection before starting trip
  if (!checkSignalRConnection()) {
    if (typeof showToast === "function") {
      showToast("انتظر الاتصال بالخادم...", "warning", "الاتصال");
    } else {
      alert("انتظر الاتصال بالخادم...");
    }
    return;
  }

  const routeId = parseInt(routeSelect.value);
  const routeName = routeSelect.options[routeSelect.selectedIndex].text;

  // Get statusTripId from selection
  const statusTripSelect = document.getElementById("statusTripSelect");
  const statusTripId = parseInt(statusTripSelect.value) || 1; // Default to 1 (available)

  // الحصول على رقم لوحة الحافلة من البروفايل
  let busNumber = "غير محدد";
  if (typeof getProfileData === "function") {
    const profile = getProfileData();
    busNumber = profile.plateNoBus || "غير محدد";
  }

  // Call API to start trip
  try {
    const requestBody = {
      statusTripId: statusTripId,
      routeID: routeId
    };

    const response = await apiAuthRequest("Trips/startTrip", "POST", {}, requestBody);

    if (!response.success) {
      if (typeof showToast === "function") {
        showToast(`فشل بدء الرحلة: ${response.error || "حدث خطأ غير معروف"}`, "error", "خطأ");
      } else {
        alert(`فشل بدء الرحلة: ${response.error || "حدث خطأ غير معروف"}`);
      }
      return;
    }

    // Extract trip ID from response
    // API returns: { success: true, message: "...", data: 3 }
    // apiRequest wraps it: { success: true, data: { success: true, message: "...", data: 3 } }
    console.log("API Response:", response);
    const tripId = response.data?.data || response.data;
    
    if (!tripId) {
      console.error("Invalid trip ID response:", response);
      if (typeof showToast === "function") {
        showToast("فشل الحصول على معرف الرحلة من الخادم", "error", "خطأ");
      } else {
        alert("فشل الحصول على معرف الرحلة من الخادم");
      }
      return;
    }
    
    // Ensure tripId is a number
    const finalTripId = Number(tripId);
    console.log("Trip ID extracted:", finalTripId);
    
    if (isNaN(finalTripId)) {
      console.error("Trip ID is not a valid number:", tripId);
      if (typeof showToast === "function") {
        showToast("معرف الرحلة غير صحيح", "error", "خطأ");
      } else {
        alert("معرف الرحلة غير صحيح");
      }
      return;
    }

    // Verify SignalR is still connected before saving trip state
    if (!checkSignalRConnection()) {
      if (typeof showToast === "function") {
        showToast("انتظر الاتصال بالخادم...", "warning", "الاتصال");
      } else {
        alert("انتظر الاتصال بالخادم...");
      }
      return;
    }

    state.isTripActive = true;
    state.currentTrip = {
      isActive: true,
      tripId: finalTripId,
      routeId: routeId,
      routeName: routeName,
      busNumber: busNumber,
      statusTripId: statusTripId,
      startTime: new Date().toLocaleTimeString(),
      startDate: new Date().toISOString(),
    };
    
    console.log("Current trip state:", state.currentTrip);

    // Only save to localStorage after SignalR connection is confirmed
    saveTripToStorage();
    renderInterface();

    // Start location sharing via SignalR
    startLocationSharing();

    // إظهار إشعار النجاح
    if (typeof showToast === "function") {
      showToast("تم بدء الرحلة بنجاح", "success", "بدء الرحلة");
    }
  } catch (error) {
    console.error("Error starting trip:", error);
    if (typeof showToast === "function") {
      showToast("حدث خطأ أثناء بدء الرحلة. يرجى المحاولة مرة أخرى.", "error", "خطأ");
    } else {
      alert("حدث خطأ أثناء بدء الرحلة. يرجى المحاولة مرة أخرى.");
    }
  }
}

async function endTrip() {
  if (!confirm("هل أنت متأكد من إنهاء الرحلة؟")) return;

  // Get trip ID from current trip
  const tripId = state.currentTrip?.tripId;
  if (!tripId) {
    console.error("No trip ID found in current trip");
    if (typeof showToast === "function") {
      showToast("خطأ: لم يتم العثور على معرف الرحلة", "error", "خطأ");
    } else {
      alert("خطأ: لم يتم العثور على معرف الرحلة");
    }
    return;
  }

  // Call API to finish trip
  try {
    console.log("Finishing trip with ID:", tripId);
    const response = await apiAuthRequest(`Trips/FinishTrip/${tripId}`, "PUT");

    if (!response.success) {
      console.error("Failed to finish trip:", response.error);
      if (typeof showToast === "function") {
        showToast(`فشل إنهاء الرحلة: ${response.error || "حدث خطأ غير معروف"}`, "error", "خطأ");
      } else {
        alert(`فشل إنهاء الرحلة: ${response.error || "حدث خطأ غير معروف"}`);
      }
      return;
    }

    console.log("Trip finished successfully via API");

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
  } catch (error) {
    console.error("Error finishing trip:", error);
    if (typeof showToast === "function") {
      showToast("حدث خطأ أثناء إنهاء الرحلة. يرجى المحاولة مرة أخرى.", "error", "خطأ");
    } else {
      alert("حدث خطأ أثناء إنهاء الرحلة. يرجى المحاولة مرة أخرى.");
    }
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
  state.currentTrip = null;
  state.knownStudents.clear(); // Clear known students when trip ends
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

  // Store current driver location
  state.currentDriverLocation = { lat, lng };

  // Remove old markers
  if (state.driverMarker) {
    state.map.removeLayer(state.driverMarker);
  }
  if (state.driverCircle) {
    state.map.removeLayer(state.driverCircle);
  }

  // Bus icon - Using a clean, styled bus icon
  const busIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
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

  // Center map on driver location (only on initial position)
  if (!state.map.hasInitialCenter) {
    state.map.setView([lat, lng], 15);
    state.map.hasInitialCenter = true;
  }

  // Check if driver marker is in view and update button visibility
  checkDriverMarkerVisibility();
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

// Fit to Location Button Functions
function setupFitToLocationButton() {
  const fitBtn = document.getElementById("fitToLocationBtn");
  if (fitBtn) {
    fitBtn.addEventListener("click", fitMapToDriverLocation);
  }

  // Check visibility when map moves or zooms
  if (state.map) {
    state.map.on("moveend", checkDriverMarkerVisibility);
    state.map.on("zoomend", checkDriverMarkerVisibility);
  }
}

function checkDriverMarkerVisibility() {
  if (!state.map || !state.driverMarker || !state.currentDriverLocation) {
    return;
  }

  const fitBtn = document.getElementById("fitToLocationBtn");
  if (!fitBtn) return;

  // Check if driver marker is visible in current view
  const mapBounds = state.map.getBounds();
  const driverLatLng = L.latLng(state.currentDriverLocation.lat, state.currentDriverLocation.lng);
  const isVisible = mapBounds.contains(driverLatLng);

  // Show button if marker is out of view
  if (isVisible) {
    fitBtn.style.display = "none";
  } else {
    fitBtn.style.display = "block";
  }
}

function fitMapToDriverLocation() {
  if (!state.map || !state.currentDriverLocation) return;

  state.map.setView(
    [state.currentDriverLocation.lat, state.currentDriverLocation.lng],
    15,
    { animate: true, duration: 0.5 }
  );

  // Hide button after centering
  const fitBtn = document.getElementById("fitToLocationBtn");
  if (fitBtn) {
    setTimeout(() => {
      fitBtn.style.display = "none";
    }, 100);
  }
}

// Driver-specific function to update trip status (uses API)
// This function has a unique name to avoid conflict with profile.js toggleTripCompletion
async function driverUpdateTripStatus() {
  // Debug: Check if function is called
  //alert("driverUpdateTripStatus called");
  
  // Get trip ID from current trip
  const tripId = state.currentTrip?.tripId;
  if (!tripId) {
    console.error("No trip ID found in current trip");
    if (typeof showToast === "function") {
      showToast("خطأ: لم يتم العثور على معرف الرحلة", "error", "خطأ");
    } else {
      alert("خطأ: لم يتم العثور على معرف الرحلة");
    }
    return;
  }

  // Get current statusTripId and toggle it (1 <-> 2)
  const currentStatusTripId = state.currentTrip?.statusTripId || 1;
  const newStatusTripId = currentStatusTripId === 1 ? 2 : 1;

  // Call API to update trip status
  try {
    const requestBody = {
      id: tripId,
      statusTripId: newStatusTripId
    };

    const response = await apiAuthRequest("Trips/DriverUpdateStatusTrip", "PUT", {}, requestBody);

    if (!response.success) {
      console.error("Failed to update trip status:", response.error);
      if (typeof showToast === "function") {
        showToast(`فشل تحديث حالة الرحلة: ${response.error || "حدث خطأ غير معروف"}`, "error", "خطأ");
      } else {
        alert(`فشل تحديث حالة الرحلة: ${response.error || "حدث خطأ غير معروف"}`);
      }
      return;
    }

    // Update local state
    state.currentTrip.statusTripId = newStatusTripId;
    saveTripToStorage();

    // Update button UI
    const button = document.getElementById("completeTripBtn");
    if (button) {
      if (newStatusTripId === 2) {
        button.classList.add("incomplete");
        button.innerHTML = '<i class="fas fa-times-circle"></i> الحافلة ممتلئة';
      } else {
        button.classList.remove("incomplete");
        button.innerHTML = '<i class="fas fa-check-circle"></i> الحافلة متاحة';
      }
    }

    // Update stats and button display by re-rendering active trip section
    const activeTripContainer = document.querySelector(".active-trip");
    if (activeTripContainer) {
      // Update the stats section
      const statsSection = activeTripContainer.querySelector(".trip-stats");
      if (statsSection) {
        statsSection.outerHTML = renderTripStats();
      }
    }

    // Show notification
    if (typeof showToast === "function") {
      const message = newStatusTripId === 2
        ? "تم تحديث حالة الرحلة إلى: الحافلة ممتلئة"
        : "تم تحديث حالة الرحلة إلى: الحافلة متاحة";
      showToast(message, "success", "حالة الرحلة");
    }
  } catch (error) {
    console.error("Error updating trip status:", error);
    if (typeof showToast === "function") {
      showToast("حدث خطأ أثناء تحديث حالة الرحلة. يرجى المحاولة مرة أخرى.", "error", "خطأ");
    } else {
      alert("حدث خطأ أثناء تحديث حالة الرحلة. يرجى المحاولة مرة أخرى.");
    }
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
    const response = (await apiAuthRequest("Routes/GetAllRoutes", "GET")).data;
    
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

      // Check if this is a new student (not yet in knownStudents set)
      const isNewStudent = !state.knownStudents.has(studentid);
      
      if (isNewStudent) {
        // Add to known students set
        state.knownStudents.add(studentid);
        
        // Show notification only for new students
        if (typeof showToast === "function") {
          showToast(
            `انضم طالب جديد: ${studentname || studentid}`,
            "info",
            "طالب جديد"
          );
        }
      }

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

    // Remove from known students set
    state.knownStudents.delete(studentid);

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

  // Get trip ID from current trip
  const tripId = state.currentTrip?.tripId;
  if (!tripId) {
    console.error("No trip ID found in current trip. Current trip:", state.currentTrip);
    if (typeof showToast === "function") {
      showToast("خطأ: لم يتم العثور على معرف الرحلة", "error", "خطأ");
    }
    return;
  }
  
  console.log("Starting location sharing with trip ID:", tripId);

  // Track consecutive errors to stop spamming if method doesn't exist
  let consecutiveErrors = 0;
  const MAX_ERRORS = 3;

  // Start location updates
  state.locationInterval = setInterval(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        // Send to server via SignalR
        if (checkSignalRConnection() && consecutiveErrors < MAX_ERRORS) {
          // Try with tripId as number (most likely format)
          const tripIdToSend = Number(tripId);
          console.log("Sending location update - Lat:", lat, "Lng:", lng, "TripId:", tripIdToSend);
          
          // Try different parameter formats based on common SignalR patterns
          // Format 1: lat (number), lng (number), tripId (number)
          state.signalRConnection
            .invoke("StartTripForDriver", lat.toString(), lng.toString(), tripIdToSend)
            .then(() => {
              // Reset error counter on success
              consecutiveErrors = 0;
            })
            .catch((err) => {
              consecutiveErrors++;
              console.error("Start trip error (format 1 - all numbers):", err);
              
              // Try format 2: lat (string), lng (string), tripId (number)
              if (consecutiveErrors === 1) {
                console.log("Retrying with lat/lng as strings...");
                return state.signalRConnection.invoke("StartTripForDriver", lat.toString(), lng.toString(), tripIdToSend);
              }
            })
            .then((result) => {
              if (result !== undefined) {
                consecutiveErrors = 0; // Reset on success
              }
            })
            .catch((err2) => {
              if (consecutiveErrors >= 2) {
                console.error("All parameter format attempts failed:", err2);
                console.error("Error details - Lat:", lat, "Lng:", lng, "TripId:", tripIdToSend);
                
                // Stop interval if too many errors
                if (consecutiveErrors >= MAX_ERRORS) {
                  console.error("Too many consecutive errors. Stopping location updates.");
                  if (typeof showToast === "function") {
                    showToast("خطأ: فشل إرسال الموقع إلى الخادم. يرجى التحقق من الاتصال أو الاتصال بالدعم الفني.", "error", "خطأ");
                  }
                  // Clear interval but don't stop location sharing flag
                  if (state.locationInterval) {
                    clearInterval(state.locationInterval);
                  }
                }
              }
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
  }, 2000); // Every 2 second

  // Get initial position
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = position.coords.accuracy;
      updateDriverLocationMarker(lat, lng, accuracy);

      // Send initial location - try different parameter formats
      if (checkSignalRConnection()) {
        const tripIdToSend = Number(tripId);
        console.log("Sending initial location - Lat:", lat, "Lng:", lng, "TripId:", tripIdToSend);
        
        // Try format 1: all numbers (lat, lng, tripId)
        state.signalRConnection
          .invoke("StartTripForDriver", lat.toString(), lng.toString(), tripIdToSend)
          .then(() => {
            console.log("Initial location sent successfully");
            consecutiveErrors = 0; // Reset error counter on success
          })
          .catch((err) => {
            console.error("Start trip error (initial - format 1):", err);
            
            // Try format 2: lat/lng as strings, tripId as number
            console.log("Retrying with lat/lng as strings...");
            return state.signalRConnection
              .invoke("StartTripForDriver", lat.toString(), lng.toString(), tripIdToSend);
          })
          .then((result) => {
            if (result !== undefined) {
              console.log("Initial location sent successfully with string lat/lng");
              consecutiveErrors = 0;
            }
          })
          .catch((err2) => {
            console.error("All format attempts failed for initial location:", err2);
            console.error("Error details - Lat:", lat, "Lng:", lng, "TripId:", tripIdToSend);
            if (typeof showToast === "function") {
              showToast("خطأ: فشل إرسال الموقع الأولي إلى الخادم. قد تكون هناك مشكلة في خادم SignalR.", "error", "خطأ");
            }
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

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );

  return JSON.parse(jsonPayload);
}
