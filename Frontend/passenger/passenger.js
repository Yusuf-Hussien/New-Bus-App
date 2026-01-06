// Configuration
const CONFIG = {
  STATIONS: [
    { name: "المدينة الجامعية", lat: 30, lng: 20 },
    { name: "موقف الدهار", lat: 45, lng: 35 },
    { name: "كلية تربية الاحياء", lat: 60, lng: 50 },
    { name: "الفيروز", lat: 40, lng: 65 },
    { name: "الجامعة", lat: 50, lng: 80 },
  ],
  ROUTES: [
    {
      id: "city-campus",
      name: "المدينة الجامعية ← الجامعة",
      from: "المدينة الجامعية",
      to: "الجامعة",
      stations: [
        "المدينة الجامعية",
        "موقف الدهار",
        "كلية تربية الاحياء",
        "الفيروز",
        "الجامعة",
      ],
      path: [
        { lat: 30, lng: 20 },
        { lat: 45, lng: 35 },
        { lat: 60, lng: 50 },
        { lat: 40, lng: 65 },
        { lat: 50, lng: 80 },
      ],
    },
    {
      id: "dahar-feroz",
      name: "موقف الدهار ← الفيروز",
      from: "موقف الدهار",
      to: "الفيروز",
      stations: ["موقف الدهار", "كلية تربية الاحياء", "الفيروز"],
      path: [
        { lat: 45, lng: 35 },
        { lat: 60, lng: 50 },
        { lat: 40, lng: 65 },
      ],
    },
    {
      id: "biology-dahar",
      name: "كلية تربية الاحياء ← موقف الدهار",
      from: "كلية تربية الاحياء",
      to: "موقف الدهار",
      stations: ["كلية تربية الاحياء", "موقف الدهار"],
      path: [
        { lat: 60, lng: 50 },
        { lat: 45, lng: 35 },
      ],
    },
    {
      id: "feroz-campus",
      name: "الفيروز ← الجامعة",
      from: "الفيروز",
      to: "الجامعة",
      stations: ["الفيروز", "الجامعة"],
      path: [
        { lat: 40, lng: 65 },
        { lat: 50, lng: 80 },
      ],
    },
  ],
  INITIAL_BUSES: [
    {
      id: 101,
      route: "city-campus",
      from: "المدينة الجامعية",
      to: "الجامعة",
      eta: "8",
      distance: "1.2",
      capacity: 50,
      current: 42,
      status: "active",
      driver: "محمد أحمد",
      lat: 35,
      lng: 30,
      speed: 40,
    },
    {
      id: 102,
      route: "dahar-feroz",
      from: "موقف الدهار",
      to: "الفيروز",
      eta: "5",
      distance: "0.8",
      capacity: 50,
      current: 35,
      status: "active",
      driver: "أحمد علي",
      lat: 50,
      lng: 45,
      speed: 35,
    },
    {
      id: 103,
      route: "biology-dahar",
      from: "كلية تربية الاحياء",
      to: "موقف الدهار",
      eta: "3",
      distance: "0.5",
      capacity: 45,
      current: 38,
      status: "active",
      driver: "محمود حسن",
      lat: 55,
      lng: 40,
      speed: 30,
    },
    {
      id: 104,
      route: "feroz-campus",
      from: "الفيروز",
      to: "الجامعة",
      eta: "6",
      distance: "1.0",
      capacity: 60,
      current: 52,
      status: "active",
      driver: "خالد محمد",
      lat: 45,
      lng: 70,
      speed: 45,
    },
  ],
  USER_POSITION: { lat: 50, lng: 50 },
  PROXIMITY_THRESHOLD: 10,
  UPDATE_INTERVALS: {
    BUS_POSITIONS: 5000,
    BUS_PROXIMITY: 10000,
  },
};

const API_BASE_URL = "https://newbus.tryasp.net/api/";

// State
const state = {
  currentUser: null,
  selectedBusId: null,
  activeRouteLines: [],
  notifications: [],
  notificationPanelVisible: false,
  busesData: [], // Will be populated from SignalR
  userPosition: { ...CONFIG.USER_POSITION },
  isLocationActive: false,
  locationWatcher: null,
  signalRConnection: null, // SignalR connection reference
  map: null, // Leaflet map reference
  busMarkers: {}, // Leaflet bus markers
  busCircles: {}, // Leaflet bus circles
  studentMarker: null, // Student location marker
  studentCircle: null, // Student location circle
  locationInterval: null, // Location update interval
};

// DOM Elements
const dom = {
  mainContent: document.getElementById("mainContent"),
  userName: document.getElementById("userName"),
  notificationCount: document.getElementById("notificationCount"),
  notificationList: document.getElementById("notificationList"),
  notificationPanel: document.getElementById("notificationPanel"),
  notificationToggle: document.getElementById("notificationToggle"),
  closeNotifications: document.getElementById("closeNotifications"),
  userProfile: document.getElementById("userProfile"),
  profileModal: document.getElementById("profileModal"),
  closeProfileModal: document.getElementById("closeProfileModal"),
  cancelProfile: document.getElementById("cancelProfile"),
  saveProfile: document.getElementById("saveProfile"),
  profileForm: document.getElementById("profileForm"),
  userTypeBadge: document.querySelector(".user-type-badge"),
};

