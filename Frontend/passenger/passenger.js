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
  busesData: [...CONFIG.INITIAL_BUSES],
  userPosition: { ...CONFIG.USER_POSITION },
  isLocationActive: false,
  locationWatcher: null,
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
    cancelLocation();
  } else {
    setLocation();
  }
}

function setLocation() {
  if (navigator.geolocation) {
    state.isLocationActive = true;
    updateLocationUI();

    // Simulate location updates
    state.locationWatcher = setInterval(() => {
      state.userPosition.lat += (Math.random() - 0.5) * 0.5;
      state.userPosition.lng += (Math.random() - 0.5) * 0.5;

      // Keep within bounds
      state.userPosition.lat = Math.max(
        10,
        Math.min(90, state.userPosition.lat)
      );
      state.userPosition.lng = Math.max(
        10,
        Math.min(90, state.userPosition.lng)
      );

      updateUserMarker();
      addNotification(
        "تحديث الموقع",
        "تم تحديث موقعك الحالي بنجاح",
        "fa-map-marker-alt"
      );
    }, 10000);

    addNotification(
      "تفعيل الموقع",
      "تم تفعيل تتبع موقعك الحالي",
      "fa-check-circle"
    );
  } else {
    alert("المتصفح لا يدعم تحديد الموقع");
  }
}

function cancelLocation() {
  state.isLocationActive = false;
  if (state.locationWatcher) {
    clearInterval(state.locationWatcher);
    state.locationWatcher = null;
  }

  // Reset to default position
  state.userPosition = { ...CONFIG.USER_POSITION };
  updateUserMarker();
  updateLocationUI();

  addNotification(
    "إلغاء الموقع",
    "تم إلغاء تتبع موقعك الحالي",
    "fa-times-circle"
  );
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
}

function updateUserMarker() {
  const marker = document.querySelector(".user-marker");
  if (marker) {
    marker.style.left = `${state.userPosition.lng}%`;
    marker.style.top = `${state.userPosition.lat}%`;
  }
}

// 2️⃣ Profile Management Functions
function openProfileModal() {
  if (!state.currentUser) return;

  // Load current user data
  document.getElementById("firstName").value =
    state.currentUser.firstName || "";
  document.getElementById("secondName").value =
    state.currentUser.secondName || "";
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
   /*if (currentUser.isLoggedIn) {
    window.location.href = "login.html";
    return false;
  }*/

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
  }
  window.location.href = "login.html";
}

// Load Interface
function loadPassengerInterface() {
  loadUserInfo();
  loadNotifications();
  renderInterface();
  setupEventListeners();
  startDataUpdates();
}

function loadUserInfo() {
  // إذا كان الاسم غير موجود، أنشئه من الأسماء المنفصلة
  if (
    !state.currentUser.name &&
    (state.currentUser.firstName || state.currentUser.lastName)
  ) {
    const fullName = [
      state.currentUser.firstName,
      state.currentUser.secondName,
      state.currentUser.thirdName,
      state.currentUser.lastName,
    ]
      .filter((name) => name && name.trim() !== "")
      .join(" ");
    state.currentUser.name = fullName;
  }

  const displayName = state.currentUser.name || "المستخدم";
  dom.userName.textContent = displayName;

  // تحديث نوع المستخدم حسب الجنس
  updateUserTypeBadge();
}

function loadNotifications() {
  state.notifications =
    JSON.parse(localStorage.getItem("passengerNotifications")) || [];
  updateNotificationDisplay();
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
            <button class="btn btn-secondary" id="toggleLocationBtn" onclick="toggleLocation()">
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
            <div class="map" id="liveMap"></div>
        </div>
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
  const map = document.getElementById("liveMap");
  map.innerHTML = "";

  createStationMarkers(map);
  createUserMarker(map);
  createBusMarkers(map);
}

function createStationMarkers(map) {
  CONFIG.STATIONS.forEach((station) => {
    const marker = document.createElement("div");
    marker.className = "station-marker";
    marker.style.left = `${station.lng}%`;
    marker.style.top = `${station.lat}%`;
    marker.title = station.name;
    map.appendChild(marker);
  });
}

function createUserMarker(map) {
  const marker = document.createElement("div");
  marker.className = "user-marker";
  marker.style.left = `${state.userPosition.lng}%`;
  marker.style.top = `${state.userPosition.lat}%`;
  marker.title = "موقعك الحالي";
  map.appendChild(marker);
}

function createBusMarkers(map) {
  state.busesData.forEach((bus) => {
    const marker = document.createElement("div");
    marker.className = "bus-marker";
    marker.id = `bus-marker-${bus.id}`;
    marker.style.left = `${bus.lng}%`;
    marker.style.top = `${bus.lat}%`;
    marker.innerHTML = `<i class="fas fa-bus"></i>`;
    marker.title = `الحافلة #${bus.id}: ${bus.from} → ${bus.to}`;

    marker.addEventListener("click", () => selectBus(bus.id));
    map.appendChild(marker);
  });
}

