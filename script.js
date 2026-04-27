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
    } catch(e) { console.error("Load Err", e); }
};

// ====== منطق تثبيت التطبيق (PWA) للطالب ======
window.showInstallPrompt = function() {
    const isDismissed = localStorage.getItem('pwa_prompt_dismissed_user'); 
    if (isDismissed === 'true') return;
    if (document.getElementById('installPwaModal')) return;

    const installModal = document.createElement('div');
    installModal.id = 'installPwaModal';
    installModal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); z-index: 9999; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s;">
            <div class="3d-card" style="background: white; width: 90%; max-width: 350px; border-radius: 20px; padding: 30px 20px; text-align: center;">
                <div style="font-size: 50px; margin-bottom: 15px;">🚀</div>
                <h3 style="font-size: 22px; color: #1e3c72; margin-bottom: 10px; font-weight: 900;">ثبت المنصة الآن!</h3>
                <p style="color: #7f8c8d; font-size: 15px; margin-bottom: 25px;">ثبت التطبيق لتصل لدروسك بضغطة واحدة وبسرعة عالية.</p>
                <button id="btnPwaInstall" style="width: 100%; padding: 14px; background: #2a5298; color: white; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; margin-bottom: 10px; box-shadow: 0 5px 15px rgba(42, 82, 152, 0.4);">تثبيت التطبيق</button>
                <button id="btnPwaClose" style="width: 100%; padding: 12px; background: transparent; color: #7f8c8d; border: none; font-weight: 700; cursor: pointer;">ليس الآن</button>
            </div>
        </div>
    `;
    document.body.appendChild(installModal);
    
    document.getElementById('btnPwaInstall').onclick = async () => {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            const { outcome } = await window.deferredPrompt.userChoice;
            if (outcome === 'accepted') window.deferredPrompt = null;
        }
        document.body.removeChild(installModal);
    };
    
    document.getElementById('btnPwaClose').onclick = () => {
        document.body.removeChild(installModal);
        localStorage.setItem('pwa_prompt_dismissed_user', 'true');
    };
}
if (window.deferredPrompt) window.showInstallPrompt();
// ===========================================

document.getElementById('loginUser').addEventListener('input', function() {
    const user = this.value.trim();
    const greetingDiv = document.getElementById('autoGreeting');
    if(user.length > 0) {
        const students = JSON.parse(localStorage.getItem(DB_STUDENTS)) || [];
        const found = students.find(s => s.username === user);
        if(found) {
            greetingDiv.innerHTML = `👋 أهلاً بك يا بطل: <br> <span style="font-size:20px;">${found.fullName}</span>`;
            greetingDiv.style.display = 'block';
        } else { greetingDiv.style.display = 'none'; }
    } else { greetingDiv.style.display = 'none'; }
});

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const students = JSON.parse(localStorage.getItem(DB_STUDENTS)) || [];
    const valid = students.find(s => s.username === user);
    if (valid) {
        const days = Math.ceil((valid.endDate - Date.now()) / (1000 * 60 * 60 * 24));
        sessionStorage.setItem('loggedStudentUserV3', valid.username);
        showApp(valid, days);
    } else {
        const err = document.getElementById('loginError');
        err.innerHTML = "❌ يوزر غير صحيح.";
        err.style.display = "block";
    }
});

function showApp(studentData, daysLeft) {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('appScreen').classList.add('active');
    document.getElementById('welcomeMsg').innerText = studentData.fullName;
    const badge = document.getElementById('daysBadge');
    if(daysLeft > 0) {
        badge.innerText = `⏳ متبقي ${daysLeft} يوم`;
        if(daysLeft <= 3) badge.classList.add('warning');
    } else {
        badge.innerText = `❌ اشتراك منتهي`; badge.classList.add('warning');
    }
    loadLessons(daysLeft > 0); loadAds();
}

window.logout = function() {
    sessionStorage.removeItem('loggedStudentUserV3');
    closeVideo();
    document.getElementById('appScreen').classList.remove('active');
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('loginForm').reset();
    document.getElementById('autoGreeting').style.display = 'none';
}

window.switchAppTab = function(tabId, element) {
    document.querySelectorAll('.app-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');
}

function getThumbnail(embedUrl) {
    if (embedUrl && embedUrl.includes("embed/")) {
        let id = embedUrl.split("embed/")[1].split("?")[0];
        return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    return 'https://via.placeholder.com/100x70';
}

window.showSections = function() {
    document.getElementById('lessonsListContainer').style.display = 'none';
    document.getElementById('sectionsContainer').style.display = 'block';
    document.getElementById('sectionSearchContainer').style.display = 'block';
    document.getElementById('backToSectionsBtn').style.display = 'none';
    document.getElementById('lessonsPageTitle').innerText = 'الاقسام 🗂️';
}

window.showLessonsForSection = function(sectionId, sectionName) {
    document.getElementById('sectionsContainer').style.display = 'none';
    document.getElementById('lessonsListContainer').style.display = 'block';
    document.getElementById('sectionSearchContainer').style.display = 'none';
    document.getElementById('backToSectionsBtn').style.display = 'block';
    document.getElementById('lessonsPageTitle').innerText = sectionName + ' 📚';
    const lessons = JSON.parse(localStorage.getItem(DB_LESSONS)) || [];
    const container = document.getElementById('lessonsListContainer');
    container.innerHTML = '';
    const filtered = lessons.filter(l => l.sectionId == sectionId);
    if (!filtered.length) { container.innerHTML = '<div style="text-align:center; padding: 40px 20px; color:#1e3c72;"><div style="font-size:60px;">📭</div><p style="font-weight:900; margin-top:10px; font-size:20px;">لا توجد دروس في هذا القسم.</p></div>'; return; }
    filtered.forEach(l => {
        container.innerHTML += `<div class="video-lesson-card" onclick="openVideo('${l.title}', '${l.videoUrl}')">
            <div class="lesson-thumb" style="background-image: url('${getThumbnail(l.videoUrl)}');"><div class="play-overlay">▶</div></div>
            <div class="lesson-info"><h4>${l.title}</h4><p>مشاهدة الآن</p></div>
        </div>`;
    });
}

function loadLessons(hasSubscription) {
    const sections = JSON.parse(localStorage.getItem(DB_SECTIONS)) || [];
    const lessons = JSON.parse(localStorage.getItem(DB_LESSONS)) || [];
    const container = document.getElementById('sectionsContainer');
    if (!hasSubscription) { container.innerHTML = '<div style="text-align:center; padding: 40px 20px; background:rgba(255,255,255,0.7); backdrop-filter:blur(10px); border-radius:24px; color:#c0392b; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border:1px solid rgba(255,255,255,0.8);"><div style="font-size:60px; margin-bottom:10px; filter:drop-shadow(0 5px 5px rgba(0,0,0,0.1));">🔒</div><p style="font-weight:900; font-size:20px;">عفواً، لقد انتهى اشتراكك!</p><p style="font-size:15px; margin-top:5px; color:#34495e; font-weight:700;">يرجى مراجعة المعلم لتجديد الاشتراك لتتمكن من مشاهدة الدروس.</p></div>'; return; }
    if (!sections.length) { container.innerHTML = '<div style="text-align:center; padding: 40px 20px; color:#1e3c72;"><div style="font-size:60px;">📭</div><p style="font-weight:900; margin-top:10px; font-size:20px;">لا توجد أقسام حالياً.</p></div>'; return; }
    container.innerHTML = sections.map(s => `
        <div class="section-card" style="cursor:pointer; display:flex; align-items:center; justify-content:space-between;" onclick="showLessonsForSection('${s.id}', '${s.name}')">
            <div><h3 style="font-size: 20px; font-weight: 900; color: #1e3c72; margin-bottom: 5px;">🗂️ ${s.name}</h3></div><div style="font-size: 24px; color: #1e3c72; opacity: 0.6;">⬅️</div>
        </div>`).join('');
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
            card.style.display = (txtValue.toLowerCase().indexOf(filter) > -1) ? "flex" : "none";
        }
    });
}

function loadAds() {
    const ads = JSON.parse(localStorage.getItem(DB_ADS)) || [];
    const container = document.getElementById('adsContainer');
    if (!ads.length) { container.innerHTML = '<div style="text-align:center; padding: 40px 20px; color:#1e3c72;"><div style="font-size:60px;">🔕</div><p style="font-weight:900; margin-top:10px; font-size:20px;">لا توجد إعلانات من الإدارة.</p></div>'; return; }
    container.innerHTML = ads.map(a => `
        <div class="ad-item"><div class="ad-title">📢 ${a.title}</div><div class="ad-date">📅 ${a.date}</div><div class="ad-text">${a.text || a.content}</div></div>`).join('');
}

window.openVideo = function(title, url) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('videoPlayer').src = url;
    document.getElementById('videoModal').classList.add('active');
}
window.closeVideo = function() {
    document.getElementById('videoPlayer').src = "";
    document.getElementById('videoModal').classList.remove('active');
}