// 1️⃣ Location Control Functions
function toggleLocation() {
  if (state.isLocationActive) {
    closeLocationSharing();
  } else {
    startLocationSharing();
  }
}

function startLocationSharing() {
  if (!state.signalRConnection || !checkSignalRConnection()) {
    alert("الاتصال غير جاهز. يرجى الانتظار والمحاولة مرة أخرى.");
    return;
  }

  if (!navigator.geolocation) {
    alert("المتصفح لا يدعم تحديد الموقع");
    return;
  }

  // Clear any existing interval
  if (state.locationInterval) {
    clearInterval(state.locationInterval);
  }

  state.isLocationActive = true;
  saveLocationSharingState(); // Save state to localStorage
  updateLocationUI();

  // Start location updates
  state.locationInterval = setInterval(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        // Update state
        state.userPosition = { lat, lng };

        // Send to server via SignalR
        if (checkSignalRConnection()) {
          state.signalRConnection
            .invoke("sharelivelocationforstudent", lat.toString(), lng.toString())
            .catch((err) => console.error("Share location error:", err));
        }

        // Update Leaflet map markers
        updateStudentLocationMarker(lat, lng, accuracy);
      },
      (error) => {
        console.error("Error getting location:", error.message);
        alert("تعذر الحصول على موقعك: " + error.message);
      }
    );
  }, 2000); // Every 2 seconds

  // Get initial position
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = position.coords.accuracy;
      state.userPosition = { lat, lng };
      updateStudentLocationMarker(lat, lng, accuracy);
    },
    (error) => {
      console.error("Error getting initial location:", error.message);
    }
  );

  addNotification(
    "تفعيل الموقع",
    "تم تفعيل تتبع موقعك الحالي",
    "fa-check-circle"
  );
}

async function closeLocationSharing() {
  state.isLocationActive = false;
  saveLocationSharingState(); // Save state to localStorage (false)

  // Clear interval
  if (state.locationInterval) {
    clearInterval(state.locationInterval);
    state.locationInterval = null;
  }

  // Remove markers from map
  if (state.studentMarker && state.map) {
    state.map.removeLayer(state.studentMarker);
    state.studentMarker = null;
  }
  if (state.studentCircle && state.map) {
    state.map.removeLayer(state.studentCircle);
    state.studentCircle = null;
  }

  // Stop location sharing on server
  if (checkSignalRConnection()) {
    try {
      await state.signalRConnection.invoke("stoplocationforistudent");
    } catch (err) {
      console.error("Error stopping location:", err);
    }
  }

  updateLocationUI();
  addNotification(
    "إلغاء الموقع",
    "تم إلغاء تتبع موقعك الحالي",
    "fa-times-circle"
  );
}

function updateStudentLocationMarker(lat, lng, accuracy) {
  if (!state.map) return;

  // Update user position in state
  state.userPosition = { lat, lng };

  // Remove old markers
  if (state.studentMarker) {
    state.map.removeLayer(state.studentMarker);
  }
  if (state.studentCircle) {
    state.map.removeLayer(state.studentCircle);
  }

  // Add new markers
  state.studentMarker = L.marker([lat, lng])
    .bindPopup("موقعك الحالي - خط العرض: " + lat + ", خط الطول: " + lng)
    .addTo(state.map);

  state.studentCircle = L.circle([lat, lng], {
    radius: accuracy,
    color: "blue",
    fillColor: "#3388ff",
    fillOpacity: 0.2,
  }).addTo(state.map);

  // Center map on student location (only on initial position)
  if (!state.map.hasInitialCenter) {
    state.map.setView([lat, lng], 15);
    state.map.hasInitialCenter = true;
  }

  // Check if student marker is in view and update button visibility
  checkStudentMarkerVisibility();
}

function updateLocationUI() {
  const btn = document.getElementById("toggleLocationBtn");
  const status = document.getElementById("locationStatus");

  if (btn && status) {
    if (state.isLocationActive) {
      btn.innerHTML = '<i class="fas fa-times"></i> إلغاء الموقع';
      btn.classList.remove("btn-secondary");
      btn.classList.add("btn-danger");
      status.innerHTML = '<i class="fas fa-check-circle"></i> الموقع مفعل';
      status.classList.add("active");
    } else {
      btn.innerHTML = '<i class="fas fa-map-marker-alt"></i> تحديد الموقع';
      btn.classList.remove("btn-danger");
      btn.classList.add("btn-secondary");
      status.innerHTML = '<i class="fas fa-times-circle"></i> الموقع غير مفعل';
      status.classList.remove("active");
    }
  }
  
  // Update fit-to-location button visibility
  checkStudentMarkerVisibility();
}

