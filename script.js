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

// QR Code Generator Functionality
function generateQRCode(text) {
    // In a real implementation, you would use a QR code library
    // For example: new QRCode(document.getElementById("qr-result"), text);
    // This is a simplified version using an external API
    const qrResult = document.getElementById('qr-result');
    qrResult.innerHTML = `
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}" alt="QR Code">
    `;
    
    // Enable download button
    const downloadBtn = document.getElementById('download-btn');
    downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.href = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(text)}`;
        link.download = 'qrypt-qrcode.png';
        link.click();
    };
    
    // Enable share button
    const shareBtn = document.getElementById('share-btn');
    if (navigator.share) {
        shareBtn.onclick = () => {
            navigator.share({
                title: 'QR Code Generated with Qrypt',
                text: 'Check out this QR code I generated',
                url: window.location.href
            });
        };
    } else {
        shareBtn.style.display = 'none';
    }
}

// QR Code Scanner Functionality
function initQRScanner() {
    const video = document.getElementById('camera-feed');
    const scanResult = document.getElementById('scan-result');
    const copyBtn = document.getElementById('copy-btn');
    const openBtn = document.getElementById('open-btn');
    const shareBtn = document.getElementById('share-btn');
    const flashToggle = document.getElementById('flash-toggle');
    
    let stream = null;
    
    // Camera access
    document.getElementById('scan-btn').addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    torch: flashToggle.checked
                } 
            });
            video.srcObject = stream;
            video.style.display = 'block';
            document.querySelector('.scanner-overlay').style.display = 'block';
            video.play();
            
            // Start scanning loop
            scanQRCode();
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Could not access camera. Please check permissions.');
        }
    });
    
    // Flash toggle
    flashToggle.addEventListener('change', () => {
        if (stream) {
            const track = stream.getVideoTracks()[0];
            if ('torch' in track) {
                track.applyConstraints({
                    advanced: [{ torch: flashToggle.checked }]
                });
            }
        }
    });
    
    // Image upload
    document.getElementById('upload-btn').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        // In a real implementation, you would use jsQR or similar
                        // const code = jsQR(imageData, width, height);
                        // For demo purposes, we'll simulate a result
                        setTimeout(() => {
                            const simulatedResult = "https://example.com/decoded-qr";
                            displayScanResult(simulatedResult);
                        }, 1000);
                    } catch (err) {
                        console.error('Error decoding QR:', err);
                        alert('Could not decode QR code. Please try another image.');
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Scan loop
    function scanQRCode() {
        if (!video.videoWidth || !video.videoHeight) {
            requestAnimationFrame(scanQRCode);
            return;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
            // In a real implementation, you would use jsQR here
            // const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            // const code = jsQR(imageData.data, imageData.width, imageData.height);
            // For demo purposes, we'll simulate a result after some time
            if (Math.random() < 0.01) { // 1% chance per frame to "detect" a QR
                const simulatedResult = "https://example.com/decoded-qr";
                displayScanResult(simulatedResult);
                stopScanner();
            } else {
                requestAnimationFrame(scanQRCode);
            }
        } catch (err) {
            console.error('Error scanning:', err);
            requestAnimationFrame(scanQRCode);
        }
    }
    
    function displayScanResult(result) {
        scanResult.textContent = result;
        scanResult.style.display = 'block';
        copyBtn.style.display = 'inline-block';
        openBtn.style.display = 'inline-block';
        shareBtn.style.display = 'inline-block';
        
        // Set up button actions
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(result);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy Text';
            }, 2000);
        };
        
        if (result.startsWith('http')) {
            openBtn.onclick = () => {
                window.open(result, '_blank');
            };
        } else {
            openBtn.style.display = 'none';
        }
        
        if (navigator.share) {
            shareBtn.onclick = () => {
                navigator.share({
                    title: 'QR Code Scanned with Qrypt',
                    text: 'I scanned this QR code:',
                    url: result
                });
            };
        } else {
            shareBtn.style.display = 'none';
        }
        
        // Save to history
        const history = JSON.parse(localStorage.getItem('qrHistory') || '[]');
        history.push({
            type: 'scanned',
            data: result,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('qrHistory', JSON.stringify(history));
    }
    
    function stopScanner() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
    }
    
    // Clean up when leaving page
    window.addEventListener('beforeunload', stopScanner);
}

// Initialize appropriate functionality for each page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        document.querySelector('.switch input').checked = true;
    }
    
    // Initialize hamburger menu
    document.querySelector('.hamburger-menu').addEventListener('click', () => {
        document.querySelector('.side-menu').classList.add('active');
    });
    
    document.querySelector('.close-menu').addEventListener('click', () => {
        document.querySelector('.side-menu').classList.remove('active');
    });
    
    // Initialize theme toggle
    document.querySelector('.switch input').addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });
    
    // Initialize PWA install prompt
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        document.querySelector('.install-prompt').style.display = 'flex';
    });
    
    document.querySelector('.install-btn').addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                document.querySelector('.install-prompt').style.display = 'none';
            }
            deferredPrompt = null;
        }
    });
    
    document.querySelector('.cancel-install').addEventListener('click', () => {
        document.querySelector('.install-prompt').style.display = 'none';
    });
    
    // Page-specific initializations
    if (window.location.pathname.includes('generator.html')) {
        document.getElementById('generate-btn').addEventListener('click', () => {
            const text = document.getElementById('qr-input').value.trim();
            if (text) {
                showAdPopup(() => generateQRCode(text));
            } else {
                alert('Please enter some text or a URL first');
            }
        });
    }
    
    if (window.location.pathname.includes('scanner.html')) {
        initQRScanner();
    }
    
    // Initialize FAQ toggles
    if (window.location.pathname.includes('faqs.html')) {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const isOpen = answer.style.maxHeight;
                
                // Close all answers first
                document.querySelectorAll('.faq-answer').forEach(ans => {
                    ans.style.maxHeight = null;
                    ans.style.padding = '0 1rem';
                });
                
                // Toggle the clicked one
                if (!isOpen) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    answer.style.padding = '0 1rem 1rem';
                }
            });
        });
    }
});

// Ad Popup Functionality
function showAdPopup(callback) {
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
            if (callback) callback();
        }
    }, 1000);
    
    adPopup.querySelector('.skip-ad').addEventListener('click', () => {
        clearInterval(timer);
        adPopup.remove();
        if (callback) callback();
    });
}
