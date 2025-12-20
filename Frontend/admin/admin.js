// Configuration
const CONFIG = {
    BUS_DATA: [
        { id: 101, model: '2023', capacity: 50, status: 'active', driver: 'محمد أحمد' },
        { id: 102, model: '2023', capacity: 50, status: 'active', driver: 'أحمد علي' },
        { id: 103, model: '2022', capacity: 45, status: 'maintenance', driver: 'محمود حسن' },
        { id: 104, model: '2023', capacity: 60, status: 'active', driver: 'خالد محمد' },
        { id: 105, model: '2022', capacity: 50, status: 'inactive', driver: 'عمر سعيد' }
    ],
    TRIP_DATA: [
        { id: 'T-1001', driver: 'محمد أحمد', bus: '#101', route: 'المدينة الجامعية ← الجامعة', time: '1:00 م - 1:25 م', status: 'completed' },
        { id: 'T-1002', driver: 'أحمد علي', bus: '#102', route: 'موقف الدهار ← الفيروز', time: '1:10 م - 1:22 م', status: 'completed' },
        { id: 'T-1003', driver: 'محمود حسن', bus: '#103', route: 'كلية تربية الاحياء ← موقف الدهار', time: '1:15 م - 1:23 م', status: 'completed' },
        { id: 'T-1004', driver: 'خالد محمد', bus: '#104', route: 'الفيروز ← الجامعة', time: '1:20 م - 1:31 م', status: 'completed' },
        { id: 'T-1005', driver: 'عمر سعيد', bus: '#105', route: 'المدينة الجامعية ← الجامعة', time: '1:30 م - 1:55 م', status: 'in-progress' }
    ],
    ACCOUNT_TYPES: {
        passenger: 'مسافر',
        driver: 'سائق',
        admin: 'مدير'
    },
    STATUS_TEXTS: {
        active: 'نشط',
        inactive: 'غير نشط',
        maintenance: 'صيانة',
        completed: 'مكتملة',
        'in-progress': 'جارية'
    }
};

// State
const state = {
    currentUser: null,
    users: [],
    drivers: [],
    passengers: [],
    admins: []
};

// DOM Elements
const dom = {
    mainContent: document.getElementById('mainContent'),
    userName: document.getElementById('userName')
};

// Auth Functions
function checkAuth() {
    state.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!state.currentUser || !state.currentUser.isLoggedIn) {
        window.location.href = "login.html";
        return false;
    }
    
    if (state.currentUser.accountType !== 'admin') {
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
    if (!confirm('هل تريد تسجيل الخروج؟')) return;

    if (state.currentUser) {
        state.currentUser.isLoggedIn = false;
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    }

    window.location.href = "login.html";
}

// Data Functions
function loadUserData() {
    state.users = JSON.parse(localStorage.getItem('newbus_users')) || [];
    
    // تحميل بيانات الركاب
    state.passengers = state.users.filter(user => user.accountType === 'passenger').map(user => ({
        id: user.id,
        fullName: user.name || 'غير محدد',
        email: user.email || 'غير محدد',
        phone: user.phone || 'غير محدد',
        academicLevel: user.academicLevel || 'غير محدد',
        college: user.college || 'غير محدد',
        status: user.isLoggedIn ? 'active' : 'inactive',
        createdAt: user.createdAt
    }));
    
    // تحميل بيانات السائقين مع الحقول الجديدة
    state.drivers = state.users.filter(user => user.accountType === 'driver').map(user => ({
        id: user.id,
        firstName: user.firstName || user.name?.split(' ')[0] || 'غير محدد',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || 'غير محدد',
        email: user.email || 'غير محدد',
        phone: user.phone || 'غير محدد',
        username: user.username || 'غير محدد',
        busPlate: user.busPlate || 'غير معين',
        status: user.isLoggedIn ? 'active' : 'inactive'
    }));
    
    state.admins = state.users.filter(user => user.accountType === 'admin');
}

