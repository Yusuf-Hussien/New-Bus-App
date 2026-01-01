// ============================
// Configuration - التكوينات الثابتة
// ============================
const CONFIG = {
  BUS_DATA: [
    {
      id: 101,
      model: "2023",
      capacity: 50,
      status: "active",
      driver: "محمد أحمد",
    },
    {
      id: 102,
      model: "2023",
      capacity: 50,
      status: "active",
      driver: "أحمد علي",
    },
    {
      id: 103,
      model: "2022",
      capacity: 45,
      status: "maintenance",
      driver: "محمود حسن",
    },
    {
      id: 104,
      model: "2023",
      capacity: 60,
      status: "active",
      driver: "خالد محمد",
    },
    {
      id: 105,
      model: "2022",
      capacity: 50,
      status: "inactive",
      driver: "عمر سعيد",
    },
  ],
  TRIP_DATA: [
    {
      id: "T-1001",
      driver: "محمد أحمد",
      bus: "#101",
      route: "المدينة الجامعية ← الجامعة",
      time: "1:00 م - 1:25 م",
      status: "completed",
    },
    {
      id: "T-1002",
      driver: "أحمد علي",
      bus: "#102",
      route: "موقف الدهار ← الفيروز",
      time: "1:10 م - 1:22 م",
      status: "completed",
    },
    {
      id: "T-1003",
      driver: "محمود حسن",
      bus: "#103",
      route: "كلية تربية الاحياء ← موقف الدهار",
      time: "1:15 م - 1:23 م",
      status: "completed",
    },
    {
      id: "T-1004",
      driver: "خالد محمد",
      bus: "#104",
      route: "الفيروز ← الجامعة",
      time: "1:20 م - 1:31 م",
      status: "completed",
    },
    {
      id: "T-1005",
      driver: "عمر سعيد",
      bus: "#105",
      route: "المدينة الجامعية ← الجامعة",
      time: "1:30 م - 1:55 م",
      status: "in-progress",
    },
  ],
  ACCOUNT_TYPES: {
    passenger: "مسافر",
    driver: "سائق",
    admin: "مدير",
  },
  STATUS_TEXTS: {
    active: "نشط",
    inactive: "غير نشط",
    maintenance: "صيانة",
    completed: "مكتملة",
    "in-progress": "جارية",
  },
};

// ============================
// State - حالة التطبيق
// ============================
const state = {
  currentUser: null,
  users: [],
  drivers: [],
  passengers: [],
  admins: [],
};