function checkSignalRConnection() {
  return (
    state.signalRConnection &&
    state.signalRConnection.state === signalR.HubConnectionState.Connected
  );
}

// 2️⃣ Profile Management Functions
function openProfileModal() {
  if (!state.currentUser) return;

  // Load current user data from JWT claims and saved profile
  // Split name from JWT if it's stored as full name
  let firstName = state.currentUser.firstName || "";
  let secondName = state.currentUser.secondName || "";
  
  // If name exists but firstName/secondName don't, try to split it
  if (!firstName && state.currentUser.name) {
    const nameParts = state.currentUser.name.trim().split(/\s+/);
    firstName = nameParts[0] || "";
    secondName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : "";
  }

  document.getElementById("firstName").value = firstName;
  document.getElementById("secondName").value = secondName;
  document.getElementById("thirdName").value =
    state.currentUser.thirdName || "";
  document.getElementById("lastName").value = state.currentUser.lastName || "";
  document.getElementById("email").value = state.currentUser.email || "";
  document.getElementById("phone").value = state.currentUser.phone || "";
  document.getElementById("userNameField").value =
    state.currentUser.userName || "";
  document.getElementById("gender").value = state.currentUser.gender || "";
  document.getElementById("facultyName").value =
    state.currentUser.facultyName || "";
  document.getElementById("levelOfStudy").value =
    state.currentUser.levelOfStudy || "";
  document.getElementById("password").value = "";
  document.getElementById("confirmPassword").value = "";

  dom.profileModal.classList.add("active");
}

function closeProfileModal() {
  dom.profileModal.classList.remove("active");
}

function saveProfile() {
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password && password !== confirmPassword) {
    alert("كلمات المرور غير متطابقة");
    return;
  }

  // 1️⃣ احفظ الأسماء المنفصلة
  state.currentUser.firstName = document.getElementById("firstName").value;
  state.currentUser.secondName = document.getElementById("secondName").value;
  state.currentUser.thirdName = document.getElementById("thirdName").value;
  state.currentUser.lastName = document.getElementById("lastName").value;

  // 2️⃣ أنشئ اسم العرض الكامل من الأسماء المنفصلة
  const fullName = [
    state.currentUser.firstName,
    state.currentUser.secondName,
    state.currentUser.thirdName,
    state.currentUser.lastName,
  ]
    .filter((name) => name && name.trim() !== "")
    .join(" ");

  // 3️⃣ تحديث اسم العرض
  state.currentUser.name = fullName;

  // 4️⃣ حفظ باقي البيانات
  state.currentUser.email = document.getElementById("email").value;
  state.currentUser.phone = document.getElementById("phone").value;
  state.currentUser.userName = document.getElementById("userNameField").value;
  state.currentUser.gender = document.getElementById("gender").value;
  state.currentUser.facultyName = document.getElementById("facultyName").value;
  state.currentUser.levelOfStudy =
    document.getElementById("levelOfStudy").value;

  if (password) {
    state.currentUser.password = password;
  }

  // 5️⃣ تحديث الاسم في الهيدر مباشرة
  dom.userName.textContent = state.currentUser.name || "المستخدم";

  // 6️⃣ تحديث نوع المستخدم حسب الجنس
  updateUserTypeBadge();

  // 7️⃣ تحديث رسالة الترحيب
  updateWelcomeMessage();

  // 8️⃣ حفظ في localStorage
  localStorage.setItem("currentUser", JSON.stringify(state.currentUser));

  closeProfileModal();
  addNotification(
    "تحديث الملف الشخصي",
    "تم تحديث بياناتك بنجاح",
    "fa-user-check"
  );
}

function updateUserTypeBadge() {
  const userTypeBadge = document.querySelector(".user-type-badge");
  if (userTypeBadge) {
    if (state.currentUser.gender === "أنثى") {
      userTypeBadge.textContent = "طالبة جامعية";
    } else {
      userTypeBadge.textContent = "طالب جامعي";
    }
  }
}

function updateWelcomeMessage() {
  const welcomeMessageDiv = document.querySelector(".welcome-message");
  if (welcomeMessageDiv) {
    const userName = state.currentUser.name || "عزيزي المستخدم";
    welcomeMessageDiv.innerHTML = `
            <h1>مرحباً ${userName}</h1>
            <p>استخدم تطبيق NewBus لتتبع حافلات الجامعة في الوقت الحقيقي</p>
        `;
  }
}

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
  if (state.currentUser.userAccountType !== "passenger") {
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
            <p>هذه الصفحة مخصصة للطلاب فقط. يرجى تسجيل الدخول بحساب طالب.</p>
            <button class="btn btn-primary" onclick="handleLogout()">
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
    localStorage.setItem("passengerNotifications", JSON.stringify([]));
  }
  window.location.href = "login.html";
}