function renderRouteLines() {
  const map = document.getElementById("liveMap");

  // Remove old route lines
  state.activeRouteLines.forEach((line) => {
    if (line && line.parentNode) line.parentNode.removeChild(line);
  });
  state.activeRouteLines = [];

  if (!state.selectedBusId) return;

  const selectedBus = state.busesData.find((b) => b.id === state.selectedBusId);
  if (!selectedBus) return;

  const route = CONFIG.ROUTES.find((r) => r.id === selectedBus.route);
  if (!route || route.path.length < 2) return;

  // Draw route lines between points
  for (let i = 0; i < route.path.length - 1; i++) {
    const start = route.path[i];
    const end = route.path[i + 1];

    const dx = end.lng - start.lng;
    const dy = end.lat - start.lat;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const routeLine = document.createElement("div");
    routeLine.className = "route-line";
    routeLine.style.left = `${start.lng}%`;
    routeLine.style.top = `${start.lat}%`;
    routeLine.style.width = `${distance}%`;
    routeLine.style.transform = `rotate(${angle}deg)`;
    routeLine.title = `مسار الحافلة #${state.selectedBusId}: ${
      route.stations[i]
    } → ${route.stations[i + 1]}`;

    map.appendChild(routeLine);
    state.activeRouteLines.push(routeLine);
  }

  // Add end circle
  const endCircle = document.createElement("div");
  Object.assign(endCircle.style, {
    position: "absolute",
    left: `${route.path[route.path.length - 1].lng}%`,
    top: `${route.path[route.path.length - 1].lat}%`,
    width: "15px",
    height: "15px",
    background: "var(--success)",
    borderRadius: "50%",
    border: "2px solid white",
    boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
  });
  endCircle.title = "نهاية المسار";

  map.appendChild(endCircle);
  state.activeRouteLines.push(endCircle);
}

function selectBus(busId) {
  if (state.selectedBusId) {
    document
      .getElementById(`bus-marker-${state.selectedBusId}`)
      ?.classList.remove("active");
    document
      .querySelector(`.bus-card[data-bus-id="${state.selectedBusId}"]`)
      ?.classList.remove("active");
  }

  state.selectedBusId = busId;

  document.getElementById(`bus-marker-${busId}`)?.classList.add("active");
  document
    .querySelector(`.bus-card[data-bus-id="${busId}"]`)
    ?.classList.add("active");

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

  return `
        <div class="bus-card ${isActive ? "active" : ""}" data-bus-id="${
    bus.id
  }">
            <div class="bus-header">
                <div class="bus-number">الحافلة #${bus.id}</div>
                <div class="bus-status ${bus.status}">
                    ${bus.status === "active" ? "🟢 متاحة" : "🟡 متأخرة"}
                </div>
            </div>
            <div class="bus-body">
                <div class="bus-route">
                    <span>${bus.from}</span>
                    <i class="fas fa-arrow-left"></i>
                    <span>${bus.to}</span>
                </div>
                <div class="bus-info">
                    <div class="info-item">
                        <i class="fas fa-location-arrow"></i>
                        <span>${bus.distance} كم</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-user-friends"></i>
                        <span>${bus.current}/${bus.capacity} راكب</span>
                    </div>
                </div>
                <div class="bus-info">
                    <div class="info-item">
                        <i class="fas fa-user-tie"></i>
                        <span>${bus.driver}</span>
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
    dom.notificationList.innerHTML = state.notifications
      .slice(0, 10)
      .map(renderNotificationItem)
      .join("");
  }

  dom.notificationCount.textContent = state.notifications.length;
}

function renderNotificationItem(notification) {
  return `
        <div class="notification-item">
            <i class="fas ${notification.icon || "fa-bus"}"></i>
            <div class="notification-content">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
                <div class="notification-time">${notification.time}</div>
            </div>
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

// Data Updates
function startDataUpdates() {
  setInterval(updateBusPositions, CONFIG.UPDATE_INTERVALS.BUS_POSITIONS);
  setInterval(checkBusProximity, CONFIG.UPDATE_INTERVALS.BUS_PROXIMITY);
}

function updateBusPositions() {
  state.busesData.forEach((bus) => {
    // Simulate bus movement
    bus.lat += (Math.random() - 0.5) * 2;
    bus.lng += (Math.random() - 0.5) * 2;

    // Keep within bounds
    bus.lat = Math.max(10, Math.min(90, bus.lat));
    bus.lng = Math.max(10, Math.min(90, bus.lng));

    // Update marker position
    const marker = document.getElementById(`bus-marker-${bus.id}`);
    if (marker) {
      marker.style.left = `${bus.lng}%`;
      marker.style.top = `${bus.lat}%`;
    }

    // Update ETA
    const etaChange = Math.floor(Math.random() * 3) - 1;
    const currentEta = parseInt(bus.eta);
    bus.eta = Math.max(1, currentEta + etaChange).toString();

    // Update distance
    const distanceNum = parseFloat(bus.distance);
    const distanceChange = Math.random() * 0.2 - 0.1;
    bus.distance = Math.max(0.1, distanceNum + distanceChange).toFixed(1);

    // Update passenger count
    const passengerChange = Math.floor(Math.random() * 5) - 2;
    bus.current = Math.max(
      0,
      Math.min(bus.capacity, bus.current + passengerChange)
    );
  });

  renderBusCards();
  if (state.selectedBusId) renderRouteLines();
}

function checkBusProximity() {
  state.busesData.forEach((bus) => {
    const dx = bus.lng - state.userPosition.lng;
    const dy = bus.lat - state.userPosition.lat;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < CONFIG.PROXIMITY_THRESHOLD) {
      const existingNotification = state.notifications.find(
        (n) =>
          n.message.includes(`الحافلة #${bus.id}`) &&
          n.time.includes(
            new Date().toLocaleTimeString("ar-EG", { hour: "2-digit" })
          )
      );

      if (!existingNotification) {
        addNotification(
          `الحافلة #${bus.id} تقترب منك`,
          `الحافلة #${bus.id} (${bus.from} → ${bus.to}) على بعد ${Math.round(
            distance
          )}% من موقعك`,
          "fa-exclamation-circle"
        );
      }
    }
  });
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

  document.addEventListener("click", handleOutsideClick);
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