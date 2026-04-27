import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8iDHs1GcZYBZSCbF1GjMgR63jILrFNcU",
  authDomain: "hgglg-5947a.firebaseapp.com",
  projectId: "hgglg-5947a",
  storageBucket: "hgglg-5947a.firebasestorage.app",
  messagingSenderId: "31328681718",
  appId: "1:31328681718:web:2fac4b4d406120eda8f6d7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DB_STUDENTS = 'edu_platform_students_v3';
const DB_SECTIONS = 'edu_platform_sections_v3';
const DB_LESSONS = 'edu_platform_lessons_v3';
const DB_ADS = 'edu_platform_ads_v3';

window.onload = async () => {
    sessionStorage.removeItem('loggedStudentUserV3');
    localStorage.removeItem('loggedStudentUserV3');
    
    try {
        const fetchDoc = async (key) => {
            const snap = await getDoc(doc(db, "storage", key));
            return snap.exists() ? snap.data().data : [];
        };
        const students = await fetchDoc(DB_STUDENTS);    
        const sections = await fetchDoc(DB_SECTIONS);    
        const lessons = await fetchDoc(DB_LESSONS);    
        const ads = await fetchDoc(DB_ADS);
        
        localStorage.setItem(DB_STUDENTS, JSON.stringify(students));
        localStorage.setItem(DB_SECTIONS, JSON.stringify(sections));
        localStorage.setItem(DB_LESSONS, JSON.stringify(lessons));
        localStorage.setItem(DB_ADS, JSON.stringify(ads));
    } catch(e) { console.error("Firebase Load Error:", e); }

    setTimeout(() => showInstallPrompt(), 2000);
};

// Global PWA prompt logic
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

window.showInstallPrompt = function() {
    if (!localStorage.getItem('pwa_prompt_shown_user')) {
        const installModal = document.createElement('div');
        installModal.id = 'installPwaModal';
        installModal.innerHTML = `
            <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); z-index: 9999; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.5s;">
                <div class="3d-card" style="background: white; width: 90%; max-width: 350px; border-radius: 20px; padding: 30px 20px; text-align: center; position: relative;">
                    <div style="font-size: 50px; margin-bottom: 15px; animation: popBounce 0.5s;">📱</div>
                    <h3 style="font-size: 22px; color: #1e3c72; margin-bottom: 10px; font-weight: 900;">حمل التطبيق للوصول السريع!</h3>
                    <p style="color: #7f8c8d; font-size: 15px; font-weight: 600; margin-bottom: 25px;">حمل التطبيق ليكون الاستخدام سلس ومباشر وأسهل عليك في المرات القادمة.</p>
                    <button id="btnPwaInstall" style="width: 100%; padding: 14px; background: #6a11cb; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 5px 15px rgba(106, 17, 203, 0.4); margin-bottom: 10px;">تحميل التطبيق</button>
                    <button id="btnPwaClose" style="width: 100%; padding: 12px; background: transparent; color: #7f8c8d; border: none; font-size: 14px; font-weight: 700; cursor: pointer;">تخطي الآن</button>
                </div>
            </div>
        `;
        document.body.appendChild(installModal);
        
        document.getElementById('btnPwaInstall').onclick = async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    deferredPrompt = null;
                }
            } else {
                alert('الرجاء الإضافة إلى الشاشة الرئيسية (Add to Home Screen) من خلال إعدادات المتصفح.');
            }
            document.body.removeChild(installModal);
            localStorage.setItem('pwa_prompt_shown_user', 'true');
        };
        
        document.getElementById('btnPwaClose').onclick = () => {
            document.body.removeChild(installModal);
            localStorage.setItem('pwa_prompt_shown_user', 'true');
        };
    }
}


// Auto format input to handle spacing
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

// Submit login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    processLogin(user);
});

// Process
function processLogin(username) {
    const errorMsg = document.getElementById('loginError');
    const students = JSON.parse(localStorage.getItem(DB_STUDENTS)) || [];
    const validStudent = students.find(s => s.username === username);

    if (validStudent) {
        const remainingDays = Math.ceil((validStudent.endDate - Date.now()) / (1000 * 60 * 60 * 24));
        
        sessionStorage.setItem('loggedStudentUserV3', validStudent.username);
        showApp(validStudent, remainingDays);
    } else {
        errorMsg.innerHTML = "❌ هذا اليوزر غير صحيح أو غير مسجل.";
        errorMsg.style.display = "block";
    }
}