// Load Interface
function loadPassengerInterface() {
  loadUserInfo();
  loadNotifications();
  loadLocationSharingState(); // Load location sharing state from localStorage
  renderInterface();
  setupEventListeners();
  setupFitToLocationButton(); // Setup fit to location button
  updateLocationUI(); // Update UI to reflect loaded location sharing state
  initializeSignalR(); // Initialize SignalR instead of fake data updates
}

function loadUserInfo() {
  // Load user info from JWT claims stored in userSession
  // If name is not available, construct it from firstName/secondName from JWT
  if (
    !state.currentUser.name &&
    (state.currentUser.firstName || state.currentUser.secondName)
  ) {
    const fullName = [
      state.currentUser.firstName,
      state.currentUser.secondName,
      state.currentUser.thirdName,
      state.currentUser.lastName,
    ]
      .filter((name) => name && name.trim() !== "")
      .join(" ");
    if (fullName) {
      state.currentUser.name = fullName;
    }
  }

  // If still no name, try to use email or default
  const displayName = state.currentUser.name || 
                     state.currentUser.email?.split('@')[0] || 
                     "المستخدم";
  dom.userName.textContent = displayName;

  // تحديث نوع المستخدم حسب الجنس
  updateUserTypeBadge();
}

function loadNotifications() {
  state.notifications =
    JSON.parse(localStorage.getItem("passengerNotifications")) || [];
  updateNotificationDisplay();
}

function loadLocationSharingState() {
  const savedState = localStorage.getItem("passengerLocationSharing");
  if (savedState === "true") {
    state.isLocationActive = true;
  } else {
    state.isLocationActive = false;
  }
}

function saveLocationSharingState() {
  localStorage.setItem("passengerLocationSharing", state.isLocationActive.toString());
}

function renderInterface() {
  dom.mainContent.innerHTML = `
        ${renderWelcomeMessage()}
        ${renderStatsCards()}
        ${renderLocationControl()}
        ${renderMap()}
        ${renderBusesSection()}
    `;

  createMap();
  renderBusCards();
  
  // Setup fit to location button after map is created
  setupFitToLocationButton();
}

function renderWelcomeMessage() {
  const userName = state.currentUser.name || "عزيزي المستخدم";
  return `
        <div class="welcome-message">
            <h1>مرحباً ${userName}</h1>
            <p>استخدم تطبيق NewBus لتتبع حافلات الجامعة في الوقت الحقيقي</p>
        </div>
    `;
}

function renderStatsCards() {
  return `
        <div class="stats-cards">
            ${renderStatCard(
              "fas fa-bus",
              "bus",
              state.busesData.length,
              "حافلة متاحة"
            )}
            ${renderStatCard(
              "fas fa-map-marker-alt",
              "station",
              "5",
              "محطة رئيسية"
            )}
        </div>
    `;
}

function renderStatCard(icon, type, value, label) {
  return `
        <div class="stat-card">
            <div class="stat-icon ${type}">
                <i class="${icon}"></i>
            </div>
            <div class="stat-info">
                <h3>${value}</h3>
                <p>${label}</p>
            </div>
        </div>
    `;
}

function renderLocationControl() {
  return `
        <div class="location-control">
            <button class="btn btn-secondary" id="toggleLocationBtn">
                <i class="fas fa-map-marker-alt"></i> تحديد الموقع
            </button>
            <span class="location-status" id="locationStatus">
                <i class="fas fa-times-circle"></i> الموقع غير مفعل
            </span>
        </div>
    `;
}

function renderMap() {
  return `
        <div class="map-container">
            <div class="map-title">
                <i class="fas fa-map"></i> خريطة حافلات الجامعة
            </div>
            <div class="map" id="liveMap" style="height: 500px; width: 100%;"></div>
        </div>
        <button class="fit-to-location-btn" id="fitToLocationBtn" style="display: none;">
            <i class="fas fa-crosshairs"></i> العودة إلى موقعي
        </button>
    `;
}

function renderBusesSection() {
  return `
        <h2 class="section-title">
            <i class="fas fa-bus"></i> الحافلات المتاحة الآن
        </h2>
        <div class="buses-list" id="busesList"></div>
    `;
}

// Map Functions
function createMap() {
  // Check if Leaflet is loaded
  if (typeof L === 'undefined') {
    console.error("Leaflet library is not loaded. Please ensure Leaflet is included before this script.");
    return;
  }

  // Check if map div exists
  const mapElement = document.getElementById("liveMap");
  if (!mapElement) {
    console.error("Map element 'liveMap' not found");
    return;
  }

  // Initialize Leaflet map
  const defaultLat = 27.2579; // Hurghada
  const defaultLng = 33.8116;

  try {
    state.map = L.map("liveMap").setView([defaultLat, defaultLng], 13);

    // Add tiles (OpenStreetMap)
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(state.map);

  // Bus icon - Using a clean, styled bus icon
   state.busIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
  });

    console.log("Map initialized successfully");
  } catch (error) {
    console.error("Error initializing map:", error);
  }
}



