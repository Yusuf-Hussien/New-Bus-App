 // App State
        const state = {
            isTripActive: false,
            passengerCount: 0,
            currentTrip: null,
            currentUser: null
        };

        // Configuration
        const CONFIG = {
            ROUTES: [
                { id: 'city-campus', name: 'المدينة الجامعية ← الجامعة' },
                { id: 'dahar-feroz', name: 'موقف الدهار ← الفيروز' },
                { id: 'biology-dahar', name: 'كلية تربية الاحياء ← موقف الدهار' },
                { id: 'feroz-campus', name: 'الفيروز ← الجامعة' }
            ],
            BUSES: [
                { id: '101', name: '#101 (سعة 50 راكب)' },
                { id: '102', name: '#102 (سعة 50 راكب)' },
                { id: '103', name: '#103 (سعة 45 راكب)' },
                { id: '104', name: '#104 (سعة 60 راكب)' }
            ],
            STATIONS: [
                { name: 'المدينة الجامعية', top: '20%', left: '20%' },
                { name: 'موقف الدهار', top: '40%', left: '40%' },
                { name: 'كلية تربية الاحياء', top: '60%', left: '60%' },
                { name: 'الفيروز', top: '30%', left: '80%' },
                { name: 'الجامعة', top: '70%', left: '80%' }
            ],
            MAX_PASSENGERS: 60,
            MIN_PASSENGERS: 0
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
            
            if (state.currentUser.accountType !== 'driver') {
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
            if (!confirm('هل تريد تسجيل الخروج؟')) return;

            if (state.isTripActive) {
                if (confirm('هناك رحلة نشطة. هل تريد إنهاء الرحلة قبل الخروج؟')) {
                    endTrip();
                }
            }

            if (state.currentUser) {
                state.currentUser.isLoggedIn = false;
                localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
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
            dom.userName.textContent = state.currentUser.name || 'السائق';
        }

        function loadTripState() {
            const savedTrip = JSON.parse(localStorage.getItem('currentTrip'));
            
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
        }

        function renderWelcomeMessage() {
            return `
                <div class="welcome-message">
                    <h1>مرحباً ${state.currentUser.name || 'عزيزي السائق'}</h1>
                    <p>استخدم تطبيق NewBus لإدارة رحلاتك وتتبع حافلتك</p>
                </div>
            `;
        }

        function renderDashboard() {
            return `
                <div class="driver-dashboard">
                    ${renderDashboardCard('fas fa-road', 'primary', 'رحلات اليوم', '3', 'رحلة مكتملة')}
                    ${renderDashboardCard('fas fa-clock', 'success', 'متوسط الوقت', '24', 'دقيقة للرحلة')}
                    ${renderDashboardCard('fas fa-users', 'warning', 'الركاب اليوم', '142', 'مسافر تم نقلهم')}
                </div>
            `;
        }

        function renderDashboardCard(icon, colorClass, title, value, label) {
            return `
                <div class="dashboard-card">
                    <div class="card-header">
                        <div class="card-icon ${colorClass}">
                            <i class="${icon}"></i>
                        </div>
                        <div class="card-title">${title}</div>
                    </div>
                    <div style="text-align: center; padding: 20px 0;">
                        <div style="font-size: 3rem; font-weight: 700; color: var(--${colorClass});">${value}</div>
                        <div style="color: var(--gray);">${label}</div>
                    </div>
                </div>
            `;
        }

        function renderTripForm() {
            return `
                <div class="trip-form">
                    <h2 style="color: var(--primary); margin-bottom: 20px;">
                        <i class="fas fa-play-circle"></i> بدء رحلة جديدة
                    </h2>
                    
                    ${renderSelect('routeSelect', 'اختر المسار', CONFIG.ROUTES)}
                    ${renderSelect('busSelect', 'اختر الحافلة', CONFIG.BUSES)}
                    
                    <div style="text-align: center; margin: 25px 0;">
                        <label class="form-label">عدد الركاب الحالي</label>
                        <div class="passenger-count">
                            <button class="count-btn" id="decreasePassengers">-</button>
                            <div class="count-display" id="passengerCountDisplay">${state.passengerCount}</div>
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
            const optionsHtml = options.map(opt => 
                `<option value="${opt.id}">${opt.name}</option>`
            ).join('');
            
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
                    
                    <button class="action-btn end" id="endTripBtn" style="margin-top: 25px;">
                        <i class="fas fa-stop"></i> إنهاء الرحلة
                    </button>
                </div>
            `;
        }

        function renderTripDetails() {
            return `
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 1.1rem; margin-bottom: 10px;">
                        <strong>المسار:</strong> ${state.currentTrip.routeName}
                    </div>
                    <div style="font-size: 1.1rem; margin-bottom: 10px;">
                        <strong>الحافلة:</strong> #${state.currentTrip.busNumber}
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
                    ${renderStatItem(state.passengerCount, 'عدد الركاب')}
                    ${renderStatItem('24', 'دقيقة متبقية')}
                    ${renderStatItem('65%', 'إكمال الرحلة')}
                </div>
            `;
        }

        function renderStatItem(value, label) {
            return `
                <div class="stat-item">
                    <div class="stat-value">${value}</div>
                    <div class="stat-label">${label}</div>
                </div>
            `;
        }

        function renderMap() {
            return `
                <div class="driver-map-container">
                    <div class="map-title">
                        <i class="fas fa-map-markated-alt"></i> خريطة الرحلة
                    </div>
                    <div class="driver-map" id="driverMap"></div>
                </div>
            `;
        }

        // Trip Form Events
        function setupTripFormEvents() {
            document.getElementById('increasePassengers')?.addEventListener('click', increasePassengers);
            document.getElementById('decreasePassengers')?.addEventListener('click', decreasePassengers);
            document.getElementById('startTripBtn')?.addEventListener('click', startTrip);
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
            const display = document.getElementById('passengerCountDisplay');
            if (display) display.textContent = state.passengerCount;
        }

        // Trip Functions
        function startTrip() {
            const routeSelect = document.getElementById('routeSelect');
            const busSelect = document.getElementById('busSelect');
            
            if (!routeSelect.value || !busSelect.value) {
                alert('الرجاء اختيار المسار والحافلة قبل بدء الرحلة');
                return;
            }
            
            const routeName = routeSelect.options[routeSelect.selectedIndex].text;
            const busNumber = busSelect.value;
            
            state.isTripActive = true;
            state.currentTrip = {
                isActive: true,
                routeName: routeName,
                busNumber: busNumber,
                passengerCount: state.passengerCount,
                startTime: new Date().toLocaleTimeString(),
                startDate: new Date().toISOString()
            };
            
            saveTripToStorage();
            renderInterface();
            document.getElementById('endTripBtn')?.addEventListener('click', endTrip);
        }

        function endTrip() {
            if (!confirm('هل أنت متأكد من إنهاء الرحلة؟')) return;

            saveCompletedTrip();
            resetTripState();
            renderInterface();
            
            alert('تم إنهاء الرحلة بنجاح وتخزين بياناتها');
        }

        function saveTripToStorage() {
            localStorage.setItem('currentTrip', JSON.stringify(state.currentTrip));
        }

        function saveCompletedTrip() {
            const completedTrips = JSON.parse(localStorage.getItem('completedTrips')) || [];
            state.currentTrip.endTime = new Date().toLocaleTimeString();
            state.currentTrip.isActive = false;
            completedTrips.push(state.currentTrip);
            localStorage.setItem('completedTrips', JSON.stringify(completedTrips));
        }

        function resetTripState() {
            state.isTripActive = false;
            state.passengerCount = 0;
            state.currentTrip = null;
            localStorage.removeItem('currentTrip');
        }

        // Map Functions
        function createDriverMap() {
            const map = document.getElementById('driverMap');
            if (!map) return;

            createBusMarker(map);
            createStationMarkers(map);
            
            if (state.isTripActive) animateBus();
        }

        function createBusMarker(map) {
            const busMarker = document.createElement('div');
            busMarker.className = 'bus-marker';
            busMarker.title = 'موقع حافلتك';
            
            Object.assign(busMarker.style, {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '30px',
                height: '30px',
                background: 'var(--primary)',
                borderRadius: '50%',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
                border: '3px solid white'
            });
            
            busMarker.innerHTML = '<i class="fas fa-bus"></i>';
            map.appendChild(busMarker);
        }

        function createStationMarkers(map) {
            CONFIG.STATIONS.forEach(station => {
                const marker = document.createElement('div');
                marker.className = 'station-marker';
                marker.title = station.name;
                
                Object.assign(marker.style, {
                    position: 'absolute',
                    top: station.top,
                    left: station.left,
                    width: '12px',
                    height: '12px',
                    background: 'var(--warning)',
                    borderRadius: '50%',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    border: '2px solid white'
                });
                
                map.appendChild(marker);
            });
        }

        function animateBus() {
            const busMarker = document.querySelector('.bus-marker');
            if (!busMarker) return;
            
            let position = 0;
            setInterval(() => {
                position = (position + 0.5) % 100;
                busMarker.style.left = `${20 + position * 0.6}%`;
                busMarker.style.top = `${30 + Math.sin(position * 0.1) * 20}%`;
            }, 100);
        }

        // Initialize App
        document.addEventListener('DOMContentLoaded', function() {
            if (checkAuth()) {
                loadDriverInterface();
            }
        });