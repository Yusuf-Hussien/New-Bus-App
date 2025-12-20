// profile.js - ملف الدوال الجديدة للتعديلات

// ============================================
// Toast Notification System
// ============================================

function showToast(message, type = 'success', title = '', duration = 5000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.id = toastId;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    const defaultTitles = {
        success: 'تم بنجاح',
        error: 'خطأ',
        warning: 'تحذير',
        info: 'معلومة'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="${icons[type] || icons.success}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title || defaultTitles[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="removeToast('${toastId}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after duration
    setTimeout(() => {
        removeToast(toastId);
    }, duration);
}

function removeToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

// ============================================
// Profile Data Management
// ============================================

function getProfileData() {
    try {
        // محاولة قراءة البيانات من localStorage
        const user = JSON.parse(localStorage.getItem('currentUser')) || {};
        const savedProfile = JSON.parse(localStorage.getItem('driverProfile')) || {};
        
        // البيانات الأساسية الافتراضية
        const defaultProfile = {
            firstName: 'أحمد',
            secondName: 'محمد',
            thirdName: 'علي',
            lastName: 'حسن',
            email: 'driver@newbus.com',
            phone: '+201012345678',
            userName: 'driver_ahmed',
            plateNoBus: 'أ ط ب 1234',
            createdByAdminName: 'مدير النظام'
        };
        
        // دمج البيانات: الأولوية للبيانات المحفوظة، ثم بيانات المستخدم، ثم الافتراضية
        const mergedProfile = {
            ...defaultProfile,
            ...user,
            ...savedProfile
        };
        
        // التأكد من وجود الاسم الكامل
        if (!mergedProfile.fullName && mergedProfile.firstName && mergedProfile.lastName) {
            mergedProfile.fullName = `${mergedProfile.firstName} ${mergedProfile.lastName}`;
        }
        
        return mergedProfile;
    } catch (error) {
        console.error('Error getting profile data:', error);
        return {
            firstName: 'أحمد',
            secondName: 'محمد',
            thirdName: 'علي',
            lastName: 'حسن',
            fullName: 'أحمد حسن',
            email: 'driver@newbus.com',
            phone: '+201012345678',
            userName: 'driver_ahmed',
            plateNoBus: 'أ ط ب 1234',
            createdByAdminName: 'مدير النظام'
        };
    }
}

function saveProfileData(profileData) {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser')) || {};
        
        // حفظ البيانات في localStorage تحت مفتاحين مختلفين
        localStorage.setItem('driverProfile', JSON.stringify(profileData));
        
        // تحديث currentUser أيضاً
        const updatedUser = {
            ...user,
            firstName: profileData.firstName,
            secondName: profileData.secondName,
            thirdName: profileData.thirdName,
            lastName: profileData.lastName,
            email: profileData.email,
            phone: profileData.phone,
            userName: profileData.userName,
            plateNoBus: profileData.plateNoBus,
            createdByAdminName: profileData.createdByAdminName,
            name: `${profileData.firstName} ${profileData.lastName}`
        };
        
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // تحديث state
        if (window.state && window.state.currentUser) {
            window.state.currentUser = updatedUser;
        }
        
        // تحديث واجهة المستخدم
        updateUserInfo();
        
        console.log('تم حفظ البروفايل بنجاح:', profileData);
        
        return updatedUser;
    } catch (error) {
        console.error('خطأ في حفظ البروفايل:', error);
        showToast('حدث خطأ في حفظ البيانات', 'error', 'خطأ');
        return null;
    }
}

function updateUserInfo() {
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        const profile = getProfileData();
        userNameElement.textContent = profile.firstName || 'السائق';
    }
}

// ============================================
// Trip Completion System
// ============================================

window.tripCompletionStatus = JSON.parse(localStorage.getItem('tripCompletionStatus')) || {
    isCompleted: false,
    lastUpdated: null,
    currentTripId: null
};