// ============================
// DOM Elements - عناصر الـ DOM
// ============================
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
  if (state.currentUser.userAccountType !== "admin") {
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
            <p>هذه الصفحة مخصصة لمدراء النظام فقط. يرجى تسجيل الدخول بحساب مدير.</p>
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

// ============================
// Data Functions - وظائف البيانات - UPDATED
// ============================
function loadUserData() {
  state.users = JSON.parse(localStorage.getItem("newbus_users")) || [];

  console.log("Loading user data... Total users:", state.users.length);

  // تحميل بيانات الركاب
  state.passengers = state.users
    .filter((user) => user.accountType === "passenger")
    .map((user) => {
      console.log("Processing passenger:", user);
      return {
        id: Number(user.id), // تأكد من أن الـ ID رقم
        fullName: user.name || "غير محدد",
        email: user.email || "غير محدد",
        phone: user.phone || "غير محدد",
        academicLevel: user.academicLevel || "غير محدد",
        college: user.college || "غير محدد",
        status: user.isLoggedIn ? "active" : "inactive",
        createdAt: user.createdAt,
      };
    });

  // تحميل بيانات السائقين مع الحقول الجديدة
  state.drivers = state.users
    .filter((user) => user.accountType === "driver")
    .map((user) => {
      console.log("Processing driver:", user);
      return {
        id: Number(user.id), // تأكد من أن الـ ID رقم
        firstName: user.firstName || user.name?.split(" ")[0] || "غير محدد",
        lastName:
          user.lastName ||
          user.name?.split(" ").slice(1).join(" ") ||
          "غير محدد",
        email: user.email || "غير محدد",
        phone: user.phone || "غير محدد",
        username: user.username || "غير محدد",
        busPlate: user.busPlate || "غير معين",
        status: user.isLoggedIn ? "active" : "inactive",
      };
    });

  state.admins = state.users.filter((user) => user.accountType === "admin");

  console.log(
    "Loaded:",
    state.passengers.length,
    "passengers,",
    state.drivers.length,
    "drivers"
  );
}

// ============================
// Helper Functions - دوال مساعدة - NEW
// ============================
function refreshUserData() {
  state.users = JSON.parse(localStorage.getItem("newbus_users")) || [];

  // تحديث state.drivers
  state.drivers = state.users
    .filter((user) => user.accountType === "driver")
    .map((user) => ({
      id: Number(user.id),
      firstName: user.firstName || user.name?.split(" ")[0] || "غير محدد",
      lastName:
        user.lastName || user.name?.split(" ").slice(1).join(" ") || "غير محدد",
      email: user.email || "غير محدد",
      phone: user.phone || "غير محدد",
      username: user.username || "غير محدد",
      busPlate: user.busPlate || "غير معين",
      status: user.isLoggedIn ? "active" : "inactive",
    }));

  // تحديث state.passengers
  state.passengers = state.users
    .filter((user) => user.accountType === "passenger")
    .map((user) => ({
      id: Number(user.id),
      fullName: user.name || "غير محدد",
      email: user.email || "غير محدد",
      phone: user.phone || "غير محدد",
      academicLevel: user.academicLevel || "غير محدد",
      college: user.college || "غير محدد",
      status: user.isLoggedIn ? "active" : "inactive",
      createdAt: user.createdAt,
    }));
}

// ============================
// Render Functions - وظائف العرض
// ============================
function loadAdminInterface() {
  refreshUserData();
  dom.userName.textContent = state.currentUser.name || "المدير";

  dom.mainContent.innerHTML = `
        ${renderWelcomeMessage()}
        ${renderStats()}
        ${renderTables()}
    `;

  setupSearch();
}

function renderWelcomeMessage() {
  return `
        <div class="welcome-message">
            <h1>مرحباً ${state.currentUser.name || "عزيزي المدير"}</h1>
            <p>لوحة التحكم الشاملة لإدارة نظام NewBus</p>
        </div>
    `;
}

function renderStats() {
  const activeBuses = CONFIG.BUS_DATA.filter(
    (bus) => bus.status === "active"
  ).length;

  return `
        <div class="admin-stats">
            ${renderStatCard(
              "fas fa-users",
              "users",
              state.passengers.length,
              "راكب مسجل"
            )}
            ${renderStatCard(
              "fas fa-id-card",
              "drivers",
              state.drivers.length,
              "سائق نشط"
            )}
            ${renderStatCard("fas fa-bus", "buses", activeBuses, "حافلة نشطة")}
            ${renderStatCard(
              "fas fa-route",
              "trips",
              CONFIG.TRIP_DATA.length,
              "رحلة اليوم"
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

function renderTables() {
  return `
        <div class="admin-tables">
            ${renderPassengersTable()}
            ${renderDriversTable()}
            ${renderBusesTable()}
            ${renderTripsTable()}
        </div>
    `;
}

function renderPassengersTable() {
  return `
        <div class="table-container">
            <div class="table-header">
                <div class="table-title">
                    <i class="fas fa-user-friends"></i> إدارة الركاب
                </div>
                <div class="table-actions">
                    <input type="text" class="search-box" placeholder="بحث في الركاب..." id="searchPassengers">
                </div>
            </div>
            <div style="overflow-x: auto;">
                <table id="passengersTable">
                    <thead>
                        <tr>
                            <th>الاسم الكامل</th>
                            <th>البريد الإلكتروني</th>
                            <th>رقم الهاتف</th>
                            <th>المستوى الدراسي</th>
                            <th>الكلية</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.passengers.map(renderPassengerRow).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderPassengerRow(passenger) {
  const statusClass =
    passenger.status === "active" ? "status-active" : "status-inactive";
  const statusText = passenger.status === "active" ? "نشط" : "غير نشط";

  return `
        <tr>
            <td>${passenger.fullName}</td>
            <td>${passenger.email}</td>
            <td>${passenger.phone}</td>
            <td>${passenger.academicLevel}</td>
            <td>${passenger.college}</td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="handleEditPassenger(${passenger.id})">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="action-btn delete" onclick="handleDeletePassenger(${passenger.id})">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function renderDriversTable() {
  return `
        <div class="table-container">
            <div class="table-header">
                <div class="table-title">
                    <i class="fas fa-id-card-alt"></i> إدارة السائقين
                </div>
                <div class="table-actions">
                    <input type="text" class="search-box" placeholder="بحث في السائقين..." id="searchDrivers">
                    <button class="table-btn" onclick="showAddDriverModal()">
                        <i class="fas fa-plus"></i> إضافة سائق
                    </button>
                </div>
            </div>
            <div style="overflow-x: auto;">
                <table id="driversTable">
                    <thead>
                        <tr>
                            <th>الاسم الأول</th>
                            <th>البريد الإلكتروني</th>
                            <th>رقم الهاتف</th>
                            <th>اسم المستخدم</th>
                            <th>رقم الحافلة</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.drivers.map(renderDriverRow).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderDriverRow(driver) {
  const statusClass =
    driver.status === "active" ? "status-active" : "status-inactive";
  const statusText = driver.status === "active" ? "نشط" : "غير نشط";

  return `
        <tr>
            <td>${driver.firstName}</td>
            <td>${driver.email}</td>
            <td>${driver.phone}</td>
            <td>${driver.username}</td>
            <td>${driver.busPlate}</td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="handleEditDriver(${driver.id})">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="action-btn delete" onclick="handleDeleteDriver(${driver.id})">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function renderBusesTable() {
  const availableDrivers = state.drivers.map(
    (d) => d.firstName + " " + d.lastName
  );

  return `
        <div class="table-container">
            <div class="table-header">
                <div class="table-title">
                    <i class="fas fa-bus"></i> إدارة الحافلات
                </div>
                <div class="table-actions">
                    <input type="text" class="search-box" placeholder="بحث في الحافلات..." id="searchBuses">
                    <button class="table-btn" onclick="showAddBusModal()">
                        <i class="fas fa-plus"></i> إضافة حافلة
                    </button>
                </div>
            </div>
            <div style="overflow-x: auto;">
                <table id="busesTable">
                    <thead>
                        <tr>
                            <th>رقم الحافلة</th>
                            <th>الموديل</th>
                            <th>السعة</th>
                            <th>الحالة</th>
                            <th>السائق</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${CONFIG.BUS_DATA.map((bus) =>
                          renderBusRow(bus, availableDrivers)
                        ).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderBusRow(bus, availableDrivers) {
  const statusClass = getStatusClass(bus.status);
  const statusText = CONFIG.STATUS_TEXTS[bus.status] || bus.status;

  return `
        <tr>
            <td>#${bus.id}</td>
            <td>${bus.model}</td>
            <td>${bus.capacity} مقعد</td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
            <td>${bus.driver}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="showEditBusModal(${bus.id})">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="action-btn view" onclick="handleViewBus(${bus.id})">
                        <i class="fas fa-eye"></i> عرض
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function renderTripsTable() {
  return `
        <div class="table-container">
            <div class="table-header">
                <div class="table-title">
                    <i class="fas fa-route"></i> الرحلات الحديثة
                </div>
                <div class="table-actions">
                    <input type="text" class="search-box" placeholder="بحث في الرحلات..." id="searchTrips">
                </div>
            </div>
            <div style="overflow-x: auto;">
                <table id="tripsTable">
                    <thead>
                        <tr>
                            <th>رقم الرحلة</th>
                            <th>السائق</th>
                            <th>الحافلة</th>
                            <th>المسار</th>
                            <th>الوقت</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${CONFIG.TRIP_DATA.map(renderTripRow).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderTripRow(trip) {
  const statusClass = getStatusClass(trip.status);
  const statusText = CONFIG.STATUS_TEXTS[trip.status] || trip.status;

  return `
        <tr>
            <td>${trip.id}</td>
            <td>${trip.driver}</td>
            <td>${trip.bus}</td>
            <td>${trip.route}</td>
            <td>${trip.time}</td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="handleViewTrip('${trip.id}')">
                        <i class="fas fa-eye"></i> عرض
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function getStatusClass(status) {
  const statusMap = {
    active: "status-active",
    completed: "status-active",
    "in-progress": "status-pending",
    maintenance: "status-pending",
    inactive: "status-inactive",
  };
  return statusMap[status] || "status-inactive";
}

// ============================
// Modal Functions - وظائف النوافذ المنبثقة
// ============================
function showModal(title, content) {
  const modalHTML = `
        <div class="modal-overlay" id="modalOverlay">
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title">
                        <i class="fas fa-cog"></i> ${title}
                    </div>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // إغلاق النافذة عند النقر خارجها
  document
    .getElementById("modalOverlay")
    .addEventListener("click", function (e) {
      if (e.target === this) closeModal();
    });
}

function closeModal() {
  const modal = document.getElementById("modalOverlay");
  if (modal) {
    modal.remove();
  }
}

// ============================
// Bus Management Modals - نوافذ إدارة الحافلات
// ============================
function showAddBusModal() {
  const availableDrivers = state.drivers.map(
    (d) => d.firstName + " " + d.lastName
  );

  const modalContent = `
        <form id="addBusForm" onsubmit="handleAddBusSubmit(event)">
            <div class="form-group">
                <label for="busNumber">رقم الحافلة *</label>
                <input type="number" class="form-control" id="busNumber" required min="1">
            </div>
            
            <div class="form-group">
                <label for="busModel">الموديل *</label>
                <input type="text" class="form-control" id="busModel" required>
            </div>
            
            <div class="form-group">
                <label for="busCapacity">السعة (عدد المقاعد) *</label>
                <input type="number" class="form-control" id="busCapacity" required min="1" max="100">
            </div>
            
            <div class="form-group">
                <label for="busStatus">الحالة *</label>
                <select class="form-control select" id="busStatus" required>
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="busDriver">السائق المعين</label>
                <select class="form-control select" id="busDriver">
                    <option value="">اختر سائقاً</option>
                    ${availableDrivers
                      .map(
                        (driver) =>
                          `<option value="${driver}">${driver}</option>`
                      )
                      .join("")}
                </select>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="table-btn secondary" onclick="closeModal()">إلغاء</button>
                <button type="submit" class="table-btn">
                    <i class="fas fa-plus"></i> إضافة الحافلة
                </button>
            </div>
        </form>
    `;

  showModal("إضافة حافلة جديدة", modalContent);
}

function showEditBusModal(busId) {
  const bus = CONFIG.BUS_DATA.find((b) => b.id === busId);
  if (!bus) return;

  const availableDrivers = state.drivers.map(
    (d) => d.firstName + " " + d.lastName
  );

  const modalContent = `
        <form id="editBusForm" onsubmit="handleEditBusSubmit(event, ${busId})">
            <div class="form-group">
                <label for="editBusNumber">رقم الحافلة *</label>
                <input type="number" class="form-control" id="editBusNumber" value="${
                  bus.id
                }" required min="1">
            </div>
            
            <div class="form-group">
                <label for="editBusStatus">الحالة *</label>
                <select class="form-control select" id="editBusStatus" required>
                    <option value="active" ${
                      bus.status === "active" ? "selected" : ""
                    }>نشط</option>
                    <option value="inactive" ${
                      bus.status === "inactive" ? "selected" : ""
                    }>غير نشط</option>
                    <option value="maintenance" ${
                      bus.status === "maintenance" ? "selected" : ""
                    }>صيانة</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="editBusDriver">السائق المعين</label>
                <select class="form-control select" id="editBusDriver">
                    <option value="">اختر سائقاً</option>
                    ${availableDrivers
                      .map(
                        (driver) => `
                        <option value="${driver}" ${
                          bus.driver === driver ? "selected" : ""
                        }>${driver}</option>
                    `
                      )
                      .join("")}
                </select>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="table-btn secondary" onclick="closeModal()">إلغاء</button>
                <button type="submit" class="table-btn">
                    <i class="fas fa-save"></i> حفظ التغييرات
                </button>
            </div>
        </form>
    `;

  showModal(`تعديل الحافلة #${busId}`, modalContent);
}

// ============================
// Add Driver Modal - نافذة إضافة سائق جديد
// ============================
function showAddDriverModal() {
  const activeBuses = CONFIG.BUS_DATA.filter((bus) => bus.status === "active");

  const modalContent = `
        <form id="addDriverForm" onsubmit="handleAddDriverSubmit(event)">
            <div class="form-section">
                <h3 class="form-section-title">
                    <i class="fas fa-user"></i> المعلومات الشخصية
                </h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="newDriverFirstName">الاسم الأول *</label>
                        <input type="text" class="form-control" id="newDriverFirstName" required 
                               placeholder="أدخل الاسم الأول">
                    </div>
                    <div class="form-group">
                        <label for="newDriverLastName">الاسم الأخير *</label>
                        <input type="text" class="form-control" id="newDriverLastName" required 
                               placeholder="أدخل الاسم الأخير">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="newDriverPhone">رقم الهاتف *</label>
                        <input type="tel" class="form-control" id="newDriverPhone" required 
                               placeholder="مثال: +201234567890">
                    </div>
                    <div class="form-group">
                        <label for="newDriverGender">الجنس *</label>
                        <select class="form-control select" id="newDriverGender" required>
                            <option value="">اختر الجنس</option>
                            <option value="male">ذكر</option>
                            <option value="female">أنثى</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3 class="form-section-title">
                    <i class="fas fa-key"></i> معلومات الحساب
                </h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="newDriverUsername">اسم المستخدم *</label>
                        <input type="text" class="form-control" id="newDriverUsername" required 
                               placeholder="أدخل اسم المستخدم بشكل مستقل">
                       
                    </div>
                    <div class="form-group">
                        <label for="newDriverEmail">البريد الإلكتروني *</label>
                        <input type="email" class="form-control" id="newDriverEmail" required 
                               placeholder="أدخل البريد الإلكتروني بشكل مستقل">
                        
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="newDriverPassword">كلمة المرور *</label>
                        <input type="password" class="form-control" id="newDriverPassword" required 
                               placeholder="أدخل كلمة المرور (8 أحرف على الأقل)">
                    </div>
                    <div class="form-group">
                        <label for="newDriverConfirmPassword">تأكيد كلمة المرور *</label>
                        <input type="password" class="form-control" id="newDriverConfirmPassword" required 
                               placeholder="أعد إدخال كلمة المرور">
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3 class="form-section-title">
                    <i class="fas fa-bus"></i> معلومات العمل
                </h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="newDriverBus">الحافلة المخصصة (اختياري)</label>
                        <select class="form-control select" id="newDriverBus">
                            <option value="">اختر حافلة</option>
                            ${activeBuses
                              .map(
                                (bus) => `
                                <option value="${bus.id}">الحافلة #${bus.id} (موديل ${bus.model})</option>
                            `
                              )
                              .join("")}
                        </select>
                        <small class="form-text">يمكن تعيين الحافلة لاحقاً</small>
                    </div>
                    <div class="form-group">
                        <label for="newDriverStatus">حالة السائق *</label>
                        <select class="form-control select" id="newDriverStatus" required>
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="table-btn secondary" onclick="closeModal()">إلغاء</button>
                <button type="submit" class="table-btn">
                    <i class="fas fa-plus"></i> إضافة السائق
                </button>
            </div>
        </form>
    `;

  showModal("إضافة سائق جديد", modalContent);
}

// ============================
// Driver Edit Modal - نافذة تعديل بيانات السائق
// ============================
function handleEditDriver(driverId) {
  const numericDriverId = Number(driverId);
  console.log("Opening edit modal for driver ID:", numericDriverId);

  const driver = state.drivers.find((d) => d.id === numericDriverId);
  if (!driver) {
    console.error("Driver not found with ID:", numericDriverId);
    alert("لم يتم العثور على بيانات السائق");
    return;
  }

  // الحصول على معلومات السائق الكاملة من state.users
  const fullDriverData = state.users.find((u) => u.id === numericDriverId);
  console.log("Full driver data:", fullDriverData);

  const activeBuses = CONFIG.BUS_DATA.filter(
    (bus) => bus.status === "active"
  ).map((bus) => `#${bus.id}`);

  const modalContent = `
        <form id="editDriverForm" onsubmit="handleEditDriverSubmit(event, ${numericDriverId})">
            <input type="hidden" id="originalDriverEmail" value="${
              driver.email
            }">
            
            <div class="form-section">
                <h3 class="form-section-title">
                    <i class="fas fa-user"></i> المعلومات الشخصية
                </h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editDriverFirstName">الاسم الأول *</label>
                        <input type="text" class="form-control" id="editDriverFirstName" 
                               value="${driver.firstName || ""}" required>
                    </div>
                    <div class="form-group">
                        <label for="editDriverLastName">الاسم الأخير *</label>
                        <input type="text" class="form-control" id="editDriverLastName" 
                               value="${driver.lastName || ""}" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editDriverPhone">رقم الهاتف *</label>
                        <input type="tel" class="form-control" id="editDriverPhone" 
                               value="${driver.phone || ""}" required>
                    </div>
                    <div class="form-group">
                        <label for="editDriverGender">الجنس *</label>
                        <select class="form-control select" id="editDriverGender" required>
                            <option value="male" ${
                              fullDriverData?.gender === "male"
                                ? "selected"
                                : ""
                            }>ذكر</option>
                            <option value="female" ${
                              fullDriverData?.gender === "female"
                                ? "selected"
                                : ""
                            }>أنثى</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3 class="form-section-title">
                    <i class="fas fa-key"></i> معلومات الحساب
                </h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editDriverUsername">اسم المستخدم *</label>
                        <input type="text" class="form-control" id="editDriverUsername" 
                               value="${driver.username || ""}" required>
                    </div>
                    <div class="form-group">
                        <label for="editDriverEmail">البريد الإلكتروني</label>
                        <input type="email" class="form-control" id="editDriverEmail" 
                               value="${driver.email || ""}" readonly disabled>
                        <small class="form-text">البريد الإلكتروني لا يمكن تعديله</small>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="editDriverPassword">تغيير كلمة المرور (اختياري)</label>
                    <input type="password" class="form-control" id="editDriverPassword" 
                           placeholder="أدخل كلمة مرور جديدة أو اتركه فارغاً">
                </div>
            </div>
            
            <div class="form-section">
                <h3 class="form-section-title">
                    <i class="fas fa-bus"></i> معلومات العمل
                </h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editDriverBus">رقم الحافلة</label>
                        <select class="form-control select" id="editDriverBus">
                            <option value="">غير معين</option>
                            ${activeBuses
                              .map(
                                (bus) => `
                                <option value="${bus}" ${
                                  driver.busPlate === bus ? "selected" : ""
                                }>${bus}</option>
                            `
                              )
                              .join("")}
                        </select>
                        <small class="form-text">الحافلات النشطة فقط</small>
                    </div>
                    <div class="form-group">
                        <label for="editDriverStatus">الحالة *</label>
                        <select class="form-control select" id="editDriverStatus" required>
                            <option value="active" ${
                              driver.status === "active" ? "selected" : ""
                            }>نشط</option>
                            <option value="inactive" ${
                              driver.status === "inactive" ? "selected" : ""
                            }>غير نشط</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="table-btn secondary" onclick="closeModal()">إلغاء</button>
                <button type="submit" class="table-btn">
                    <i class="fas fa-save"></i> حفظ التغييرات
                </button>
            </div>
        </form>
    `;

  showModal(`تعديل بيانات السائق ${driver.firstName}`, modalContent);
}

// ============================
// Passenger Edit Modal - نافذة تعديل بيانات الراكب
// ============================
function handleEditPassenger(passengerId) {
  const numericPassengerId = Number(passengerId);
  console.log("Opening edit modal for passenger ID:", numericPassengerId);

  const passenger = state.passengers.find((p) => p.id === numericPassengerId);
  if (!passenger) {
    console.error("Passenger not found with ID:", numericPassengerId);
    alert("لم يتم العثور على بيانات الراكب");
    return;
  }

  // قائمة الكليات المتاحة المحدّثة
  const colleges = [
    "حاسبات وذكاء اصطناعي",
    "سياحة وفنادق",
    "السن",
    "علوم صحية",
    "تربية",
  ];

  // المستويات الدراسية المتاحة
  const academicLevels = [
    "السنة الأولى",
    "السنة الثانية",
    "السنة الثالثة",
    "السنة الرابعة",
    "السنة الخامسة",
    "الدراسات العليا",
  ];

  const modalContent = `
        <form id="editPassengerForm" onsubmit="handleEditPassengerSubmit(event, ${numericPassengerId})">
            <input type="hidden" id="originalPassengerEmail" value="${
              passenger.email
            }">
            
            <div class="form-group">
                <label for="editPassengerFullName">الاسم الكامل *</label>
                <input type="text" class="form-control" id="editPassengerFullName" 
                       value="${passenger.fullName || ""}" required>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="editPassengerEmail">البريد الإلكتروني</label>
                    <input type="email" class="form-control" id="editPassengerEmail" 
                           value="${passenger.email || ""}" readonly disabled>
                    <small class="form-text">البريد الإلكتروني لا يمكن تعديله</small>
                </div>
                <div class="form-group">
                    <label for="editPassengerPhone">رقم الهاتف *</label>
                    <input type="tel" class="form-control" id="editPassengerPhone" 
                           value="${passenger.phone || ""}" required>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="editPassengerCollege">الكلية *</label>
                    <select class="form-control select" id="editPassengerCollege" required>
                        <option value="">اختر الكلية</option>
                        ${colleges
                          .map(
                            (college) => `
                            <option value="${college}" ${
                              passenger.college === college ? "selected" : ""
                            }>
                                ${college}
                            </option>
                        `
                          )
                          .join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label for="editPassengerAcademicLevel">المستوى الدراسي *</label>
                    <select class="form-control select" id="editPassengerAcademicLevel" required>
                        <option value="">اختر المستوى الدراسي</option>
                        ${academicLevels
                          .map(
                            (level) => `
                            <option value="${level}" ${
                              passenger.academicLevel === level
                                ? "selected"
                                : ""
                            }>
                                ${level}
                            </option>
                        `
                          )
                          .join("")}
                    </select>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="table-btn secondary" onclick="closeModal()">إلغاء</button>
                <button type="submit" class="table-btn">
                    <i class="fas fa-save"></i> حفظ التغييرات
                </button>
            </div>
        </form>
    `;

  showModal(`تعديل بيانات الراكب ${passenger.fullName}`, modalContent);
}

// ============================
// Admin Update Modal - نافذة تحديث بيانات المدير
// ============================
function handleUpdateAdmin() {
  const admin = state.currentUser;

  const modalContent = `
        <form id="updateAdminForm" onsubmit="handleUpdateAdminSubmit(event)">
            <input type="hidden" id="originalAdminEmail" value="${admin.email}">
            
            <div class="form-row">
                <div class="form-group">
                    <label for="adminFirstName">الاسم الأول *</label>
                    <input type="text" class="form-control" id="adminFirstName" 
                           value="${admin.name?.split(" ")[0] || ""}" required>
                </div>
                <div class="form-group">
                    <label for="adminSecondName">الاسم الثاني</label>
                    <input type="text" class="form-control" id="adminSecondName" 
                           value="${admin.name?.split(" ")[1] || ""}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="adminThirdName">الاسم الثالث</label>
                    <input type="text" class="form-control" id="adminThirdName" 
                           value="${admin.name?.split(" ")[2] || ""}">
                </div>
                <div class="form-group">
                    <label for="adminLastName">الاسم الأخير *</label>
                    <input type="text" class="form-control" id="adminLastName" 
                           value="${
                             admin.name?.split(" ").slice(-1)[0] || ""
                           }" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="adminGender">الجنس *</label>
                <select class="form-control select" id="adminGender" required>
                    <option value="male" ${
                      admin.gender === "male" ? "selected" : ""
                    }>ذكر</option>
                    <option value="female" ${
                      admin.gender === "female" ? "selected" : ""
                    }>أنثى</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="adminUsername">اسم المستخدم *</label>
                <input type="text" class="form-control" id="adminUsername" 
                       value="${admin.username || ""}" required>
            </div>
            
            <div class="form-group">
                <label for="adminEmail">البريد الإلكتروني</label>
                <input type="email" class="form-control" id="adminEmail" 
                       value="${admin.email || ""}" readonly disabled>
                <small class="form-text">البريد الإلكتروني لا يمكن تعديله</small>
            </div>
            
            <div class="form-group">
                <label for="oldAdminPassword">كلمة المرور القديمة *</label>
                <input type="password" class="form-control" id="oldAdminPassword" 
                       placeholder="أدخل كلمة المرور الحالية" required>
                <small class="form-text">مطلوبة لأي تحديث للبيانات</small>
            </div>
            
            <div class="form-group">
                <label for="adminPassword">كلمة المرور الجديدة</label>
                <input type="password" class="form-control" id="adminPassword" 
                       placeholder="اتركه فارغاً للحفاظ على كلمة المرور الحالية">
                <small class="form-text">اختياري - أدخل فقط إذا أردت تغيير كلمة المرور</small>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="table-btn secondary" onclick="closeModal()">إلغاء</button>
                <button type="submit" class="table-btn">
                    <i class="fas fa-user-edit"></i> تحديث البيانات
                </button>
            </div>
        </form>
    `;

  showModal("تحديث بيانات المدير", modalContent);
}

// ============================
// Form Submit Handlers - معالجات تقديم النماذج
// ============================
function handleAddBusSubmit(event) {
  event.preventDefault();

  const newBus = {
    id: parseInt(document.getElementById("busNumber").value),
    model: document.getElementById("busModel").value,
    capacity: parseInt(document.getElementById("busCapacity").value),
    status: document.getElementById("busStatus").value,
    driver: document.getElementById("busDriver").value || "غير معين",
  };

  CONFIG.BUS_DATA.push(newBus);
  alert(`تم إضافة الحافلة #${newBus.id} بنجاح`);
  closeModal();
  loadAdminInterface();
}

function handleEditBusSubmit(event, busId) {
  event.preventDefault();

  const busIndex = CONFIG.BUS_DATA.findIndex((b) => b.id === busId);
  if (busIndex === -1) return;

  const newNumber = parseInt(document.getElementById("editBusNumber").value);
  const status = document.getElementById("editBusStatus").value;
  const driver = document.getElementById("editBusDriver").value || "غير معين";

  // تحديث رقم الحافلة
  if (newNumber !== busId) {
    CONFIG.BUS_DATA[busIndex].id = newNumber;
  }

  CONFIG.BUS_DATA[busIndex].status = status;
  CONFIG.BUS_DATA[busIndex].driver = driver;

  alert(`تم تحديث بيانات الحافلة #${newNumber} بنجاح`);
  closeModal();
  loadAdminInterface();
}

// ============================
// Add Driver Handler - معالجة إضافة سائق جديد
// ============================
function handleAddDriverSubmit(event) {
  event.preventDefault();

  // الحصول على البيانات من النموذج
  const firstName = document.getElementById("newDriverFirstName").value.trim();
  const lastName = document.getElementById("newDriverLastName").value.trim();
  const phone = document.getElementById("newDriverPhone").value.trim();
  const gender = document.getElementById("newDriverGender").value;
  const username = document.getElementById("newDriverUsername").value.trim();
  const email = document.getElementById("newDriverEmail").value.trim();
  const password = document.getElementById("newDriverPassword").value;
  const confirmPassword = document.getElementById(
    "newDriverConfirmPassword"
  ).value;
  const busId = document.getElementById("newDriverBus").value;
  const status = document.getElementById("newDriverStatus").value;

  // التحقق من البيانات الإجبارية
  if (
    !firstName ||
    !lastName ||
    !phone ||
    !gender ||
    !username ||
    !email ||
    !password ||
    !confirmPassword
  ) {
    alert("جميع الحقول الإجبارية مطلوبة");
    return;
  }

  // التحقق من مطابقة كلمتي المرور
  if (password !== confirmPassword) {
    alert("كلمة المرور وتأكيدها غير متطابقتين");
    return;
  }

  // التحقق من طول كلمة المرور
  if (password.length < 8) {
    alert("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
    return;
  }

  // التحقق من صيغة البريد الإلكتروني
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("صيغة البريد الإلكتروني غير صحيحة");
    return;
  }

  // التحقق من عدم تكرار اسم المستخدم
  const existingUserByUsername = state.users.find(
    (user) => user.username === username
  );
  if (existingUserByUsername) {
    alert("اسم المستخدم هذا موجود بالفعل. يرجى اختيار اسم مستخدم آخر");
    return;
  }

  // التحقق من عدم تكرار البريد الإلكتروني
  const existingUserByEmail = state.users.find((user) => user.email === email);
  if (existingUserByEmail) {
    alert("البريد الإلكتروني هذا مسجل بالفعل. يرجى استخدام بريد إلكتروني آخر");
    return;
  }

  // إنشاء ID جديد
  const newId = Date.now();
  const fullName = `${firstName} ${lastName}`;

  // الحصول على اسم الحافلة إذا تم اختيارها
  let busPlate = "غير معين";
  if (busId) {
    const selectedBus = CONFIG.BUS_DATA.find(
      (bus) => bus.id === parseInt(busId)
    );
    busPlate = selectedBus ? `#${busId}` : "غير معين";
  }

  // إنشاء كائن السائق الجديد
  const newDriver = {
    id: newId,
    name: fullName,
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: phone,
    username: username,
    password: password,
    gender: gender,
    accountType: "driver",
    isLoggedIn: status === "active",
    busPlate: busPlate,
    status: status,
    createdAt: new Date().toISOString(),
  };

  // إضافة السائق إلى state.users
  state.users.push(newDriver);
  localStorage.setItem("newbus_users", JSON.stringify(state.users));

  // تحديث CONFIG.BUS_DATA إذا تم اختيار حافلة
  if (busId && status === "active") {
    const busIndex = CONFIG.BUS_DATA.findIndex(
      (bus) => bus.id === parseInt(busId)
    );
    if (busIndex !== -1) {
      CONFIG.BUS_DATA[busIndex].driver = fullName;
    }
  }

  alert(
    `تم إضافة السائق ${fullName} بنجاح\nاسم المستخدم: ${username}\nالبريد الإلكتروني: ${email}`
  );
  closeModal();
  loadAdminInterface();
}

// ============================
// Driver Edit Handler - معالجة تعديل بيانات السائق - FIXED
// ============================
function handleEditDriverSubmit(event, driverId) {
  event.preventDefault();

  console.log("=== START EDIT DRIVER SUBMIT ===");
  console.log("Driver ID:", driverId, "Type:", typeof driverId);

  // استرجاع البريد الإلكتروني الأصلي
  const originalEmail = document.getElementById("originalDriverEmail").value;
  console.log("Original email:", originalEmail);

  // الحصول على البيانات من النموذج
  const firstName = document.getElementById("editDriverFirstName").value.trim();
  const lastName = document.getElementById("editDriverLastName").value.trim();
  const phone = document.getElementById("editDriverPhone").value.trim();
  const gender = document.getElementById("editDriverGender").value;
  const username = document.getElementById("editDriverUsername").value.trim();
  const newPassword = document.getElementById("editDriverPassword").value;
  const busPlate = document.getElementById("editDriverBus").value || "غير معين";
  const status = document.getElementById("editDriverStatus").value;

  console.log("Form data:", {
    firstName,
    lastName,
    phone,
    gender,
    username,
    newPassword: newPassword ? "***" : "empty",
    busPlate,
    status,
  });

  // التحقق من البيانات الإجبارية
  if (!firstName || !lastName || !phone || !gender || !username) {
    alert("جميع الحقول الإجبارية مطلوبة");
    return;
  }

  // تحويل driverId إلى عدد
  const numericDriverId = Number(driverId);
  console.log("Numeric driver ID:", numericDriverId);

  // تحديث بيانات السائق في state.drivers
  const driverIndex = state.drivers.findIndex((d) => d.id === numericDriverId);
  console.log("Driver index in state.drivers:", driverIndex);

  if (driverIndex !== -1) {
    state.drivers[driverIndex] = {
      ...state.drivers[driverIndex],
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      username: username,
      busPlate: busPlate,
      status: status,
    };

    console.log("Updated driver in state.drivers:", state.drivers[driverIndex]);
  }

  // تحديث بيانات السائق في state.users و localStorage
  let users = JSON.parse(localStorage.getItem("newbus_users")) || [];
  console.log("Total users before update:", users.length);

  const userIndex = users.findIndex((u) => u.id === numericDriverId);
  console.log("User index in users array:", userIndex);

  if (userIndex !== -1) {
    const oldBusPlate = users[userIndex].busPlate;
    const fullName = `${firstName} ${lastName}`;

    console.log("Old bus plate:", oldBusPlate);
    console.log("New bus plate:", busPlate);

    // تحديث بيانات المستخدم
    const updatedUser = {
      ...users[userIndex],
      name: fullName,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      gender: gender,
      username: username,
      isLoggedIn: status === "active",
      busPlate: busPlate,
      status: status,
      email: originalEmail, // الحفاظ على البريد الإلكتروني الأصلي
    };

    // تحديث كلمة المرور إذا تم إدخال واحدة جديدة
    if (newPassword && newPassword.trim() !== "") {
      if (newPassword.length < 8) {
        alert("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل");
        return;
      }
      updatedUser.password = newPassword;
      console.log("Password updated");
    }

    users[userIndex] = updatedUser;
    console.log("Updated user in array:", users[userIndex]);

    // حفظ التحديثات في localStorage
    localStorage.setItem("newbus_users", JSON.stringify(users));
    console.log("Users saved to localStorage");

    // تحديث CONFIG.BUS_DATA (ربط السائق بالحافلة)
    if (oldBusPlate && oldBusPlate !== "غير معين" && oldBusPlate !== busPlate) {
      // إزالة السائق من الحافلة القديمة
      const oldBusNumber = oldBusPlate.replace("#", "");
      const oldBusIndex = CONFIG.BUS_DATA.findIndex(
        (bus) => bus.id === parseInt(oldBusNumber)
      );
      if (oldBusIndex !== -1) {
        CONFIG.BUS_DATA[oldBusIndex].driver = "غير معين";
        console.log("Removed driver from old bus:", oldBusNumber);
      }
    }

    if (
      busPlate &&
      busPlate !== "غير معين" &&
      busPlate !== "" &&
      status === "active"
    ) {
      const busNumber = parseInt(busPlate.replace("#", ""));
      const busIndex = CONFIG.BUS_DATA.findIndex((bus) => bus.id === busNumber);
      if (busIndex !== -1) {
        CONFIG.BUS_DATA[busIndex].driver = fullName;
        console.log("Assigned driver to bus:", busNumber, "Driver:", fullName);
      } else {
        console.log("Bus not found:", busNumber);
      }
    }
  } else {
    console.error("User not found with ID:", numericDriverId);
  }

  // تحديث state.users للتوافق مع localStorage
  refreshUserData();

  alert("تم تحديث بيانات السائق بنجاح");
  closeModal();
  loadAdminInterface();
}

// ============================
// Passenger Edit Handler - معالجة تعديل بيانات الراكب - FIXED
// ============================
function handleEditPassengerSubmit(event, passengerId) {
  event.preventDefault();

  console.log("=== START EDIT PASSENGER SUBMIT ===");
  console.log("Passenger ID:", passengerId, "Type:", typeof passengerId);

  // استرجاع البريد الإلكتروني الأصلي
  const originalEmail = document.getElementById("originalPassengerEmail").value;
  console.log("Original email:", originalEmail);

  const fullName = document.getElementById("editPassengerFullName").value;
  const phone = document.getElementById("editPassengerPhone").value;
  const college = document.getElementById("editPassengerCollege").value;
  const academicLevel = document.getElementById(
    "editPassengerAcademicLevel"
  ).value;

  console.log("Passenger data:", { fullName, phone, college, academicLevel });

  // التحقق من البيانات
  if (!fullName || !phone || !college || !academicLevel) {
    alert("جميع الحقول مطلوبة");
    return;
  }

  // تحويل passengerId إلى عدد
  const numericPassengerId = Number(passengerId);
  console.log("Numeric passenger ID:", numericPassengerId);

  // تحديث بيانات الراكب في state.passengers
  const passengerIndex = state.passengers.findIndex(
    (p) => p.id === numericPassengerId
  );
  console.log("Passenger index in state.passengers:", passengerIndex);

  if (passengerIndex !== -1) {
    state.passengers[passengerIndex] = {
      ...state.passengers[passengerIndex],
      fullName: fullName,
      phone: phone,
      college: college,
      academicLevel: academicLevel,
      email: originalEmail, // الحفاظ على البريد الإلكتروني الأصلي
    };
    console.log("Passenger updated in state.passengers");
  }

  // تحديث بيانات الراكب في state.users و localStorage
  let users = JSON.parse(localStorage.getItem("newbus_users")) || [];
  const userIndex = users.findIndex((u) => u.id === numericPassengerId);
  console.log("User index in users array:", userIndex);

  if (userIndex !== -1) {
    users[userIndex] = {
      ...users[userIndex],
      name: fullName,
      phone: phone,
      college: college,
      academicLevel: academicLevel,
      email: originalEmail, // الحفاظ على البريد الإلكتروني الأصلي
    };

    localStorage.setItem("newbus_users", JSON.stringify(users));
    console.log("Passenger data updated in localStorage");
  } else {
    console.error("Passenger not found with ID:", numericPassengerId);
  }

  // تحديث state.users للتوافق مع localStorage
  refreshUserData();

  alert("تم تحديث بيانات الراكب بنجاح");
  closeModal();
  loadAdminInterface();
}

// ============================
// Admin Update Handler - معالجة تحديث بيانات المدير - FIXED
// ============================
function handleUpdateAdminSubmit(event) {
  event.preventDefault();

  console.log("=== START UPDATE ADMIN SUBMIT ===");

  const oldPassword = document.getElementById("oldAdminPassword").value;
  const newPassword = document.getElementById("adminPassword").value;

  // التحقق من كلمة المرور القديمة
  if (oldPassword !== state.currentUser.password) {
    alert("كلمة المرور القديمة غير صحيحة. يرجى إدخال كلمة المرور الصحيحة.");
    return;
  }

  // استرجاع البريد الإلكتروني الأصلي
  const originalEmail = document.getElementById("originalAdminEmail").value;

  const firstName = document.getElementById("adminFirstName").value;
  const secondName = document.getElementById("adminSecondName").value;
  const thirdName = document.getElementById("adminThirdName").value;
  const lastName = document.getElementById("adminLastName").value;
  const gender = document.getElementById("adminGender").value;
  const username = document.getElementById("adminUsername").value;

  // التحقق من عدم تكرار اسم المستخدم (باستثناء المستخدم الحالي)
  let users = JSON.parse(localStorage.getItem("newbus_users")) || [];
  const existingUser = users.find(
    (user) => user.username === username && user.id !== state.currentUser.id
  );
  if (existingUser) {
    alert("اسم المستخدم هذا موجود بالفعل. يرجى اختيار اسم مستخدم آخر");
    return;
  }

  // بناء الاسم الكامل
  const nameParts = [firstName];
  if (secondName) nameParts.push(secondName);
  if (thirdName) nameParts.push(thirdName);
  if (lastName) nameParts.push(lastName);
  const fullName = nameParts.join(" ");

  console.log("Admin update data:", {
    fullName,
    gender,
    username,
    originalEmail,
    newPassword: newPassword ? "***" : "empty",
  });

  // تحديث بيانات المدير في state.currentUser
  state.currentUser.name = fullName;
  state.currentUser.gender = gender;
  state.currentUser.username = username;

  // الحفاظ على البريد الإلكتروني الأصلي
  state.currentUser.email = originalEmail;

  // تحديث كلمة المرور فقط إذا تم إدخال كلمة مرور جديدة
  if (newPassword && newPassword.trim() !== "") {
    if (newPassword.length < 8) {
      alert("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    state.currentUser.password = newPassword;
    console.log("Admin password updated");
  }

  // تحديث localStorage
  localStorage.setItem("currentUser", JSON.stringify(state.currentUser));
  console.log("currentUser updated in localStorage");

  // تحديث بيانات المستخدمين في localStorage
  const userIndex = users.findIndex((u) => u.id === state.currentUser.id);

  if (userIndex !== -1) {
    users[userIndex] = {
      ...users[userIndex],
      name: fullName,
      gender: gender,
      username: username,
      email: originalEmail, // الحفاظ على البريد الأصلي
    };

    // تحديث كلمة المرور فقط إذا تم تغييرها
    if (newPassword && newPassword.trim() !== "") {
      users[userIndex].password = newPassword;
    }

    localStorage.setItem("newbus_users", JSON.stringify(users));
    console.log("Admin data updated in users array");
  }

  alert("تم تحديث بيانات المدير بنجاح");
  closeModal();
  loadAdminInterface();
}

// ============================
// Search Functions - وظائف البحث
// ============================
function setupSearch() {
  setupTableSearch("searchPassengers", "passengersTable");
  setupTableSearch("searchDrivers", "driversTable");
  setupTableSearch("searchBuses", "busesTable");
  setupTableSearch("searchTrips", "tripsTable");
}

function setupTableSearch(inputId, tableId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(searchTerm) ? "" : "none";
    });
  });
}

// ============================
// Action Handlers - معالجات الإجراءات
// ============================
function handleAddPassenger() {
  alert("فتح نافذة إضافة راكب جديد");
}

function handleDeletePassenger(passengerId) {
  if (!confirm("هل أنت متأكد من حذف هذا الراكب؟")) return;

  const updatedUsers = state.users.filter((user) => user.id !== passengerId);
  localStorage.setItem("newbus_users", JSON.stringify(updatedUsers));
  alert("تم حذف الراكب بنجاح");
  loadAdminInterface();
}

function handleDeleteDriver(driverId) {
  if (!confirm("هل أنت متأكد من حذف هذا السائق؟")) return;

  // الحصول على بيانات السائق قبل الحذف
  const driver = state.drivers.find((d) => d.id === driverId);
  if (driver && driver.busPlate && driver.busPlate !== "غير معين") {
    // إزالة السائق من الحافلة
    const busNumber = driver.busPlate.replace("#", "");
    const busIndex = CONFIG.BUS_DATA.findIndex(
      (bus) => bus.id === parseInt(busNumber)
    );
    if (busIndex !== -1) {
      CONFIG.BUS_DATA[busIndex].driver = "غير معين";
    }
  }

  const updatedUsers = state.users.filter((user) => user.id !== driverId);
  localStorage.setItem("newbus_users", JSON.stringify(updatedUsers));
  alert("تم حذف السائق بنجاح");
  loadAdminInterface();
}

function handleViewBus(busId) {
  alert(`عرض تفاصيل الحافلة: ${busId}`);
}

function handleViewTrip(tripId) {
  alert(`عرض تفاصيل الرحلة: ${tripId}`);
}

// ============================
// Debug Functions - وظائف التصحيح
// ============================
function debugEditData(type, id) {
  console.log(`=== DEBUG ${type.toUpperCase()} DATA ===`);
  console.log(`ID: ${id} (Type: ${typeof id})`);

  const numericId = Number(id);

  if (type === "driver") {
    const inState = state.drivers.find((d) => d.id === numericId);
    const inUsers = state.users.find((u) => u.id === numericId);
    console.log("In state.drivers:", inState);
    console.log("In state.users:", inUsers);
  } else if (type === "passenger") {
    const inState = state.passengers.find((p) => p.id === numericId);
    const inUsers = state.users.find((u) => u.id === numericId);
    console.log("In state.passengers:", inState);
    console.log("In state.users:", inUsers);
  }

  const users = JSON.parse(localStorage.getItem("newbus_users")) || [];
  const inLocalStorage = users.find((u) => u.id === numericId);
  console.log("In localStorage:", inLocalStorage);
}

// ============================
// Initialize - تهيئة التطبيق
// ============================
document.addEventListener("DOMContentLoaded", function () {
  console.log("Admin panel loading...");
  if (checkAuth()) {
    loadAdminInterface();
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