// Show App Interface
function showApp(studentData, daysLeft) {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('appScreen').classList.add('active');
    
    document.getElementById('welcomeMsg').innerText = studentData.fullName;
    
    const badge = document.getElementById('daysBadge');
    
    if(daysLeft > 0) {
        badge.innerText = `⏳ متبقي ${daysLeft} يوم`;
        if(daysLeft <= 3) badge.classList.add('warning'); 
        else badge.classList.remove('warning');
    } else {
        badge.innerText = `❌ اشتراكك منتهي`;
        badge.classList.add('warning');
    }

    loadLessons(daysLeft > 0);
    loadAds();
}

window.logout = function() {
    sessionStorage.removeItem('loggedStudentUserV3');
    closeVideo();
    document.getElementById('appScreen').classList.remove('active');
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('loginForm').reset();
    document.getElementById('autoGreeting').style.display = 'none';
    document.getElementById('loginError').style.display = 'none';
}

window.switchAppTab = function(tabId, element) {
    document.querySelectorAll('.app-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');
}

// Load Lessons
// Get Thumbnail from YouTube embed URL
function getThumbnail(embedUrl) {
    if (embedUrl && embedUrl.includes("embed/")) {
        let videoId = embedUrl.split("embed/")[1].split("?")[0];
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return 'https://via.placeholder.com/100x70?text=Video';
}

window.showSections = function() {
    document.getElementById('lessonsListContainer').style.display = 'none';
    document.getElementById('sectionsContainer').style.display = 'block';
    
    const searchWrapper = document.getElementById('sectionSearchContainer');
    if(searchWrapper) searchWrapper.style.display = 'block';
    
    const backBtn = document.getElementById('backToSectionsBtn');
    if(backBtn) backBtn.style.display = 'none';
    const title = document.getElementById('lessonsPageTitle');
    if(title) title.innerText = 'الاقسام 🗂️';
}

window.showLessonsForSection = function(sectionId, sectionName) {
    document.getElementById('sectionsContainer').style.display = 'none';
    document.getElementById('lessonsListContainer').style.display = 'block';
    
    const searchWrapper = document.getElementById('sectionSearchContainer');
    if(searchWrapper) searchWrapper.style.display = 'none';
    
    const backBtn = document.getElementById('backToSectionsBtn');
    if(backBtn) backBtn.style.display = 'block';
    
    const title = document.getElementById('lessonsPageTitle');
    if(title) title.innerText = sectionName + ' 📚';
    
    const lessons = JSON.parse(localStorage.getItem(DB_LESSONS)) || [];
    const sections = JSON.parse(localStorage.getItem(DB_SECTIONS)) || [];
    
    const sectionLessons = lessons.filter(l => {
        const sec = sections.find(s => s.id == l.sectionId) || sections.find(s => s.name === l.section);
        const lSecId = sec ? sec.id.toString() : 'others';
        return lSecId === sectionId;
    });
    
    const container = document.getElementById('lessonsListContainer');
    container.innerHTML = '';
    
    if (sectionLessons.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 40px 20px; color:#1e3c72;"><div style="font-size:60px;">📭</div><p style="font-weight:900; margin-top:10px; font-size:20px;">لا توجد دروس في هذا القسم.</p></div>`;
        return;
    }
    
    sectionLessons.forEach(l => {
        const thumbUrl = getThumbnail(l.videoUrl);
        container.innerHTML += `
            <div class="video-lesson-card" onclick="openVideo('${l.title}', '${l.videoUrl}')">
                <div class="lesson-thumb" style="background-image: url('${thumbUrl}');">
                    <div class="play-overlay">▶</div>
                </div>
                <div class="lesson-info">
                    <h4>${l.title}</h4>
                    <p>اضغط للمشاهدة الآن</p>
                </div>
            </div>`;
    });
}

window.filterSections = function() {
    const input = document.getElementById('sectionSearchInput');
    if(!input) return;
    const filter = input.value.toLowerCase();
    const sectionCards = document.querySelectorAll('#sectionsContainer .section-card');
    
    sectionCards.forEach(card => {
        const h3 = card.querySelector('h3');
        if (h3) {
            const txtValue = h3.textContent || h3.innerText;
            if (txtValue.toLowerCase().indexOf(filter) > -1) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        }
    });
}

// Load Sections
function loadLessons(hasSubscription) {
    const sections = JSON.parse(localStorage.getItem(DB_SECTIONS)) || [];
    const lessons = JSON.parse(localStorage.getItem(DB_LESSONS)) || [];
    
    const container = document.getElementById('sectionsContainer');
    if(!container) return; // Prevent error if called before DOM updates
    
    document.getElementById('lessonsListContainer').style.display = 'none';
    container.style.display = 'block';
    
    const searchWrapper = document.getElementById('sectionSearchContainer');
    if(searchWrapper) searchWrapper.style.display = 'block';
    
    const backBtn = document.getElementById('backToSectionsBtn');
    if(backBtn) backBtn.style.display = 'none';
    const title = document.getElementById('lessonsPageTitle');
    if(title) title.innerText = 'الاقسام 🗂️';

    container.innerHTML = '';

    if (!hasSubscription) {
        container.innerHTML = `
        <div style="text-align:center; padding: 40px 20px; background:rgba(255,255,255,0.7); backdrop-filter:blur(10px); border-radius:24px; color:#c0392b; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border:1px solid rgba(255,255,255,0.8);">
            <div style="font-size:60px; margin-bottom:10px; filter:drop-shadow(0 5px 5px rgba(0,0,0,0.1));">🔒</div>
            <p style="font-weight:900; font-size:20px;">عفواً، لقد انتهى اشتراكك!</p>
            <p style="font-size:15px; margin-top:5px; color:#34495e; font-weight:700;">يرجى مراجعة المعلم لتجديد الاشتراك لتتمكن من مشاهدة الدروس.</p>
        </div>`;
        return;
    }

    if (sections.length === 0 && lessons.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 40px 20px; color:#1e3c72;"><div style="font-size:60px;">📭</div><p style="font-weight:900; margin-top:10px; font-size:20px;">لا توجد أقسام حالياً.</p></div>`;
        return;
    }

    const grouped = {};
    lessons.forEach(l => {
        const sec = sections.find(s => s.id == l.sectionId) || sections.find(s => s.name === l.section);
        const secId = sec ? sec.id.toString() : 'others';
        const groupKey = sec ? sec.name : (l.section || 'أخرى');
        if (!grouped[secId]) grouped[secId] = { name: groupKey, count: 0 };
        grouped[secId].count++;
    });

    let sectionsHtml = '';
    for (const [secId, data] of Object.entries(grouped)) {
        sectionsHtml += `
            <div class="section-card" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;" onclick="showLessonsForSection('${secId}', '${data.name}')">
                <div>
                   <h3 style="font-size: 20px; font-weight: 900; color: #1e3c72; margin-bottom: 5px;">🗂️ ${data.name}</h3>
                   <p style="color: #636e72; font-size: 14px; font-weight: 600;">يحتوي على ${data.count} درس</p>
                </div>
                <div style="font-size: 24px; color: #1e3c72; opacity: 0.6;">⬅️</div>
            </div>
        `;
    }
    
    if(!sectionsHtml && sections.length > 0) {
        // Show empty sections
        sections.forEach(s => {
            sectionsHtml += `
            <div class="section-card" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;" onclick="showLessonsForSection('${s.id}', '${s.name}')">
                <div>
                   <h3 style="font-size: 20px; font-weight: 900; color: #1e3c72; margin-bottom: 5px;">🗂️ ${s.name}</h3>
                   <p style="color: #636e72; font-size: 14px; font-weight: 600;">لا توجد دروس بعد</p>
                </div>
                <div style="font-size: 24px; color: #1e3c72; opacity: 0.6;">⬅️</div>
            </div>
            `;
        });
    }

    container.innerHTML = sectionsHtml || `<div style="text-align:center; padding: 40px 20px; color:#1e3c72;"><div style="font-size:60px;">📭</div><p style="font-weight:900; margin-top:10px; font-size:20px;">لا توجد أقسام حالياً.</p></div>`;
}

// Load Ads
function loadAds() {
    const ads = JSON.parse(localStorage.getItem(DB_ADS)) || [];
    const container = document.getElementById('adsContainer');
    container.innerHTML = '';

    if (ads.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 40px 20px; color:#1e3c72;"><div style="font-size:60px;">🔕</div><p style="font-weight:900; margin-top:10px; font-size:20px;">لا توجد إعلانات من الإدارة.</p></div>`;
        return;
    }

    ads.forEach(a => {
        container.innerHTML += `
        <div class="ad-item">
            <div class="ad-title">📢 ${a.title}</div>
            <div class="ad-date">📅 ${a.date}</div>
            <div class="ad-text">${a.text || a.content}</div>
        </div>`;
    });
}

// Video Modal
window.openVideo = function(title, url) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('videoPlayer').src = url;
    document.getElementById('videoModal').classList.add('active');
}

window.closeVideo = function() {
    document.getElementById('videoPlayer').src = "";
    document.getElementById('videoModal').classList.remove('active');
}
