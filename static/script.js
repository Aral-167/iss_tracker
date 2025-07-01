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

// Add ISS orbital path (simplified)
let orbitPath = [];
let orbitPolyline;

// Track ISS position history
let positionHistory = [];
const maxHistoryPoints = 20;

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

async function loadAPOD() {
    try {
        const loadingElement = document.getElementById('apod-loading');
        const imgElement = document.getElementById('apod-img');
        const titleElement = document.getElementById('apod-title');
        const descElement = document.getElementById('apod-desc');
        
        loadingElement.style.display = 'block';
        
        const res = await fetch('/apod');
        const data = await res.json();
        
        // Handle different media types
        if (data.media_type === 'image') {
            imgElement.src = data.url;
            imgElement.style.display = 'block';
            
            // Hide loading spinner when image loads
            imgElement.onload = () => {
                loadingElement.style.display = 'none';
            };
            
            imgElement.onerror = () => {
                loadingElement.style.display = 'none';
                imgElement.style.display = 'none';
                titleElement.textContent = 'Unable to load image';
            };
        } else {
            // Handle video or other media types
            loadingElement.style.display = 'none';
            imgElement.style.display = 'none';
        }
        
        titleElement.textContent = data.title || 'NASA Picture of the Day';
        descElement.textContent = data.explanation || 'No description available.';
        
    } catch (error) {
        console.error('Error loading APOD:', error);
        document.getElementById('apod-loading').style.display = 'none';
        document.getElementById('apod-title').textContent = 'Unable to load NASA Picture of the Day';
        document.getElementById('apod-desc').textContent = 'Please check your internet connection and try again.';
    }
}

// Add click handler for APOD image to view full size
document.addEventListener('DOMContentLoaded', function() {
    const apodImg = document.getElementById('apod-img');
    
    apodImg.addEventListener('click', function() {
        if (this.src) {
            window.open(this.src, '_blank');
        }
    });
    
    // Add tooltip
    apodImg.title = 'Click to view full size image';
});

// Initialize the app
loadAPOD();
updateISS(); // Initial call
setInterval(updateISS, 5000); // Update every 5 seconds

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'r' || e.key === 'R') {
        updateISS();
    }
    if (e.key === 'f' || e.key === 'F') {
        if (marker) {
            map.setView(marker.getLatLng(), 4);
        }
    }
});

// Add map event listeners for better UX
map.on('zoomend', function() {
    const zoom = map.getZoom();
    // Adjust marker size based on zoom level
    const size = Math.max(20, Math.min(40, zoom * 5));
    // This would require recreating the marker, keeping it simple for now
});

console.log('🛰️ ISS Tracker initialized! Press "R" to refresh ISS position, "F" to focus on ISS');