// Update bus marker on Leaflet map
function updateBusMarkerOnMap(bus) {
  if (!state.map) return;

  const driverId = bus.driverId || bus.id;

  // Remove old markers
  if (state.busMarkers[driverId]) {
    state.map.removeLayer(state.busMarkers[driverId]);
  }
  if (state.busCircles[driverId]) {
    state.map.removeLayer(state.busCircles[driverId]);
  }

  // Add new markers
  state.busMarkers[driverId] = L.marker([bus.lat, bus.lng], {
    icon: state.busIcon,
  })
    .bindPopup(
      `السائق: ${bus.driver}\nرقم الحافلة: ${bus.plateNumber || bus.id}\nمن: ${bus.from}\nإلى: ${bus.to}`
    )
    .addTo(state.map);

  state.busCircles[driverId] = L.circle([bus.lat, bus.lng], {
    radius: 30,
    color: "green",
    fillColor: "#51cf66",
    fillOpacity: 0.2,
  }).addTo(state.map);

  // Add click handler to select bus
  state.busMarkers[driverId].on("click", () => {
    selectBus(bus.id);
  });
}

// Remove bus marker from map
function removeBusMarkerFromMap(driverId) {
  if (!state.map) return;

  if (state.busMarkers[driverId]) {
    state.map.removeLayer(state.busMarkers[driverId]);
    delete state.busMarkers[driverId];
  }
  if (state.busCircles[driverId]) {
    state.map.removeLayer(state.busCircles[driverId]);
    delete state.busCircles[driverId];
  }
}

function renderRouteLines() {
  if (!state.map) return;

  // Remove old route lines
  state.activeRouteLines.forEach((line) => {
    if (line && state.map) {
      state.map.removeLayer(line);
    }
  });
  state.activeRouteLines = [];

  if (!state.selectedBusId) return;

  const selectedBus = state.busesData.find((b) => b.id === state.selectedBusId);
  if (!selectedBus) return;

  const route = CONFIG.ROUTES.find((r) => r.id === selectedBus.route);
  if (!route || route.path.length < 2) return;

  // Draw route lines using Leaflet polyline
  const routePoints = route.path.map((p) => [p.lat, p.lng]);
  const polyline = L.polyline(routePoints, {
    color: "#4dabf7",
    weight: 4,
    opacity: 0.7,
  }).addTo(state.map);

  state.activeRouteLines.push(polyline);

  // Add markers for stations
  route.path.forEach((point, index) => {
    const stationMarker = L.marker([point.lat, point.lng])
      .bindPopup(route.stations[index] || `محطة ${index + 1}`)
      .addTo(state.map);
    state.activeRouteLines.push(stationMarker);
  });
}

function selectBus(busId) {
  if (state.selectedBusId) {
    document
      .querySelector(`.bus-card[data-bus-id="${state.selectedBusId}"]`)
      ?.classList.remove("active");
  }

  state.selectedBusId = busId;

  document
    .querySelector(`.bus-card[data-bus-id="${busId}"]`)
    ?.classList.add("active");

  // Center map on selected bus
  const selectedBus = state.busesData.find((b) => b.id === busId);
  if (selectedBus && state.map) {
    state.map.setView([selectedBus.lat, selectedBus.lng], 15);
  }

  renderRouteLines();
}

// Bus Cards Functions
function renderBusCards() {
  const busesList = document.getElementById("busesList");
  if (!busesList) return;

  busesList.innerHTML = state.busesData.map(renderBusCard).join("");
}

