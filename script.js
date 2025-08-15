// DOM Elements
const hamburgerMenu = document.querySelector('.hamburger-menu');
const sideMenu = document.querySelector('.side-menu');
const closeMenu = document.querySelector('.close-menu');
const themeToggle = document.querySelector('.switch input');
const pageLoader = document.querySelector('.page-loader');
const installPrompt = document.querySelector('.install-prompt');
const installBtn = document.querySelector('.install-btn');
const cancelInstall = document.querySelector('.cancel-install');

// Page Loader
window.addEventListener('load', () => {
    setTimeout(() => {
        pageLoader.style.display = 'none';
    }, 2000);
});

// Hamburger Menu
hamburgerMenu.addEventListener('click', () => {
    sideMenu.classList.add('active');
});

closeMenu.addEventListener('click', () => {
    sideMenu.classList.remove('active');
});

// Theme Toggle
themeToggle.addEventListener('change', () => {
    document.body.setAttribute('data-theme', themeToggle.checked ? 'dark' : 'light');
    localStorage.setItem('theme', themeToggle.checked ? 'dark' : 'light');
});

// Check for saved theme preference
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    document.body.setAttribute('data-theme', currentTheme);
    themeToggle.checked = currentTheme === 'dark';
}

// Ad Popup Functionality
function showAdPopup() {
    const adPopup = document.createElement('div');
    adPopup.className = 'ad-popup';
    adPopup.innerHTML = `
        <div class="ad-content">
            <h3>Advertisement</h3>
            <p>Please wait while we load your content...</p>
            <div class="countdown">5</div>
            <button class="skip-ad">Skip Ad</button>
        </div>
    `;
    document.body.appendChild(adPopup);
    
    let count = 5;
    const countdown = adPopup.querySelector('.countdown');
    const timer = setInterval(() => {
        count--;
        countdown.textContent = count;
        if (count <= 0) {
            clearInterval(timer);
            adPopup.remove();
            // Proceed with tool functionality
        }
    }, 1000);
    
    adPopup.querySelector('.skip-ad').addEventListener('click', () => {
        clearInterval(timer);
        adPopup.remove();
        // Proceed with tool functionality
    });
}

// PWA Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installPrompt.style.display = 'flex';
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            installPrompt.style.display = 'none';
        }
        deferredPrompt = null;
    }
});

cancelInstall.addEventListener('click', () => {
    installPrompt.style.display = 'none';
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// QR Code Generator Page Specific Code
if (window.location.pathname.includes('generator.html')) {
    const generateBtn = document.getElementById('generate-btn');
    const qrInput = document.getElementById('qr-input');
    const qrResult = document.getElementById('qr-result');
    const downloadBtn = document.getElementById('download-btn');
    const shareBtn = document.getElementById('share-btn');
    
    generateBtn.addEventListener('click', () => {
        showAdPopup();
        setTimeout(() => {
            const text = qrInput.value.trim();
            if (text) {
                // In a real implementation, you would generate QR code here
                // For example using a library like QRCode.js
                qrResult.innerHTML = `
                    <div class="generating-text">GENERATING</div>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}" alt="QR Code">
                `;
                downloadBtn.style.display = 'block';
                shareBtn.style.display = 'block';
                
                // Save to history
                const history = JSON.parse(localStorage.getItem('qrHistory') || '[]');
                history.push({
                    type: 'generated',
                    data: text,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('qrHistory', JSON.stringify(history));
            }
        }, 5000);
    });
}

// QR Code Scanner Page Specific Code
if (window.location.pathname.includes('scanner.html')) {
    const scanBtn = document.getElementById('scan-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const cameraFeed = document.getElementById('camera-feed');
    const scanResult = document.getElementById('scan-result');
    const copyBtn = document.getElementById('copy-btn');
    const openBtn = document.getElementById('open-btn');
    const shareBtn = document.getElementById('share-btn');
    const flashToggle = document.getElementById('flash-toggle');
    
    scanBtn.addEventListener('click', () => {
        showAdPopup();
        setTimeout(() => {
            // In a real implementation, you would access the camera here
            // For example using the MediaDevices API
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    cameraFeed.srcObject = stream;
                    // Add scanner animation overlay
                    cameraFeed.insertAdjacentHTML('afterend', `
                        <div class="scanner-overlay">
                            <div class="scan-line"></div>
                        </div>
                    `);
                })
                .catch(err => {
                    console.error('Error accessing camera:', err);
                });
        }, 5000);
    });
    
    uploadBtn.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            showAdPopup();
            setTimeout(() => {
                // In a real implementation, you would process the QR code here
                // For example using a library like jsQR
                const reader = new FileReader();
                reader.onload = (event) => {
                    // Simulate QR code decoding
                    setTimeout(() => {
                        scanResult.textContent = "https://example.com/decoded-qr";
                        scanResult.style.display = 'block';
                        copyBtn.style.display = 'block';
                        openBtn.style.display = 'block';
                        shareBtn.style.display = 'block';
                        
                        // Save to history
                        const history = JSON.parse(localStorage.getItem('qrHistory') || '[]');
                        history.push({
                            type: 'scanned',
                            data: "https://example.com/decoded-qr",
                            timestamp: new Date().toISOString()
                        });
                        localStorage.setItem('qrHistory', JSON.stringify(history));
                    }, 1000);
                };
                reader.readAsDataURL(file);
            }, 5000);
        }
    });
}