function toggleTripCompletion() {
    window.tripCompletionStatus.isCompleted = !window.tripCompletionStatus.isCompleted;
    window.tripCompletionStatus.lastUpdated = new Date().toISOString();
    window.tripCompletionStatus.currentTripId = `TRIP-${Date.now()}`;
    
    localStorage.setItem('tripCompletionStatus', JSON.stringify(window.tripCompletionStatus));
    
    const message = window.tripCompletionStatus.isCompleted 
        ? 'تم تعليم الرحلة كمكتملة بنجاح'
        : 'تم تعليم الرحلة كغير مكتملة (الحافلة ممتلئة)';
    
    showToast(message, 'success', 'حالة الرحلة');
    
    // Update button in UI if exists
    updateCompleteTripButton();
    
    return window.tripCompletionStatus;
}

function updateCompleteTripButton() {
    const button = document.querySelector('.complete-trip-btn');
    if (button) {
        if (window.tripCompletionStatus.isCompleted) {
            button.classList.remove('incomplete');
            button.innerHTML = '<i class="fas fa-check-circle"></i> الرحلة مكتملة';
        } else {
            button.classList.add('incomplete');
            button.innerHTML = '<i class="fas fa-times-circle"></i> الرحلة غير مكتملة (الحافلة ممتلئة)';
        }
    }
}

// ============================================
// Modal System
// ============================================

function showModal(modalHtml) {
    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) return;
    
    modalContainer.innerHTML = modalHtml;
    
    // Add event listener for close button
    const closeBtn = modalContainer.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside
    const overlay = modalContainer.querySelector('.modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeModal();
            }
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function closeModal() {
    const modalContainer = document.getElementById('modalContainer');
    if (modalContainer) {
        modalContainer.innerHTML = '';
    }
    
    document.removeEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });
}

// ============================================
// View Profile Modal
// ============================================

function showProfileModal() {
    const profile = getProfileData();
    
    const modalHtml = `
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title">
                        <i class="fas fa-id-card"></i> عرض البروفايل
                    </div>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="profile-info">
                        <div class="info-item">
                            <span class="info-label">الاسم الأول</span>
                            <span class="info-value">${profile.firstName}</span>
                        </div>
                        
                        <div class="info-item">
                            <span class="info-label">اسم الأب</span>
                            <span class="info-value">${profile.secondName}</span>
                        </div>
                        
                        <div class="info-item">
                            <span class="info-label">اسم الجد</span>
                            <span class="info-value">${profile.thirdName}</span>
                        </div>
                        
                        <div class="info-item">
                            <span class="info-label">الاسم الأخير</span>
                            <span class="info-value">${profile.lastName}</span>
                        </div>
                        
                        <div class="info-item">
                            <span class="info-label">الاسم الكامل</span>
                            <span class="info-value">${profile.fullName}</span>
                        </div>
                        
                        <div class="info-item">
                            <span class="info-label">البريد الإلكتروني</span>
                            <span class="info-value">${profile.email}</span>
                        </div>
                        
                        <div class="info-item">
                            <span class="info-label">رقم الهاتف</span>
                            <span class="info-value">${profile.phone}</span>
                        </div>
                        
                        <div class="info-item">
                            <span class="info-label">اسم المستخدم</span>
                            <span class="info-value">${profile.userName}</span>
                        </div>
                        
                        <div class="info-item">
                            <span class="info-label">رقم لوحة الحافلة</span>
                            <span class="info-value">${profile.plateNoBus}</span>
                        </div>
                        
                        <div class="info-item">
                            <span class="info-label">أنشئ بواسطة</span>
                            <span class="info-value">${profile.createdByAdminName}</span>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">
                        <i class="fas fa-times"></i> إغلاق
                    </button>
                    <button class="btn btn-primary" onclick="showUpdateProfileModal()">
                        <i class="fas fa-edit"></i> تحديث البيانات
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showModal(modalHtml);
}

// ============================================
// Update Profile Modal
// ============================================

function showUpdateProfileModal() {
    const profile = getProfileData();
    
    const modalHtml = `
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title">
                        <i class="fas fa-user-edit"></i> تحديث البروفايل
                    </div>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <form id="updateProfileForm" class="update-form">
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">الاسم الأول *</label>
                                <input type="text" class="form-control" id="firstName" 
                                       value="${profile.firstName}" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">اسم الأب *</label>
                                <input type="text" class="form-control" id="secondName" 
                                       value="${profile.secondName}" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">اسم الجد *</label>
                                <input type="text" class="form-control" id="thirdName" 
                                       value="${profile.thirdName}" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">الاسم الأخير *</label>
                                <input type="text" class="form-control" id="lastName" 
                                       value="${profile.lastName}" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">البريد الإلكتروني *</label>
                            <input type="email" class="form-control" id="email" 
                                   value="${profile.email}" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">رقم الهاتف *</label>
                            <input type="tel" class="form-control" id="phone" 
                                   value="${profile.phone}" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">اسم المستخدم *</label>
                            <input type="text" class="form-control" id="userName" 
                                   value="${profile.userName}" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">رقم لوحة الحافلة *</label>
                            <input type="text" class="form-control" id="plateNoBus" 
                                   value="${profile.plateNoBus}" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">أنشئ بواسطة</label>
                            <input type="text" class="form-control" id="createdByAdminName" 
                                   value="${profile.createdByAdminName}">
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="closeModal()">
                                <i class="fas fa-times"></i> إلغاء
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> حفظ التغييرات
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    showModal(modalHtml);
    
    // Add form validation and submission
    const form = document.getElementById('updateProfileForm');
    if (form) {
        form.addEventListener('submit', handleUpdateProfile);
    }
}

