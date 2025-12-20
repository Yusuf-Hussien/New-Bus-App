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
            state.drivers = state.users.filter(user => user.accountType === 'driver');
            state.passengers = state.users.filter(user => user.accountType === 'passenger');
            state.admins = state.users.filter(user => user.accountType === 'admin');
        }

        // Render Functions
        function loadAdminInterface() {
            loadUserData();
            dom.userName.textContent = state.currentUser.name || 'المدير';
            
            dom.mainContent.innerHTML = `
                ${renderWelcomeMessage()}
                ${renderStats()}
                ${renderCharts()}
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
                    ${renderStatCard('fas fa-users', 'users', state.passengers.length, 'مسافر مسجل')}
                    ${renderStatCard('fas fa-id-card', 'drivers', state.drivers.length, 'سائق نشط')}
                    ${renderStatCard('fas fa-bus', 'buses', activeBuses, 'حافلة نشطة')}
                    ${renderStatCard('fas fa-route', 'trips', CONFIG.TRIP_DATA.length, 'رحلة اليوم')}
                    ${renderStatCard('fas fa-chart-line', 'revenue', '98%', 'رضا العملاء')}
                    ${renderStatCard('fas fa-chart-pie', 'active', '85%', 'كفاءة النظام')}
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

        function renderCharts() {
            return `
                <div class="charts-container">
                    ${renderChart('fas fa-chart-bar', 'إحصاءات الاستخدام')}
                    ${renderChart('fas fa-chart-pie', 'توزيع المستخدمين')}
                </div>
            `;
        }

        function renderChart(icon, title) {
            return `
                <div class="chart-card">
                    <div class="chart-title">
                        <i class="${icon}"></i> ${title}
                    </div>
                    <div class="chart-placeholder">
                        <i class="${icon}" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                        ${title}
                    </div>
                </div>
            `;
        }

        function renderTables() {
            return `
                <div class="admin-tables">
                    ${renderUsersTable()}
                    ${renderBusesTable()}
                    ${renderTripsTable()}
                </div>
            `;
        }

        function renderUsersTable() {
            return `
                <div class="table-container">
                    <div class="table-header">
                        <div class="table-title">
                            <i class="fas fa-users"></i> إدارة المستخدمين
                        </div>
                        <div class="table-actions">
                            <input type="text" class="search-box" placeholder="بحث في المستخدمين..." id="searchUsers">
                            <button class="table-btn" onclick="handleAddUser()">
                                <i class="fas fa-plus"></i> إضافة مستخدم
                            </button>
                        </div>
                    </div>
                    <div style="overflow-x: auto;">
                        <table id="usersTable">
                            <thead>
                                <tr>
                                    <th>الاسم</th>
                                    <th>البريد الإلكتروني</th>
                                    <th>نوع الحساب</th>
                                    <th>تاريخ التسجيل</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${state.users.map(renderUserRow).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        function renderUserRow(user) {
            const accountType = CONFIG.ACCOUNT_TYPES[user.accountType] || 'غير محدد';
            const statusClass = user.isLoggedIn ? 'status-active' : 'status-inactive';
            const statusText = user.isLoggedIn ? 'نشط' : 'غير نشط';
            const date = user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : '-';

            return `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${accountType}</td>
                    <td>${date}</td>
                    <td>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" onclick="handleEditUser('${user.id}')">
                                <i class="fas fa-edit"></i> تعديل
                            </button>
                            <button class="action-btn delete" onclick="handleDeleteUser('${user.id}')">
                                <i class="fas fa-trash"></i> حذف
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }

        function renderBusesTable() {
            return `
                <div class="table-container">
                    <div class="table-header">
                        <div class="table-title">
                            <i class="fas fa-bus"></i> إدارة الحافلات
                        </div>
                        <div class="table-actions">
                            <input type="text" class="search-box" placeholder="بحث في الحافلات..." id="searchBuses">
                            <button class="table-btn" onclick="handleAddBus()">
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
                                ${CONFIG.BUS_DATA.map(renderBusRow).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        function renderBusRow(bus) {
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
                            <button class="action-btn edit" onclick="handleEditBus(${bus.id})">
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

        // Search Functions
        function setupSearch() {
            setupTableSearch('searchUsers', 'usersTable');
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
        function handleAddUser() {
            alert('فتح نافذة إضافة مستخدم جديد');
        }

        function handleEditUser(userId) {
            alert(`فتح نافذة تعديل بيانات المستخدم: ${userId}`);
        }

        function handleDeleteUser(userId) {
            if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

            const updatedUsers = state.users.filter(user => user.id !== userId);
            localStorage.setItem('newbus_users', JSON.stringify(updatedUsers));
            alert('تم حذف المستخدم بنجاح');
            loadAdminInterface();
        }

        function handleAddBus() {
            alert('فتح نافذة إضافة حافلة جديدة');
        }

        function handleEditBus(busId) {
            alert(`فتح نافذة تعديل بيانات الحافلة: ${busId}`);
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