// Render Functions
function loadAdminInterface() {
    loadUserData();
    dom.userName.textContent = state.currentUser.name || 'المدير';
    
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
            <h1>مرحباً ${state.currentUser.name || 'عزيزي المدير'}</h1>
            <p>لوحة التحكم الشاملة لإدارة نظام NewBus</p>
        </div>
    `;
}

function renderStats() {
    const activeBuses = CONFIG.BUS_DATA.filter(bus => bus.status === 'active').length;
    
    return `
        <div class="admin-stats">
            ${renderStatCard('fas fa-users', 'users', state.passengers.length, 'راكب مسجل')}
            ${renderStatCard('fas fa-id-card', 'drivers', state.drivers.length, 'سائق نشط')}
            ${renderStatCard('fas fa-bus', 'buses', activeBuses, 'حافلة نشطة')}
            ${renderStatCard('fas fa-route', 'trips', CONFIG.TRIP_DATA.length, 'رحلة اليوم')}
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
                    <button class="table-btn" onclick="handleAddPassenger()">
                        <i class="fas fa-plus"></i> إضافة راكب
                    </button>
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
                        ${state.passengers.map(renderPassengerRow).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderPassengerRow(passenger) {
    const statusClass = passenger.status === 'active' ? 'status-active' : 'status-inactive';
    const statusText = passenger.status === 'active' ? 'نشط' : 'غير نشط';

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
                    <button class="action-btn edit" onclick="handleEditPassenger('${passenger.id}')">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="action-btn delete" onclick="handleDeletePassenger('${passenger.id}')">
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
                    <button class="table-btn" onclick="handleAddDriver()">
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
                        ${state.drivers.map(renderDriverRow).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderDriverRow(driver) {
    const statusClass = driver.status === 'active' ? 'status-active' : 'status-inactive';
    const statusText = driver.status === 'active' ? 'نشط' : 'غير نشط';

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
                    <button class="action-btn edit" onclick="handleEditDriver('${driver.id}')">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="action-btn delete" onclick="handleDeleteDriver('${driver.id}')">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function renderBusesTable() {
    const availableDrivers = state.drivers.map(d => d.firstName + ' ' + d.lastName);
    
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
                        ${CONFIG.BUS_DATA.map(bus => renderBusRow(bus, availableDrivers)).join('')}
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
                    <button class="table-btn secondary" onclick="handleExportTrips()">
                        <i class="fas fa-download"></i> تصدير البيانات
                    </button>
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
                        ${CONFIG.TRIP_DATA.map(renderTripRow).join('')}
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
        'active': 'status-active',
        'completed': 'status-active',
        'in-progress': 'status-pending',
        'maintenance': 'status-pending',
        'inactive': 'status-inactive'
    };
    return statusMap[status] || 'status-inactive';
}

// Modal Functions
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
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // إغلاق النافذة عند النقر خارجها
    document.getElementById('modalOverlay').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

function closeModal() {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
        modal.remove();
    }
}

// Bus Management Modals
function showAddBusModal() {
    const availableDrivers = state.drivers.map(d => d.firstName + ' ' + d.lastName);
    
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
                    ${availableDrivers.map(driver => `<option value="${driver}">${driver}</option>`).join('')}
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
    
    showModal('إضافة حافلة جديدة', modalContent);
}

function showEditBusModal(busId) {
    const bus = CONFIG.BUS_DATA.find(b => b.id === busId);
    if (!bus) return;
    
    const availableDrivers = state.drivers.map(d => d.firstName + ' ' + d.lastName);
    
    const modalContent = `
        <form id="editBusForm" onsubmit="handleEditBusSubmit(event, ${busId})">
            <div class="form-group">
                <label for="editBusNumber">رقم الحافلة *</label>
                <input type="number" class="form-control" id="editBusNumber" value="${bus.id}" required min="1">
            </div>
            
            <div class="form-group">
                <label for="editBusStatus">الحالة *</label>
                <select class="form-control select" id="editBusStatus" required>
                    <option value="active" ${bus.status === 'active' ? 'selected' : ''}>نشط</option>
                    <option value="inactive" ${bus.status === 'inactive' ? 'selected' : ''}>غير نشط</option>
                    <option value="maintenance" ${bus.status === 'maintenance' ? 'selected' : ''}>صيانة</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="editBusDriver">السائق المعين</label>
                <select class="form-control select" id="editBusDriver">
                    <option value="">اختر سائقاً</option>
                    ${availableDrivers.map(driver => `
                        <option value="${driver}" ${bus.driver === driver ? 'selected' : ''}>${driver}</option>
                    `).join('')}
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

// Driver Edit Modal
function handleEditDriver(driverId) {
    driverId = Number(driverId); 
    const driver = state.drivers.find(d => d.id === driverId);
    if (!driver) {
        alert('لم يتم العثور على بيانات السائق');
        return;
    }
    
    const availableBuses = CONFIG.BUS_DATA.filter(bus => bus.status === 'active').map(bus => `#${bus.id}`);
    
    const modalContent = `
        <form id="editDriverForm" onsubmit="handleEditDriverSubmit(event, '${driverId}')">
            <div class="form-row">
                <div class="form-group">
                    <label for="editDriverUsername">اسم المستخدم *</label>
                    <input type="text" class="form-control" id="editDriverUsername" 
                           value="${driver.username || ''}" required>
                </div>
                <div class="form-group">
                    <label for="editDriverPhone">رقم الهاتف *</label>
                    <input type="tel" class="form-control" id="editDriverPhone" 
                           value="${driver.phone || ''}" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="editDriverEmail">البريد الإلكتروني *</label>
                <input type="email" class="form-control" id="editDriverEmail" 
                       value="${driver.email || ''}" required>
            </div>
            
            <div class="form-group">
                <label for="editDriverFirstName">الاسم الأول *</label>
                    <input type="text" class="form-control" id="editDriverFirstName" 
                           value="${driver.firstName || ''}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editDriverBus">رقم الحافلة</label>
                        <select class="form-control select" id="editDriverBus">
                            <option value="">غير معين</option>
                            ${availableBuses.map(bus => `
                                <option value="${bus}" ${driver.busPlate === bus ? 'selected' : ''}>${bus}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editDriverStatus">الحالة *</label>
                        <select class="form-control select" id="editDriverStatus" required>
                            <option value="active" ${driver.status === 'active' ? 'selected' : ''}>نشط</option>
                            <option value="inactive" ${driver.status === 'inactive' ? 'selected' : ''}>غير نشط</option>
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
        
        showModal(`تعديل بيانات السائق ${driver.firstName}`, modalContent);
    }
    
    // Passenger Edit Modal - النسخة المحدثة
    function handleEditPassenger(passengerId) {
        passengerId = Number(passengerId);
        const passenger = state.passengers.find(p => p.id === passengerId);
        if (!passenger) {
            alert('لم يتم العثور على بيانات الراكب');
            return;
        }
        
        // قائمة الكليات المتاحة المحدّثة
        const colleges = [
            'حاسبات وذكاء اصطناعي',
            'سياحة وفنادق', 
            'السن',
            'علوم صحية',
            'تربية'
        ];
        
        // المستويات الدراسية المتاحة
        const academicLevels = [
            'السنة الأولى',
            'السنة الثانية', 
            'السنة الثالثة',
            'السنة الرابعة',
            'السنة الخامسة',
            'الدراسات العليا'
        ];
        
        const modalContent = `
            <form id="editPassengerForm" onsubmit="handleEditPassengerSubmit(event, '${passengerId}')">
                <div class="form-group">
                    <label for="editPassengerFullName">الاسم الكامل *</label>
                    <input type="text" class="form-control" id="editPassengerFullName" 
                           value="${passenger.fullName || ''}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editPassengerEmail">البريد الإلكتروني *</label>
                        <input type="email" class="form-control" id="editPassengerEmail" 
                               value="${passenger.email || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="editPassengerPhone">رقم الهاتف *</label>
                        <input type="tel" class="form-control" id="editPassengerPhone" 
                               value="${passenger.phone || ''}" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editPassengerCollege">الكلية *</label>
                        <select class="form-control select" id="editPassengerCollege" required>
                            <option value="">اختر الكلية</option>
                            ${colleges.map(college => `
                                <option value="${college}" ${passenger.college === college ? 'selected' : ''}>
                                    ${college}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editPassengerAcademicLevel">المستوى الدراسي *</label>
                        <select class="form-control select" id="editPassengerAcademicLevel" required>
                            <option value="">اختر المستوى الدراسي</option>
                            ${academicLevels.map(level => `
                                <option value="${level}" ${passenger.academicLevel === level ? 'selected' : ''}>
                                    ${level}
                                </option>
                            `).join('')}
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
        
        showModal(` تعديل بيانات ال راكب ${passenger.fullName}`, modalContent);
    }
    
    // Admin Update Modal
    function handleUpdateAdmin() {
        const admin = state.currentUser;
        
        const modalContent = `
            <form id="updateAdminForm" onsubmit="handleUpdateAdminSubmit(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label for="adminFirstName">الاسم الأول *</label>
                        <input type="text" class="form-control" id="adminFirstName" 
                               value="${admin.name?.split(' ')[0] || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="adminSecondName">الاسم الثاني</label>
                        <input type="text" class="form-control" id="adminSecondName" 
                               value="${admin.name?.split(' ')[1] || ''}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="adminThirdName">الاسم الثالث</label>
                        <input type="text" class="form-control" id="adminThirdName" 
                               value="${admin.name?.split(' ')[2] || ''}">
                    </div>
                    <div class="form-group">
                        <label for="adminLastName">الاسم الأخير *</label>
                        <input type="text" class="form-control" id="adminLastName" 
                               value="${admin.name?.split(' ').slice(-1)[0] || ''}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="adminGender">الجنس *</label>
                    <select class="form-control select" id="adminGender" required>
                        <option value="male" ${admin.gender === 'male' ? 'selected' : ''}>ذكر</option>
                        <option value="female" ${admin.gender === 'female' ? 'selected' : ''}>أنثى</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="adminUsername">اسم المستخدم *</label>
                    <input type="text" class="form-control" id="adminUsername" 
                           value="${admin.username || ''}" required>
                </div>
                
                <div class="form-group">
                    <label for="adminEmail">البريد الإلكتروني *</label>
                    <input type="email" class="form-control" id="adminEmail" 
                           value="${admin.email || ''}" required>
                </div>
                
                <div class="form-group">
                    <label for="adminPassword">كلمة المرور الجديدة</label>
                    <input type="password" class="form-control" id="adminPassword" 
                           placeholder="اتركه فارغاً للحفاظ على كلمة المرور الحالية">
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="table-btn secondary" onclick="closeModal()">إلغاء</button>
                    <button type="submit" class="table-btn">
                        <i class="fas fa-user-edit"></i> تحديث البيانات
                    </button>
                </div>
            </form>
        `;
        
        showModal('تحديث بيانات المدير', modalContent);
    }
    
    // Form Submit Handlers
    function handleAddBusSubmit(event) {
        event.preventDefault();
        
        const newBus = {
            id: parseInt(document.getElementById('busNumber').value),
            model: document.getElementById('busModel').value,
            capacity: parseInt(document.getElementById('busCapacity').value),
            status: document.getElementById('busStatus').value,
            driver: document.getElementById('busDriver').value || 'غير معين'
        };
        
        CONFIG.BUS_DATA.push(newBus);
        alert(`تم إضافة الحافلة #${newBus.id} بنجاح`);
        closeModal();
        loadAdminInterface();
    }
    
    function handleEditBusSubmit(event, busId) {
        event.preventDefault();
        
        const busIndex = CONFIG.BUS_DATA.findIndex(b => b.id === busId);
        if (busIndex === -1) return;
        
        const newNumber = parseInt(document.getElementById('editBusNumber').value);
        const status = document.getElementById('editBusStatus').value;
        const driver = document.getElementById('editBusDriver').value || 'غير معين';
        
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
    
    // Driver Edit Submit Handler
    function handleEditDriverSubmit(event, driverId) {
        event.preventDefault();
        
        const username = document.getElementById('editDriverUsername').value;
        const phone = document.getElementById('editDriverPhone').value;
        const email = document.getElementById('editDriverEmail').value;
        const firstName = document.getElementById('editDriverFirstName').value;
        const busPlate = document.getElementById('editDriverBus').value;
        const status = document.getElementById('editDriverStatus').value;
        
        // تحديث بيانات السائق في state.drivers
        const driverIndex = state.drivers.findIndex(d => d.id === driverId);
        if (driverIndex !== -1) {
            state.drivers[driverIndex] = {
                ...state.drivers[driverIndex],
                username: username,
                phone: phone,
                email: email,
                firstName: firstName,
                busPlate: busPlate,
                status: status
            };
        }
        
        // تحديث بيانات السائق في state.users و localStorage
        const users = JSON.parse(localStorage.getItem('newbus_users')) || [];
        const userIndex = users.findIndex(u => u.id === driverId);
        
        if (userIndex !== -1) {
            // الحفاظ على الاسم الكامل (إن كان موجوداً)
            const currentName = users[userIndex].name || '';
            const nameParts = currentName.split(' ');
            nameParts[0] = firstName; // تحديث الاسم الأول فقط
            const updatedName = nameParts.join(' ');
            
            users[userIndex] = {
                ...users[userIndex],
                username: username,
                phone: phone,
                email: email,
                name: updatedName,
                firstName: firstName,
                busPlate: busPlate,
                isLoggedIn: status === 'active' ? true : false,
                status: status
            };
            
            localStorage.setItem('newbus_users', JSON.stringify(users));
        }
        
        // تحديث CONFIG.BUS_DATA إذا تم تغيير رقم الحافلة
        if (busPlate && busPlate !== 'غير معين' && busPlate !== '') {
            const busNumber = parseInt(busPlate.replace('#', ''));
            const busIndex = CONFIG.BUS_DATA.findIndex(bus => bus.id === busNumber);
            if (busIndex !== -1) {
                // تحديث اسم السائق في بيانات الحافلة
                const driverFullName = `${firstName} ${users[userIndex]?.lastName || ''}`.trim();
                CONFIG.BUS_DATA[busIndex].driver = driverFullName || firstName;
            }
        }
        
        // تحديث اسم المستخدم في واجهة المستخدم إذا كان السائق هو المستخدم الحالي
        if (state.currentUser && state.currentUser.id === driverId) {
            state.currentUser.username = username;
            state.currentUser.email = email;
            localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
        }
        
        alert('تم تحديث بيانات السائق بنجاح');
        closeModal();
        loadAdminInterface(); // إعادة تحميل الواجهة لعرض التغييرات
    }
    
    // Passenger Edit Submit Handler - الجديدة
    function handleEditPassengerSubmit(event, passengerId) {
        event.preventDefault();
        
        const fullName = document.getElementById('editPassengerFullName').value;
        const email = document.getElementById('editPassengerEmail').value;
        const phone = document.getElementById('editPassengerPhone').value;
        const college = document.getElementById('editPassengerCollege').value;
        const academicLevel = document.getElementById('editPassengerAcademicLevel').value;
        
        // تحديث بيانات الراكب في state.passengers
        const passengerIndex = state.passengers.findIndex(p => p.id === passengerId);
        if (passengerIndex !== -1) {
            state.passengers[passengerIndex] = {
                ...state.passengers[passengerIndex],
                fullName: fullName,
                email: email,
                phone: phone,
                college: college,
                academicLevel: academicLevel
            };
        }
        
        // تحديث بيانات الراكب في state.users و localStorage
        const users = JSON.parse(localStorage.getItem('newbus_users')) || [];
        const userIndex = users.findIndex(u => u.id === passengerId);
        
        if (userIndex !== -1) {
            users[userIndex] = {
                ...users[userIndex],
                name: fullName,
                email: email,
                phone: phone,
                college: college,
                academicLevel: academicLevel
            };
            
            localStorage.setItem('newbus_users', JSON.stringify(users));
        }
        
        // تحديث اسم المستخدم في واجهة المستخدم إذا كان الراكب هو المستخدم الحالي
        if (state.currentUser && state.currentUser.id === passengerId) {
            state.currentUser.name = fullName;
            state.currentUser.email = email;
            localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
        }
        
        alert('تم تحديث بيانات الراكب بنجاح');
        closeModal();
        loadAdminInterface(); // إعادة تحميل الواجهة لعرض التغييرات
    }
    
    function handleUpdateAdminSubmit(event) {
        event.preventDefault();
        
        const firstName = document.getElementById('adminFirstName').value;
        const secondName = document.getElementById('adminSecondName').value;
        const thirdName = document.getElementById('adminThirdName').value;
        const lastName = document.getElementById('adminLastName').value;
        const gender = document.getElementById('adminGender').value;
        const username = document.getElementById('adminUsername').value;
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        
        // بناء الاسم الكامل
        const nameParts = [firstName];
        if (secondName) nameParts.push(secondName);
        if (thirdName) nameParts.push(thirdName);
        if (lastName) nameParts.push(lastName);
        const fullName = nameParts.join(' ');
        
        // تحديث بيانات المدير
        state.currentUser.name = fullName;
        state.currentUser.gender = gender;
        state.currentUser.username = username;
        state.currentUser.email = email;
        
        if (password) {
            state.currentUser.password = password;
        }
        
        // تحديث localStorage
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
        
        // تحديث بيانات المستخدمين
        const users = JSON.parse(localStorage.getItem('newbus_users')) || [];
        const userIndex = users.findIndex(u => u.id === state.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...state.currentUser };
            localStorage.setItem('newbus_users', JSON.stringify(users));
        }
        
        alert('تم تحديث بيانات المدير بنجاح');
        closeModal();
        loadAdminInterface();
    }
    
    // Search Functions
    function setupSearch() {
        setupTableSearch('searchPassengers', 'passengersTable');
        setupTableSearch('searchDrivers', 'driversTable');
        setupTableSearch('searchBuses', 'busesTable');
        setupTableSearch('searchTrips', 'tripsTable');
    }
    
    function setupTableSearch(inputId, tableId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        input.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll(`#${tableId} tbody tr`);
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
    
    // Action Handlers
    function handleAddPassenger() {
        alert('فتح نافذة إضافة ؤاكب جديد');
    }
    
    function handleDeletePassenger(passengerId) {
        if (!confirm('هل أنت متأكد من حذف هذا الراكب؟')) return;
        
        const updatedUsers = state.users.filter(user => user.id !== passengerId);
        localStorage.setItem('newbus_users', JSON.stringify(updatedUsers));
        alert('تم حذف الراكب بنجاح');
        loadAdminInterface();
    }
    
    function handleAddDriver() {
        alert('فتح نافذة إضافة سائق جديد');
    }
    
    function handleDeleteDriver(driverId) {
        if (!confirm('هل أنت متأكد من حذف هذا السائق؟')) return;
        
        const updatedUsers = state.users.filter(user => user.id !== driverId);
        localStorage.setItem('newbus_users', JSON.stringify(updatedUsers));
        alert('تم حذف السائق بنجاح');
        loadAdminInterface();
    }
    
    function handleViewBus(busId) {
        alert(`عرض تفاصيل الحافلة: ${busId}`);
    }
    
    function handleViewTrip(tripId) {
        alert(`عرض تفاصيل الرحلة: ${tripId}`);
    }
    
    function handleExportTrips() {
        alert('جاري تصدير بيانات الرحلات...');
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        if (checkAuth()) {
            loadAdminInterface();
        }
    });