function renderBusCard(bus) {
  const isActive = state.selectedBusId === bus.id;
  const plateNumber = bus.plateNumber || `#${bus.id}`;
  const distance = bus.distance ? `${bus.distance} كم` : "غير متاح";
  const capacity = bus.capacity
    ? `${bus.current || 0}/${bus.capacity} راكب`
    : "غير متاح";
  const status = bus.status || "active";
  const statusTripId = bus.statusTripId || 1;
  
  // Status display: 2 = full (ممتلئة), 1 = available (متاحة)
  // Handle both numeric and string status values
  const isFull = statusTripId === 2 || status === "full" || (typeof bus.statusTripId === "string" && bus.statusTripId.toLowerCase() === "completed");
  const statusText = isFull ? "🔴 ممتلئة" : status === "active" ? "🟢 متاحة" : "🟡 متأخرة";
  const statusClass = isFull ? "full" : status;

  return `
        <div class="bus-card ${isActive ? "active" : ""}" data-bus-id="${
    bus.id
  }">
            <div class="bus-header">
                <div class="bus-number">الحافلة ${plateNumber}</div>
                <div class="bus-status ${statusClass}">
                    ${statusText}
                </div>
            </div>
            <div class="bus-body">
                <div class="bus-route">
                    <span>${bus.from || "غير محدد"}</span>
                    <i class="fas fa-arrow-left"></i>
                    <span>${bus.to || "غير محدد"}</span>
                </div>
                <div class="bus-info">
                    <div class="info-item">
                        <i class="fas fa-location-arrow"></i>
                        <span>${distance}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-user-friends"></i>
                        <span>${capacity}</span>
                    </div>
                </div>
                <div class="bus-info">
                    <div class="info-item">
                        <i class="fas fa-user-tie"></i>
                        <span>${bus.driver || "غير محدد"}</span>
                    </div>
                </div>
                <div class="bus-actions">
                    <button class="btn" onclick="toggleFavorite(${
                      bus.id
                    })" style="background: #F3F4F6; color: var(--dark);">
                        <i class="far fa-star"></i> المفضلة
                    </button>
                    <button class="btn btn-primary" onclick="selectBus(${
                      bus.id
                    })">
                        <i class="fas fa-map-marked-alt"></i> تتبع المسار
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Notifications Functions
function updateNotificationDisplay() {
  if (!dom.notificationList) return;

  if (state.notifications.length === 0) {
    dom.notificationList.innerHTML = `
            <div style="text-align: center; padding: 20px; color: var(--gray);">
                <i class="far fa-bell-slash" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>لا توجد إشعارات جديدة</p>
            </div>
        `;
  } else {
    // Add clear all button at the top
    const clearAllBtn = `
      <div style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <button class="clear-all-notifications-btn" onclick="clearAllNotifications()" style="background: var(--danger); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; gap: 6px; margin-left: auto;">
          <i class="fas fa-trash-alt"></i> حذف الكل
        </button>
      </div>
    `;
    
    dom.notificationList.innerHTML = clearAllBtn + state.notifications
      .slice(0, 10)
      .map(renderNotificationItem)
      .join("");
  }

  dom.notificationCount.textContent = state.notifications.length;
}

function renderNotificationItem(notification) {
  return `
        <div class="notification-item" data-notification-id="${notification.id}">
            <i class="fas ${notification.icon || "fa-bus"}"></i>
            <div class="notification-content">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
                <div class="notification-time">${notification.time}</div>
            </div>
            <button class="delete-notification-btn" onclick="deleteNotification(${notification.id})" title="حذف">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
}

function addNotification(title, message, icon = "fa-bus") {
  const now = new Date();
  const timeString = now.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const newNotification = {
    id: Date.now(),
    title,
    message,
    time: timeString,
    icon,
    read: false,
  };

  state.notifications.unshift(newNotification);
  localStorage.setItem(
    "passengerNotifications",
    JSON.stringify(state.notifications)
  );
  updateNotificationDisplay();

  if (!state.notificationPanelVisible) {
    showNotificationAlert(title, message);
  }
}

function showNotificationAlert(title, message) {
  console.log(`🔔 إشعار جديد: ${title} - ${message}`);

  if (dom.notificationToggle) {
    dom.notificationToggle.style.animation = "none";
    setTimeout(() => {
      dom.notificationToggle.style.animation = "pulse 0.5s ease-in-out 3";
    }, 10);
  }
}

function deleteNotification(notificationId) {
  state.notifications = state.notifications.filter(n => n.id !== notificationId);
  localStorage.setItem(
    "passengerNotifications",
    JSON.stringify(state.notifications)
  );
  updateNotificationDisplay();
}

