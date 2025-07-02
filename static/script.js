// Initialize the map with a dark theme
let map = L.map('map', {
    zoomControl: false,
    attributionControl: false
}).setView([0, 0], 2);

// Add custom zoom control
L.control.zoom({
    position: 'topright'
}).addTo(map);

// Use CartoDB Dark Matter tiles for a space-like theme
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Create custom ISS icon
const issIcon = L.divIcon({
    className: 'iss-marker',
    html: `<div style="
        background: radial-gradient(circle, #00d4ff 30%, transparent 70%);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        animation: pulse 2s infinite;
        box-shadow: 0 0 20px #00d4ff;
    ">🛰️</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

let marker = L.marker([0, 0], { icon: issIcon }).addTo(map);

// Add ISS orbital path tracking variables
let orbitPath = [];
let orbitPolyline;
let positionHistory = [];
const maxHistoryPoints = 20;

// Video management variables
let videoIframe = null;
let videoPaused = false;
let isVideoInitialized = false;

// ISS Position Update Function
async function updateISS() {
    try {
        const res = await fetch('/iss');
        const data = await res.json();
        const lat = parseFloat(data.lat);
        const lon = parseFloat(data.lon);
        
        // Update marker position with smooth animation
        marker.setLatLng([lat, lon]);
        
        // Update coordinate display
        document.getElementById('lat-value').textContent = lat.toFixed(4) + '°';
        document.getElementById('lon-value').textContent = lon.toFixed(4) + '°';
        
        // Add to position history
        positionHistory.push([lat, lon]);
        if (positionHistory.length > maxHistoryPoints) {
            positionHistory.shift();
        }
        
        // Update orbital path
        if (orbitPolyline) {
            map.removeLayer(orbitPolyline);
        }
        
        if (positionHistory.length > 1) {
            orbitPolyline = L.polyline(positionHistory, {
                color: '#00d4ff',
                weight: 3,
                opacity: 0.7,
                dashArray: '5, 5'
            }).addTo(map);
        }
        
        // Smooth map movement
        map.panTo([lat, lon], {
            animate: true,
            duration: 1
        });
        
        // Set appropriate zoom level based on current zoom
        if (map.getZoom() < 3) {
            map.setZoom(3);
        }
        
    } catch (error) {
        console.error('Error updating ISS position:', error);
        document.getElementById('lat-value').textContent = 'Error';
        document.getElementById('lon-value').textContent = 'Error';
    }
}

// Load NASA Astronomy Picture of the Day
async function loadAPOD() {
    try {
        const loadingElement = document.getElementById('apod-loading');
        const imgElement = document.getElementById('apod-img');
        const titleElement = document.getElementById('apod-title');
        const descElement = document.getElementById('apod-desc');
        
        if (loadingElement) loadingElement.style.display = 'block';
        
        const res = await fetch('/apod');
        const data = await res.json();
        
        // Handle different media types
        if (data.media_type === 'image') {
            imgElement.src = data.url;
            imgElement.style.display = 'block';
            
            // Hide loading spinner when image loads
            imgElement.onload = () => {
                if (loadingElement) loadingElement.style.display = 'none';
            };
            
            imgElement.onerror = () => {
                if (loadingElement) loadingElement.style.display = 'none';
                imgElement.style.display = 'none';
                titleElement.textContent = 'Unable to load image';
            };
        } else {
            // Handle video or other media types
            if (loadingElement) loadingElement.style.display = 'none';
            imgElement.style.display = 'none';
        }
        
        titleElement.textContent = data.title || 'NASA Picture of the Day';
        descElement.textContent = data.explanation || 'No description available.';
        
    } catch (error) {
        console.error('Error loading APOD:', error);
        const loadingElement = document.getElementById('apod-loading');
        if (loadingElement) loadingElement.style.display = 'none';
        document.getElementById('apod-title').textContent = 'Unable to load NASA Picture of the Day';
        document.getElementById('apod-desc').textContent = 'Please check your internet connection and try again.';
    }
}

// Update Moon Phase Information
async function updateMoonPhase() {
    try {
        const res = await fetch('/moon');
        const data = await res.json();
        
        // Update moon phase display
        const moonPhaseElement = document.getElementById('moon-phase');
        const moonPhaseNameElement = document.getElementById('moon-phase-name');
        const moonIlluminationElement = document.getElementById('moon-illumination');
        const moonAgeElement = document.getElementById('moon-age');
        
        if (moonPhaseElement) {
            // Set moon phase class for visual representation
            moonPhaseElement.className = `moon-phase ${data.phase_class}`;
        }
        
        // Update text information
        if (moonPhaseNameElement) moonPhaseNameElement.textContent = data.phase_name;
        if (moonIlluminationElement) moonIlluminationElement.textContent = `${data.illumination}%`;
        if (moonAgeElement) moonAgeElement.textContent = `${data.age} days`;
        
    } catch (error) {
        console.error('Error updating moon phase:', error);
        const moonPhaseNameElement = document.getElementById('moon-phase-name');
        const moonIlluminationElement = document.getElementById('moon-illumination');
        const moonAgeElement = document.getElementById('moon-age');
        
        if (moonPhaseNameElement) moonPhaseNameElement.textContent = 'Error';
        if (moonIlluminationElement) moonIlluminationElement.textContent = 'Error';
        if (moonAgeElement) moonAgeElement.textContent = 'Error';
    }
}

// Load Star of the Day Information
async function loadStarOfTheDay() {
    try {
        const res = await fetch('/star_of_the_day');
        const data = await res.json();
        
        // Update star information
        const starNameElement = document.getElementById('star-name');
        const starConstellationElement = document.getElementById('star-constellation');
        const starDistanceElement = document.getElementById('star-distance');
        const starMagnitudeElement = document.getElementById('star-magnitude');
        const starTemperatureElement = document.getElementById('star-temperature');
        const starSpectralElement = document.getElementById('star-spectral');
        const starDescriptionElement = document.getElementById('star-description');
        
        if (starNameElement) starNameElement.textContent = data.name;
        if (starConstellationElement) starConstellationElement.textContent = data.constellation;
        if (starDistanceElement) starDistanceElement.textContent = data.distance;
        if (starMagnitudeElement) starMagnitudeElement.textContent = data.magnitude;
        if (starTemperatureElement) starTemperatureElement.textContent = data.temperature;
        if (starSpectralElement) starSpectralElement.textContent = data.spectral_type;
        if (starDescriptionElement) starDescriptionElement.textContent = data.description;
        
        // Add spectral type indicator
        if (starSpectralElement && !starSpectralElement.parentNode.querySelector('.star-type')) {
            const spectralType = data.spectral_type.charAt(0);
            const spectralClass = document.createElement('span');
            spectralClass.className = 'star-type';
            spectralClass.textContent = `Class ${spectralType}`;
            starSpectralElement.parentNode.appendChild(spectralClass);
        }
        
        // Animate star visual based on spectral type
        const starVisual = document.getElementById('star-visual');
        if (starVisual) {
            const spectralType = data.spectral_type.charAt(0);
            switch(spectralType) {
                case 'O':
                case 'B':
                    starVisual.style.color = '#9bb0ff';
                    break;
                case 'A':
                    starVisual.style.color = '#aabfff';
                    break;
                case 'F':
                    starVisual.style.color = '#cad7ff';
                    break;
                case 'G':
                    starVisual.style.color = '#fff4ea';
                    break;
                case 'K':
                    starVisual.style.color = '#ffd2a1';
                    break;
                case 'M':
                    starVisual.style.color = '#ffad51';
                    break;
                default:
                    starVisual.style.color = '#ffd700';
            }
        }
        
    } catch (error) {
        console.error('Error loading Star of the Day:', error);
        const starNameElement = document.getElementById('star-name');
        const starConstellationElement = document.getElementById('star-constellation');
        const starDescriptionElement = document.getElementById('star-description');
        
        if (starNameElement) starNameElement.textContent = 'Unable to load';
        if (starConstellationElement) starConstellationElement.textContent = 'star information';
        if (starDescriptionElement) starDescriptionElement.textContent = 'Please check your internet connection and try again.';
    }
}

// Video Management Functions
function initializeVideo() {
    if (isVideoInitialized) return;
    
    videoIframe = document.getElementById('iss-video');
    const videoWrapper = document.getElementById('video-wrapper');
    const videoFallback = document.getElementById('video-fallback');
    
    if (!videoIframe) return;
    
    isVideoInitialized = true;
    
    // Alternative video sources to try
    const videoSources = [
        "https://www.youtube.com/embed/21X5lGlDOfg?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&showinfo=0",
        "https://www.youtube.com/embed/XBPjVzSoepo?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&showinfo=0",
        "https://www.youtube.com/embed/4993sBLAzGA?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&showinfo=0"
    ];
    
    let currentSourceIndex = 0;
    
    // Try alternative sources if primary fails
    function tryNextSource() {
        currentSourceIndex++;
        if (currentSourceIndex < videoSources.length) {
            videoIframe.src = videoSources[currentSourceIndex];
            setTimeout(() => {
                // If still not working after 5 seconds, try next source
                try {
                    if (videoIframe.contentDocument === null) {
                        tryNextSource();
                    }
                } catch (e) {
                    tryNextSource();
                }
            }, 5000);
        } else {
            showVideoFallback();
        }
    }
    
    // Show fallback if all sources fail
    setTimeout(() => {
        try {
            // Test if iframe is accessible (will throw error if blocked)
            if (videoIframe.contentDocument === null) {
                tryNextSource();
            }
        } catch (e) {
            tryNextSource();
        }
    }, 3000);
    
    // Check for video load errors
    videoIframe.addEventListener('error', function() {
        showVideoFallback();
    });
}

function showVideoFallback() {
    const videoWrapper = document.getElementById('video-wrapper');
    const videoFallback = document.getElementById('video-fallback');
    
    if (videoWrapper) videoWrapper.style.display = 'none';
    if (videoFallback) videoFallback.classList.add('show');
}

function refreshVideo() {
    const videoWrapper = document.getElementById('video-wrapper');
    const videoFallback = document.getElementById('video-fallback');
    
    if (videoWrapper) videoWrapper.style.display = 'block';
    if (videoFallback) videoFallback.classList.remove('show');
    
    if (videoIframe) {
        // Reset to primary source
        videoIframe.src = "https://www.youtube.com/embed/H999s0P1Er0?si=3udpqrJ4O8Lik44Yautoplay=1&mute=1&controls=1&rel=0&modestbranding=1&showinfo=0&enablejsapi=1&origin=http://localhost";

        
        // Re-initialize video checking
        isVideoInitialized = false;
        setTimeout(initializeVideo, 1000);
    }
}

function toggleVideo() {
    if (!videoIframe) return;
    
    const toggleButton = document.querySelector('[onclick="toggleVideo()"]');
    
    if (videoPaused) {
        videoIframe.style.display = 'block';
        videoPaused = false;
        if (toggleButton) toggleButton.innerHTML = '⏸️ Pause';
    } else {
        videoIframe.style.display = 'none';
        videoPaused = true;
        if (toggleButton) toggleButton.innerHTML = '▶️ Resume';
    }
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'r' || e.key === 'R') {
            updateISS();
        }
        if (e.key === 'f' || e.key === 'F') {
            if (marker) {
                map.setView(marker.getLatLng(), 4);
            }
        }
        if (e.key === 'v' || e.key === 'V') {
            toggleVideo();
        }
        if (e.key === 'Escape') {
            // Exit fullscreen if active
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        }
    });
}

// Map Event Listeners
function setupMapEventListeners() {
    map.on('zoomend', function() {
        const zoom = map.getZoom();
        // Adjust marker size based on zoom level
        const size = Math.max(20, Math.min(40, zoom * 5));
        // This would require recreating the marker, keeping it simple for now
    });
    
    // Add click event to center on ISS
    map.on('click', function(e) {
        if (marker) {
            map.setView(marker.getLatLng(), map.getZoom());
        }
    });
}

// Video Control Event Listeners
function setupVideoControls() {
    const toggleBtn = document.getElementById('toggle-video');
    const fullscreenBtn = document.getElementById('fullscreen-video');
    const videoWrapper = document.querySelector('.video-wrapper');
    const iframe = document.getElementById('iss-video');
    
    if (!toggleBtn || !fullscreenBtn || !videoWrapper || !iframe) return;
    
    let isPlaying = true;
    let originalSrc = iframe.src;
    
    // Toggle video play/pause
    toggleBtn.addEventListener('click', function() {
        if (isPlaying) {
            iframe.src = '';
            toggleBtn.textContent = '▶️ Resume Video';
            isPlaying = false;
        } else {
            iframe.src = originalSrc;
            toggleBtn.textContent = '⏸️ Pause Video';
            isPlaying = true;
        }
    });
    
    // Fullscreen functionality
    fullscreenBtn.addEventListener('click', function() {
        if (videoWrapper.requestFullscreen) {
            videoWrapper.requestFullscreen();
        } else if (videoWrapper.webkitRequestFullscreen) {
            videoWrapper.webkitRequestFullscreen();
        } else if (videoWrapper.msRequestFullscreen) {
            videoWrapper.msRequestFullscreen();
        }
    });
    
    // Handle fullscreen changes
    function handleFullscreenChange() {
        if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            fullscreenBtn.textContent = '🗗 Exit Fullscreen';
        } else {
            fullscreenBtn.textContent = '🗖 Fullscreen';
        }
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
}

// APOD Image Click Handler
function setupAPODImageHandler() {
    const apodImg = document.getElementById('apod-img');
    
    if (apodImg) {
        apodImg.addEventListener('click', function() {
            if (this.src) {
                window.open(this.src, '_blank');
            }
        });
        
        // Add tooltip
        apodImg.title = 'Click to view full size image';
    }
}

// Status Updates
function updateStatus() {
    const statusElements = document.querySelectorAll('.status-indicator');
    statusElements.forEach(element => {
        element.style.display = 'flex';
    });
}

// Initialize Application
function initializeApp() {
    console.log('🛰️ Initializing ISS Tracker...');
    
    // Load initial data
    updateISS();
    loadAPOD();
    updateMoonPhase();
    loadStarOfTheDay();
    
    // Setup event listeners
    setupKeyboardShortcuts();
    setupMapEventListeners();
    setupAPODImageHandler();
    
    // Initialize video after a short delay to ensure DOM is ready
    setTimeout(() => {
        initializeVideo();
        setupVideoControls();
    }, 1000);
    
    // Update status
    updateStatus();
    
    // Set up intervals for automatic updates
    setInterval(updateISS, 5000); // Update ISS position every 5 seconds
    setInterval(updateMoonPhase, 3600000); // Update moon phase every hour
    
    console.log('✅ ISS Tracker initialized successfully!');
    console.log('🎮 Keyboard shortcuts:');
    console.log('   R - Refresh ISS position');
    console.log('   F - Focus on ISS location');
    console.log('   V - Toggle video play/pause');
    console.log('   ESC - Exit fullscreen');
}

// Global functions for HTML onclick events
window.refreshVideo = refreshVideo;
window.toggleVideo = toggleVideo;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure all elements are rendered
    setTimeout(initializeApp, 500);
});

// Handle page visibility changes to pause/resume updates
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('🌙 Page hidden, pausing updates...');
    } else {
        console.log('🌞 Page visible, resuming updates...');
        updateISS(); // Refresh ISS position when page becomes visible
    }
});

// Handle window resize for responsive map
window.addEventListener('resize', function() {
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }
});

// Error handling for unhandled promises
window.addEventListener('unhandledrejection', function(event) {
    console.error('🚨 Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

console.log('🚀 ISS Tracker script loaded successfully!');

// Moonrise & Moonset Functions
async function getMoonriseMoonset(lat, lon, locationName = '') {
    const resultsContainer = {
        moonrise: document.getElementById('moonrise-time'),
        moonset: document.getElementById('moonset-time'),
        location: document.getElementById('moonrise-location'),
        date: document.getElementById('moonrise-date')
    };

    try {
        // Update location display
        if (locationName) {
            resultsContainer.location.textContent = locationName;
        } else {
            resultsContainer.location.textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        }

        // Get current date
        const today = new Date();
        resultsContainer.date.textContent = today.toLocaleDateString();

        // Use TimeAndDate.com API or similar for accurate moon times
        // For now, let's use a more accurate calculation
        const moonData = calculateAccurateMoonTimes(lat, lon, today);
        
        if (moonData.moonrise) {
            resultsContainer.moonrise.textContent = moonData.moonrise;
        } else {
            resultsContainer.moonrise.textContent = 'No moonrise today';
        }
        
        if (moonData.moonset) {
            resultsContainer.moonset.textContent = moonData.moonset;
        } else {
            resultsContainer.moonset.textContent = 'No moonset today';
        }

    } catch (error) {
        console.error('Error fetching moonrise/moonset data:', error);
        resultsContainer.moonrise.textContent = 'Error loading data';
        resultsContainer.moonset.textContent = 'Error loading data';
        resultsContainer.location.textContent = 'Error';
        resultsContainer.date.textContent = 'Error';
    }
}

// More accurate moon time calculations
function calculateAccurateMoonTimes(lat, lon, date) {
    // Convert to radians
    const latitudeRad = lat * Math.PI / 180;
    const longitudeRad = lon * Math.PI / 180;
    
    // Julian day calculation
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // More accurate Julian Day calculation
    let adjYear, adjMonth;
    if (month <= 2) {
        adjYear = year - 1;
        adjMonth = month + 12;
    } else {
        adjYear = year;
        adjMonth = month;
    }
    
    const b = Math.floor(adjYear / 100);
    const c = 2 - b + Math.floor(b / 4);
    
    const jd = Math.floor(365.25 * (adjYear + 4716)) + Math.floor(30.6001 * (adjMonth + 1)) + day + c - 1524.5;
    
    // Days since J2000.0
    const d = jd - 2451545.0;
    
    // More accurate moon position calculation
    // Mean longitude of moon
    const L = (218.3164477 + 481267.88123421 * d / 36525) % 360;
    
    // Mean elongation of moon
    const D = (297.8501921 + 445267.1114034 * d / 36525) % 360;
    
    // Sun's mean anomaly
    const M = (357.5291092 + 35999.0502909 * d / 36525) % 360;
    
    // Moon's mean anomaly
    const Mp = (134.9633964 + 477198.8675055 * d / 36525) % 360;
    
    // Moon's argument of latitude
    const F = (93.272095 + 483202.0175233 * d / 36525) % 360;
    
    // Convert to radians
    const LRad = L * Math.PI / 180;
    const DRad = D * Math.PI / 180;
    const MRad = M * Math.PI / 180;
    const MpRad = Mp * Math.PI / 180;
    const FRad = F * Math.PI / 180;
    
    // Calculate lunar longitude with perturbations
    let longitude = L;
    longitude += 6.289 * Math.sin(MpRad);
    longitude += 1.274 * Math.sin(2 * DRad - MpRad);
    longitude += 0.658 * Math.sin(2 * DRad);
    longitude += 0.214 * Math.sin(2 * MpRad);
    longitude += -0.186 * Math.sin(MRad);
    longitude += -0.059 * Math.sin(2 * DRad - 2 * MpRad);
    longitude += -0.057 * Math.sin(2 * DRad - MRad - MpRad);
    longitude += 0.053 * Math.sin(2 * DRad + MpRad);
    longitude += 0.046 * Math.sin(2 * DRad - MRad);
    longitude += 0.041 * Math.sin(MpRad - MRad);
    
    // Calculate lunar latitude
    let latitude = 5.128 * Math.sin(FRad);
    latitude += 0.281 * Math.sin(MpRad + FRad);
    latitude += 0.278 * Math.sin(MpRad - FRad);
    latitude += 0.173 * Math.sin(2 * DRad - FRad);
    
    const moonLonRad = longitude * Math.PI / 180;
    const moonLatRad = latitude * Math.PI / 180;
    
    // Convert to equatorial coordinates
    const epsilon = 23.4393 * Math.PI / 180; // Earth's obliquity
    
    const x = Math.cos(moonLatRad) * Math.cos(moonLonRad);
    const yCoord = Math.cos(moonLatRad) * Math.sin(moonLonRad) * Math.cos(epsilon) - Math.sin(moonLatRad) * Math.sin(epsilon);
    const z = Math.cos(moonLatRad) * Math.sin(moonLonRad) * Math.sin(epsilon) + Math.sin(moonLatRad) * Math.cos(epsilon);
    
    const alpha = Math.atan2(yCoord, x); // Right ascension
    const delta = Math.asin(z); // Declination
    
    // Calculate hour angle at rise/set
    const h0 = -0.833 * Math.PI / 180; // Standard refraction
    const moonRadius = 0.25 * Math.PI / 180; // Moon's average angular radius
    const h = h0 - moonRadius;
    
    const cosH = (Math.sin(h) - Math.sin(latitudeRad) * Math.sin(delta)) / (Math.cos(latitudeRad) * Math.cos(delta));
    
    // Check if moon rises/sets today
    if (Math.abs(cosH) > 1) {
        if (cosH > 1) {
            return { moonrise: 'No moonrise today', moonset: 'No moonset today' };
        } else {
            return { moonrise: 'Always visible', moonset: 'Always visible' };
        }
    }
    
    const H = Math.acos(cosH);
    
    // Calculate Greenwich Mean Sidereal Time
    const T = d / 36525;
    const gmst = 280.46061837 + 360.98564736629 * d + 0.000387933 * T * T - T * T * T / 38710000;
    const gmstRad = (gmst % 360) * Math.PI / 180;
    
    // Calculate local sidereal time
    const lst = gmstRad + longitudeRad;
    
    // Calculate rise and set times
    const riseHA = -H;
    const setHA = H;
    
    const riseTime = (alpha - lst - riseHA) * 12 / Math.PI;
    const setTime = (alpha - lst - setHA) * 12 / Math.PI;
    
    // Normalize to 24-hour format
    const normalizeTime = (t) => {
        t = t % 24;
        if (t < 0) t += 24;
        return t;
    };
    
    const moonriseHours = normalizeTime(riseTime);
    const moonsetHours = normalizeTime(setTime);
    
    // Format times
    const formatTime = (hours) => {
        const h = Math.floor(hours);
        const m = Math.floor((hours - h) * 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };
    
    return {
        moonrise: formatTime(moonriseHours),
        moonset: formatTime(moonsetHours)
    };
}

// Handle geolocation for moonrise
function handleMoonriseGeolocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }

    // Update button text to show loading
    const button = document.getElementById('get-moonrise-location');
    const originalText = button.textContent;
    button.textContent = 'Getting location...';
    button.disabled = true;

    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            getMoonriseMoonset(latitude, longitude, 'Your Location');
            
            // Reset button
            button.textContent = originalText;
            button.disabled = false;
        },
        error => {
            console.error('Geolocation error:', error);
            alert('Unable to retrieve your location. Please enter coordinates manually.');
            
            // Reset button
            button.textContent = originalText;
            button.disabled = false;
        },
        {
            timeout: 10000,
            enableHighAccuracy: true
        }
    );
}

// Handle manual location input for moonrise
async function handleMoonriseLocationSubmit() {
    const locationInput = document.getElementById('moonrise-location-input').value.trim();
    
    if (!locationInput) {
        alert('Please enter a location.');
        return;
    }

    // Check if input is coordinates (lat,lon format)
    const coordsMatch = locationInput.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    
    if (coordsMatch) {
        const lat = parseFloat(coordsMatch[1]);
        const lon = parseFloat(coordsMatch[2]);
        
        if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            getMoonriseMoonset(lat, lon, locationInput);
        } else {
            alert('Please enter valid coordinates (latitude between -90 and 90, longitude between -180 and 180).');
        }
    } else {
        // Try to geocode the location name
        try {
            const geocodeResponse = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(locationInput)}&key=DEMO_KEY&limit=1`);
            const geocodeData = await geocodeResponse.json();
            
            if (geocodeData.results && geocodeData.results.length > 0) {
                const result = geocodeData.results[0];
                const lat = result.geometry.lat;
                const lon = result.geometry.lng;
                const locationName = result.formatted;
                
                getMoonriseMoonset(lat, lon, locationName);
            } else {
                alert('Location not found. Please try entering coordinates in the format: latitude, longitude');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            alert('Error finding location. Please try entering coordinates in the format: latitude, longitude');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize moonrise/moonset for default location
    getMoonriseMoonset(0, 0, 'Default Location');
    
    // Setup event listener for manual location form
    const moonriseForm = document.getElementById('moonrise-location-form');
    if (moonriseForm) {
        moonriseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleMoonriseLocationSubmit();
        });
    }
    
    // Setup event listener for geolocation button
    const geoButton = document.getElementById('get-moonrise-location');
    if (geoButton) {
        geoButton.addEventListener('click', handleMoonriseGeolocation);
    }
    
    document.getElementById('use-geolocation').addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetchISSPasses(latitude, longitude).then(displayISSPasses);
        }, error => {
            alert('Unable to retrieve your location.');
            console.error('Geolocation error:', error);
        });
    });

    // Moonrise & Moonset event listeners
    document.getElementById('get-moonrise-location').addEventListener('click', handleMoonriseGeolocation);
    document.getElementById('moonrise-submit').addEventListener('click', handleMoonriseLocationSubmit);
    
    // Allow Enter key to submit moonrise location
    document.getElementById('moonrise-location-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleMoonriseLocationSubmit();
        }
    });
});