function handleUpdateProfile(e) {
    e.preventDefault();
    
    // Form validation
    const firstName = document.getElementById('firstName').value.trim();
    const secondName = document.getElementById('secondName').value.trim();
    const thirdName = document.getElementById('thirdName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const userName = document.getElementById('userName').value.trim();
    const plateNoBus = document.getElementById('plateNoBus').value.trim();
    const createdByAdminName = document.getElementById('createdByAdminName').value.trim();
    
    // Check required fields
    const requiredFields = [
        { field: firstName, name: 'الاسم الأول' },
        { field: secondName, name: 'اسم الأب' },
        { field: thirdName, name: 'اسم الجد' },
        { field: lastName, name: 'الاسم الأخير' },
        { field: email, name: 'البريد الإلكتروني' },
        { field: phone, name: 'رقم الهاتف' },
        { field: userName, name: 'اسم المستخدم' },
        { field: plateNoBus, name: 'رقم لوحة الحافلة' }
    ];
    
    for (const field of requiredFields) {
        if (!field.field) {
            showToast(`حقل ${field.name} مطلوب`, 'error', 'بيانات ناقصة');
            return;
        }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('البريد الإلكتروني غير صحيح', 'error', 'خطأ في البيانات');
        return;
    }
    
    // Phone validation (Egyptian numbers)
    const phoneRegex = /^(?:\+201|01)[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
        showToast('رقم الهاتف غير صحيح. يجب أن يكون بصيغة مصرية مثل 01012345678 أو +201012345678', 'error', 'رقم هاتف غير صحيح');
        return;
    }
    
    // Prepare profile data
    const profileData = {
        firstName,
        secondName,
        thirdName,
        lastName,
        email,
        phone,
        userName,
        plateNoBus,
        createdByAdminName: createdByAdminName || 'مدير النظام',
        fullName: `${firstName} ${lastName}`,
        lastUpdated: new Date().toISOString()
    };
    
    // Save to localStorage
    const saved = saveProfileData(profileData);
    
    if (saved) {
        // Show success message
        showToast('تم تحديث بيانات البروفايل بنجاح', 'success', 'تم التحديث');
        
        // Close modal after delay
        setTimeout(() => {
            closeModal();
        }, 1500);
    } else {
        showToast('حدث خطأ في حفظ البيانات', 'error', 'خطأ');
    }
}

// ============================================
// Setup Floating Button for Mobile
// ============================================

function setupFloatingButton() {
    const floatingBtn = document.querySelector('.floating-update-btn');
    if (!floatingBtn) return;
    
    // Show/hide based on screen size
    function updateFloatingButton() {
        if (window.innerWidth < 992) {
            floatingBtn.style.display = 'flex';
        } else {
            floatingBtn.style.display = 'none';
        }
    }
    
    // Initial check
    updateFloatingButton();
    
    // Update on resize
    window.addEventListener('resize', updateFloatingButton);
}

// ============================================
// Initialize Profile Features
// ============================================

function initializeProfileFeatures() {
    // Update user info
    updateUserInfo();
    
    // Update trip completion button
    updateCompleteTripButton();
    
    // Setup floating button visibility
    setupFloatingButton();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for existing app to initialize
    setTimeout(() => {
        initializeProfileFeatures();
    }, 100);
});