function clearAllNotifications() {
  if (state.notifications.length === 0) return;
  
  if (confirm("هل تريد حذف جميع الإشعارات؟")) {
    state.notifications = [];
    localStorage.setItem(
      "passengerNotifications",
      JSON.stringify(state.notifications)
    );
    updateNotificationDisplay();
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
        console.log("SignalR Connected");
        addNotification(
          "الاتصال جاهز",
          "تم الاتصال بنجاح بخدمة التتبع المباشر",
          "fa-check-circle"
        );

        // If location sharing was active (e.g. after page refresh), resume it automatically
        if (state.isLocationActive && !state.locationInterval) {
          try {
            startLocationSharing();
          } catch (error) {
            console.error("Error while auto-resuming location sharing after connect:", error);
          }
        }
      })
      .catch((err) => {
        console.error("Connection error:", err);
        addNotification(
          "خطأ في الاتصال",
          "فشل الاتصال بالخادم. يرجى تحديث الصفحة.",
          "fa-exclamation-triangle"
        );
      });

    // Handle reconnection events
    state.signalRConnection.onreconnected(() => {
      console.log("Reconnected!");
      addNotification(
        "إعادة الاتصال",
        "تم إعادة الاتصال بنجاح",
        "fa-check-circle"
      );

      // When connection is restored and location sharing was active, ensure it's running
      if (state.isLocationActive && !state.locationInterval) {
        try {
          startLocationSharing();
        } catch (error) {
          console.error("Error while auto-resuming location sharing after reconnect:", error);
        }
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

  // New location from driver
  state.signalRConnection.on(
    "NewLocationFromDriver",
    function (lat, lng, drivername, plateNumberbus, driverid, from, to, statusTrip) {
      console.log(
        "New location from driver:",
        driverid,
        drivername,
        plateNumberbus,
        lat,
        lng,
        "Status:",
        statusTrip,
        from,
        to
      );

      // Find or create bus in busesData
      let bus = state.busesData.find((b) => b.driverId === driverid);
      const isNewBus = !bus;

      // Map statusTrip string to status
      // "completed" = full (ممتلئة), "notcompleted" = available (متاحة)
      // Also handle numeric values for backward compatibility
      let busStatus = "active";
      let statusTripId = 1; // 1 = available, 2 = full
      
      if (typeof statusTrip === "string") {
        // Handle string values from SignalR
        if (statusTrip.toLowerCase() === "completed") {
          busStatus = "full";
          statusTripId = 2;
        } else if (statusTrip.toLowerCase() === "notcompleted") {
          busStatus = "active";
          statusTripId = 1;
        }
      } else if (typeof statusTrip === "number") {
        // Handle numeric values for backward compatibility
        statusTripId = statusTrip;
        busStatus = statusTrip === 2 ? "full" : "active";
      }

      if (!bus) {
        // Create new bus entry
        bus = {
          id: driverid, // Use driverId as bus ID
          driverId: driverid,
          driver: drivername,
          plateNumber: plateNumberbus,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          status: busStatus,
          statusTripId: statusTripId,
          from: from || "غير محدد",
          to: to || "غير محدد",
        };
        state.busesData.push(bus);
      } else {
        // Update existing bus
        bus.lat = parseFloat(lat);
        bus.lng = parseFloat(lng);
        bus.driver = drivername;
        bus.plateNumber = plateNumberbus;
        bus.status = busStatus;
        bus.statusTripId = statusTripId;
        bus.from = from || bus.from || "غير محدد";
        bus.to = to || bus.to || "غير محدد";
      }

      // Update map marker
      updateBusMarkerOnMap(bus);

      // Update bus cards
      renderBusCards();

      // Update stats
      updateStatsCards();

      // Check proximity if user location is active
      if (state.isLocationActive && state.userPosition.lat && state.userPosition.lng) {
        checkBusProximity(bus);
      }

      // Show notification for new bus
      if (isNewBus) {
        addNotification(
          `حافلة جديدة متاحة`,
          `الحافلة ${plateNumberbus} للسائق ${drivername} متاحة الآن`,
          "fa-bus"
        );
      }
    }
  );

  // Stop location from driver
  state.signalRConnection.on("stoplocationfromdriver", function (driverid) {
    console.log("Driver stopped sharing location:", driverid);

    // Remove from busesData
    state.busesData = state.busesData.filter((b) => b.driverId !== driverid);

    // Remove from map
    removeBusMarkerFromMap(driverid);

    // Update UI
    renderBusCards();
    updateStatsCards();

    // Clear selection if this bus was selected
    if (state.selectedBusId === driverid) {
      state.selectedBusId = null;
      renderRouteLines();
    }

    addNotification(
      "توقف الحافلة",
      `توقفت الحافلة للسائق ${driverid} عن مشاركة الموقع`,
      "fa-times-circle"
    );
  });

  // Arrive at new station
  state.signalRConnection.on(
    "ArriveNewStation",
    function (driverName, plateNo, stationName) {
      console.log("Bus arrived at station:", driverName, plateNo, stationName);

      // Find bus and update route info if possible
      const bus = state.busesData.find(
        (b) => b.driver === driverName || b.plateNumber === plateNo
      );
      if (bus) {
        // You might want to update bus.to or other route info here
        // based on your business logic
      }

      addNotification(
        `وصول الحافلة ${plateNo}`,
        `السائق ${driverName} وصل إلى محطة ${stationName}`,
        "fa-map-marker-alt"
      );
    }
  );
}

function checkBusProximity(bus) {
  if (!state.userPosition.lat || !state.userPosition.lng) return;

  // Calculate distance in kilometers using Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = ((bus.lat - state.userPosition.lat) * Math.PI) / 180;
  const dLon = ((bus.lng - state.userPosition.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((state.userPosition.lat * Math.PI) / 180) *
      Math.cos((bus.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  // Check if bus is within proximity threshold (e.g., 500 meters)
  if (distance < 0.5 && distance >= 0.25) {
    const existingNotification = state.notifications.find(
      (n) =>
        n.message.includes(bus.plateNumber || bus.id.toString()) &&
        Date.now() - n.id < 60000 // Within last minute
    );

    if (!existingNotification) {
      addNotification(
        `الحافلة ${bus.plateNumber || bus.id} قريبة منك`,
        `الحافلة على بعد ${(distance * 1000).toFixed(0)} متر من موقعك`,
        "fa-exclamation-circle"
      );
    }
  }
   // Check if bus is within proximity threshold (e.g., 2000 meters)
  else if (distance < 2.2 && distance >= 2) {
    const existingNotification = state.notifications.find(
      (n) =>
        n.message.includes(bus.plateNumber || bus.id.toString()) &&
        Date.now() - n.id < 60000 // Within last minute
    );

    if (!existingNotification) {
      addNotification(
        `الحافلة ${bus.plateNumber || bus.id} قريبة منك`,
        `الحافلة على بعد ${(distance * 1000).toFixed(0)} متر من موقعك`,
        "fa-exclamation-circle"
      );
    }
  }
}

function updateStatsCards() {
  const statsCards = document.querySelector(".stats-cards");
  if (statsCards) {
    statsCards.innerHTML = `
            ${renderStatCard(
              "fas fa-bus",
              "bus",
              state.busesData.length,
              "حافلة متاحة"
            )}
            ${renderStatCard(
              "fas fa-map-marker-alt",
              "station",
              CONFIG.STATIONS.length,
              "محطة رئيسية"
            )}
        `;
  }
}

// Utility Functions
function toggleFavorite(busId) {
  alert(
    `تم ${Math.random() > 0.5 ? "إضافة" : "إزالة"} الحافلة #${busId} من المفضلة`
  );
}

// Event Listeners
function setupEventListeners() {
  // Notifications panel
  dom.notificationToggle?.addEventListener("click", toggleNotificationPanel);
  dom.closeNotifications?.addEventListener("click", closeNotificationPanel);

  // Profile modal
  dom.userProfile?.addEventListener("click", openProfileModal);
  dom.closeProfileModal?.addEventListener("click", closeProfileModal);
  dom.cancelProfile?.addEventListener("click", closeProfileModal);
  dom.saveProfile?.addEventListener("click", saveProfile);

  // Location toggle button
  const toggleLocationBtn = document.getElementById("toggleLocationBtn");
  if (toggleLocationBtn) {
    toggleLocationBtn.addEventListener("click", toggleLocation);
  }

  document.addEventListener("click", handleOutsideClick);
}

// Fit to Location Button Functions
function setupFitToLocationButton() {
  const fitBtn = document.getElementById("fitToLocationBtn");
  if (fitBtn) {
    // Remove existing listener to prevent duplicates
    fitBtn.replaceWith(fitBtn.cloneNode(true));
    const newFitBtn = document.getElementById("fitToLocationBtn");
    newFitBtn.addEventListener("click", fitMapToStudentLocation);
  }

  // Check visibility when map moves or zooms
  if (state.map) {
    // Remove existing listeners to prevent duplicates
    state.map.off("moveend", checkStudentMarkerVisibility);
    state.map.off("zoomend", checkStudentMarkerVisibility);
    
    // Add new listeners
    state.map.on("moveend", checkStudentMarkerVisibility);
    state.map.on("zoomend", checkStudentMarkerVisibility);
  }
}

function checkStudentMarkerVisibility() {
  if (!state.map || !state.studentMarker || !state.userPosition.lat || !state.userPosition.lng) {
    return;
  }

  const fitBtn = document.getElementById("fitToLocationBtn");
  if (!fitBtn) return;

  // Only show button if location is active
  if (!state.isLocationActive) {
    fitBtn.style.display = "none";
    return;
  }

  // Check if student marker is visible in current view
  const mapBounds = state.map.getBounds();
  const studentLatLng = L.latLng(state.userPosition.lat, state.userPosition.lng);
  const isVisible = mapBounds.contains(studentLatLng);

  // Show button if marker is out of view
  if (isVisible) {
    fitBtn.style.display = "none";
  } else {
    fitBtn.style.display = "block";
  }
}

function fitMapToStudentLocation() {
  if (!state.map || !state.userPosition.lat || !state.userPosition.lng) return;

  state.map.setView(
    [state.userPosition.lat, state.userPosition.lng],
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

function toggleNotificationPanel() {
  state.notificationPanelVisible = !state.notificationPanelVisible;
  dom.notificationPanel.classList.toggle(
    "active",
    state.notificationPanelVisible
  );
}

function closeNotificationPanel() {
  state.notificationPanelVisible = false;
  dom.notificationPanel.classList.remove("active");
}

function handleOutsideClick(event) {
  // Close notification panel
  if (
    state.notificationPanelVisible &&
    !dom.notificationPanel.contains(event.target) &&
    !dom.notificationToggle.contains(event.target)
  ) {
    closeNotificationPanel();
  }

  // Close profile modal
  if (
    dom.profileModal.classList.contains("active") &&
    event.target === dom.profileModal
  ) {
    closeProfileModal();
  }
}

// Additional CSS
const additionalStyles = document.createElement("style");
additionalStyles.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
    
    .notification-alert {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: var(--primary);
        color: white;
        padding: 15px 20px;
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        animation: slideUp 0.3s ease;
        z-index: 1002;
        max-width: 300px;
    }
    
    @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;
document.head.appendChild(additionalStyles);

// Cleanup on page unload
window.addEventListener("beforeunload", async function () {
  // Clear location interval
  if (state.locationInterval) {
    clearInterval(state.locationInterval);
  }

  // Stop location sharing if active
  if (state.isLocationActive && checkSignalRConnection()) {
    try {
      await state.signalRConnection.invoke("stoplocationforistudent");
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

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  if (checkAuth()) {
    loadPassengerInterface();
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






