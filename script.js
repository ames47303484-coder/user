const DB_STUDENTS = 'edu_platform_students_v3';
const DB_LESSONS = 'edu_platform_lessons_v3';
const DB_ADS = 'edu_platform_ads_v3';

window.onload = () => {
    const savedUser = sessionStorage.getItem('loggedStudentUserV3');
    if (savedUser) {
        processLogin(savedUser);
    }
};

// ظهور الاسم تلقائياً وبشكل سحري عند كتابة اليوزر فقط
document.getElementById('loginUser').addEventListener('input', function() {
    const user = this.value.trim();
    const greetingDiv = document.getElementById('autoGreeting');
    
    if(user.length > 0) {
        const students = JSON.parse(localStorage.getItem(DB_STUDENTS)) || [];
        const foundStudent = students.find(s => s.username === user);
        
        if(foundStudent) {
            greetingDiv.innerHTML = `👋 أهلاً بك يا بطل: <br> <span style="font-size:20px;">${foundStudent.fullName}</span>`;
            greetingDiv.style.display = 'block';
        } else {
            greetingDiv.style.display = 'none';
        }
    } else {
        greetingDiv.style.display = 'none';
    }
});

// تسجيل الدخول باليوزر فقط
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    processLogin(user);
});

// معالجة الدخول وحساب الأيام
function processLogin(username) {
    const errorMsg = document.getElementById('loginError');
    const students = JSON.parse(localStorage.getItem(DB_STUDENTS)) || [];
    const validStudent = students.find(s => s.username === username);

    if (validStudent) {
        // حساب عدد الأيام المتبقية بناءً على الوقت المسجل
        const remainingDays = Math.ceil((validStudent.endDate - Date.now()) / (1000 * 60 * 60 * 24));
        
        sessionStorage.setItem('loggedStudentUserV3', validStudent.username);
        showApp(validStudent, remainingDays);
    } else {
        errorMsg.innerHTML = "❌ هذا اليوزر غير صحيح أو غير مسجل.";
        errorMsg.style.display = "block";
    }
}

// عرض واجهة التطبيق
function showApp(studentData, daysLeft) {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('appScreen').classList.add('active');
    
    // طباعة الاسم الحقيقي وعداد الأيام في الهيدر
    document.getElementById('welcomeMsg').innerText = studentData.fullName;
    
    const badge = document.getElementById('daysBadge');
    
    if(daysLeft > 0) {
        badge.innerText = `⏳ متبقي ${daysLeft} يوم`;
        if(daysLeft <= 3) badge.classList.add('warning'); // لون أحمر إذا قارب على الانتهاء
        else badge.classList.remove('warning');
    } else {
        badge.innerText = `❌ اشتراكك منتهي`;
        badge.classList.add('warning');
    }

    // جلب الدروس (مع إرسال حالة الاشتراك لمعرفة هل نفتح الدروس أم نقفلها)
    loadLessons(daysLeft > 0);
    // جلب الإعلانات
    loadAds();
}

// تسجيل الخروج
window.logout = function() {
    sessionStorage.removeItem('loggedStudentUserV3');
    closeVideo();
    document.getElementById('appScreen').classList.remove('active');
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('loginForm').reset();
    document.getElementById('autoGreeting').style.display = 'none';
    document.getElementById('loginError').style.display = 'none';
}

// التبديل السلس بين الدروس والإعلانات من الشريط السفلي
window.switchAppTab = function(tabId, element) {
    document.querySelectorAll('.app-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');
}

// جلب وعرض الدروس
function loadLessons(hasSubscription) {
    const lessons = JSON.parse(localStorage.getItem(DB_LESSONS)) || [];
    const container = document.getElementById('lessonsContainer');
    container.innerHTML = '';

    // إذا انتهى اشتراكه، يتم إخفاء الدروس وإظهار رسالة تنبيه
    if (!hasSubscription) {
        container.innerHTML = `
        <div style="text-align:center; padding: 40px 20px; background:white; border-radius:20px; color:#e74c3c; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <div style="font-size:50px; margin-bottom:10px;">🔒</div>
            <p style="font-weight:bold; font-size:18px;">عفواً، لقد انتهى اشتراكك!</p>
            <p style="font-size:14px; margin-top:5px; color:#7f8c8d;">يرجى مراجعة المعلم لتجديد الاشتراك لتتمكن من مشاهدة الدروس.</p>
        </div>`;
        return;
    }

    if (lessons.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 40px 20px; color:#888;"><div style="font-size:50px;">📭</div><p style="font-weight:bold; margin-top:10px;">لا توجد دروس حالياً.</p></div>`;
        return;
    }

    const grouped = {};
    lessons.forEach(l => {
        const groupKey = `${l.section} - ${l.subject}`;
        if (!grouped[groupKey]) grouped[groupKey] = [];
        grouped[groupKey].push(l);
    });

    for (let group in grouped) {
        let sectionHtml = `<div class="section-card"><div class="section-title">📁 ${group}</div>`;
        grouped[group].forEach(l => {
            sectionHtml += `
                <div class="lesson-item" onclick="openVideo('${l.title}', '${l.videoUrl}')">
                    <div class="lesson-icon">▶</div>
                    <div class="lesson-info">
                        <h4>${l.title}</h4>
                        <p>اضغط للمشاهدة الآن</p>
                    </div>
                </div>`;
        });
        sectionHtml += `</div>`;
        container.innerHTML += sectionHtml;
    }
}

// جلب وعرض الإعلانات
function loadAds() {
    const ads = JSON.parse(localStorage.getItem(DB_ADS)) || [];
    const container = document.getElementById('adsContainer');
    container.innerHTML = '';

    if (ads.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 40px 20px; color:#888;"><div style="font-size:50px;">🔕</div><p style="font-weight:bold; margin-top:10px;">لا توجد إعلانات من الإدارة.</p></div>`;
        return;
    }

    ads.forEach(a => {
        container.innerHTML += `
        <div class="ad-item">
            <div class="ad-title">📢 ${a.title}</div>
            <div class="ad-date">📅 ${a.date}</div>
            <div class="ad-text">${a.text}</div>
        </div>`;
    });
}

// فتح وإغلاق الفيديو
window.openVideo = function(title, url) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('videoPlayer').src = url;
    document.getElementById('videoModal').classList.add('active');
}

window.closeVideo = function() {
    document.getElementById('videoPlayer').src = "";
    document.getElementById('videoModal').classList.remove('active');
}
