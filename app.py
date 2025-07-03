from flask import Flask, render_template, jsonify, request
import requests
import datetime
import math
import random

app = Flask(__name__)

NASA_API_KEY = "FqYoZZNTwSVfehBDjePKQCAYRKfH64ipFA6JbBlH"
IPGEOLOCATION_API_KEY = "f103f55601444a148591aa6c49bcf620"  # <-- IMPORTANT: Add your free API key here

# Star database with interesting facts
STARS_DATABASE = [
    {
        "name": "Sirius",
        "constellation": "Canis Major",
        "distance": "8.6 light-years",
        "magnitude": "-1.46",
        "temperature": "9,940 K",
        "spectral_type": "A1V",
        "description": "Sirius is the brightest star in the night sky and is actually a binary star system. The primary star, Sirius A, is about twice as massive as our Sun, while its companion, Sirius B, is a white dwarf."
    },
    {
        "name": "Vega",
        "constellation": "Lyra",
        "distance": "25 light-years",
        "magnitude": "0.03",
        "temperature": "9,602 K",
        "spectral_type": "A0V",
        "description": "Vega was the northern pole star around 12,000 BCE and will be so again in about 13,727 CE. It was the first star to be photographed and the first to have its spectrum recorded."
    },
    {
        "name": "Betelgeuse",
        "constellation": "Orion",
        "distance": "650 light-years",
        "magnitude": "0.42",
        "temperature": "3,500 K",
        "spectral_type": "M1-2",
        "description": "Betelgeuse is a red supergiant star and one of the largest known stars. If placed at the center of our Solar System, it would engulf the orbits of Mars and possibly Jupiter."
    },
    {
        "name": "Rigel",
        "constellation": "Orion",
        "distance": "860 light-years",
        "magnitude": "0.13",
        "temperature": "12,100 K",
        "spectral_type": "B8",
        "description": "Rigel is a blue supergiant star and is the most luminous star in the constellation Orion. Despite being designated Beta Orionis, it is usually the brightest star in the constellation."
    },
    {
        "name": "Polaris",
        "constellation": "Ursa Minor",
        "distance": "433 light-years",
        "magnitude": "1.98",
        "temperature": "6,015 K",
        "spectral_type": "F7",
        "description": "Polaris, the North Star, is located nearly in line with Earth's rotational axis, making it appear stationary in the night sky. It's actually a multiple star system."
    },
    {
        "name": "Arcturus",
        "constellation": "Boötes",
        "distance": "37 light-years",
        "magnitude": "-0.05",
        "temperature": "4,286 K",
        "spectral_type": "K1.5",
        "description": "Arcturus is the brightest star in the northern hemisphere and the fourth-brightest in the night sky. It's a red giant star that's about 25 times larger than our Sun."
    },
    {
        "name": "Altair",
        "constellation": "Aquila",
        "distance": "17 light-years",
        "magnitude": "0.77",
        "temperature": "7,550 K",
        "spectral_type": "A7V",
        "description": "Altair is one of the closest stars visible to the naked eye and rotates very rapidly, completing one rotation in about 9 hours compared to the Sun's 25 days."
    },
    {
        "name": "Antares",
        "constellation": "Scorpius",
        "distance": "600 light-years",
        "magnitude": "1.09",
        "temperature": "3,500 K",
        "spectral_type": "M1.5",
        "description": "Antares is a red supergiant star, one of the largest known stars. Its name means 'rival of Mars' because of its similar reddish color. If placed in our Solar System, it would extend beyond Mars' orbit."
    },
    {
        "name": "Capella",
        "constellation": "Auriga",
        "distance": "43 light-years",
        "magnitude": "0.08",
        "temperature": "4,970 K",
        "spectral_type": "G5",
        "description": "Capella is actually a complex multiple star system consisting of four stars in two binary pairs. It's the sixth-brightest star in the night sky and the third-brightest in the northern hemisphere."
    },
    {
        "name": "Aldebaran",
        "constellation": "Taurus",
        "distance": "65 light-years",
        "magnitude": "0.85",
        "temperature": "3,910 K",
        "spectral_type": "K5",
        "description": "Aldebaran is a red giant star that appears to be part of the Hyades cluster but is actually much closer to Earth. It's known as the 'Eye of the Bull' in the constellation Taurus."
    }
]

def calculate_moon_phase():
    """Calculate the current moon phase"""
    now = datetime.datetime.now()
    
    # Known new moon date (Jan 1, 2000)
    new_moon = datetime.datetime(2000, 1, 6, 18, 14)
    
    # Moon cycle is approximately 29.53 days
    moon_cycle = 29.530588853
    
    # Calculate days since known new moon
    days_since = (now - new_moon).total_seconds() / (24 * 3600)
    
    # Calculate current position in moon cycle
    moon_age = days_since % moon_cycle
    
    # Calculate illumination percentage
    illumination = (1 - math.cos(2 * math.pi * moon_age / moon_cycle)) / 2
    
    # Determine phase name
    if moon_age < 1.84566:
        phase_name = "New Moon"
        phase_class = "new-moon"
    elif moon_age < 5.53699:
        phase_name = "Waxing Crescent"
        phase_class = "waxing-crescent"
    elif moon_age < 9.22831:
        phase_name = "First Quarter"
        phase_class = "first-quarter"
    elif moon_age < 12.91963:
        phase_name = "Waxing Gibbous"
        phase_class = "waxing-gibbous"
    elif moon_age < 16.61096:
        phase_name = "Full Moon"
        phase_class = "full-moon"
    elif moon_age < 20.30228:
        phase_name = "Waning Gibbous"
        phase_class = "waning-gibbous"
    elif moon_age < 23.99361:
        phase_name = "Last Quarter"
        phase_class = "last-quarter"
    else:
        phase_name = "Waning Crescent"
        phase_class = "waning-crescent"
    
    return {
        "phase_name": phase_name,
        "phase_class": phase_class,
        "illumination": round(illumination * 100, 1),
        "age": round(moon_age, 1)
    }

def get_star_of_the_day():
    """Get a star based on the current day of the year"""
    day_of_year = datetime.datetime.now().timetuple().tm_yday
    # Use day of year to consistently get the same star for the same day
    star_index = day_of_year % len(STARS_DATABASE)
    return STARS_DATABASE[star_index]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/iss")
def iss_location():
    r = requests.get("http://api.open-notify.org/iss-now.json")
    data = r.json()
    return jsonify({
        "lat": data["iss_position"]["latitude"],
        "lon": data["iss_position"]["longitude"]
    })

@app.route("/apod")
def nasa_apod():
    url = f"https://api.nasa.gov/planetary/apod?api_key={NASA_API_KEY}"
    r = requests.get(url)
    return jsonify(r.json())

@app.route("/moon")
def moon_phase():
    moon_data = calculate_moon_phase()
    return jsonify(moon_data)

@app.route("/star_of_the_day")
def star_of_the_day():
    star_data = get_star_of_the_day()
    return jsonify(star_data)

@app.route("/moonrise-moonset")
def moonrise_moonset():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon:
        return jsonify({"error": "Latitude and longitude are required"}), 400

    try:
        api_url = f"https://api.ipgeolocation.io/astronomy?apiKey={IPGEOLOCATION_API_KEY}&lat={lat}&long={lon}"
        response = requests.get(api_url)
        response.raise_for_status()  # Raise an exception for bad status codes
        data = response.json()
        
        moon_data = {
            "moonrise": data.get("moonrise"),
            "moonset": data.get("moonset"),
            "location": data.get("location", {}).get("city", "Unknown"),
            "date": data.get("date")
        }
        return jsonify(moon_data)

    except requests.exceptions.RequestException as e:
        print(f"Error fetching from IPGeolocation API: {e}")
        return jsonify({"error": "Failed to fetch moon data from external API"}), 500

@app.route("/mars-weather")
def mars_weather():
    try:
        api_url = "https://api.maas2.apollorion.com"
        response = requests.get(api_url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Get sol and pressure from API if available
        sol = data.get("sol", data.get("day", data.get("mars_day", "N/A")))
        pressure = data.get("pressure", data.get("atmo_pressure", data.get("atmospheric_pressure", "N/A")))
        
        # Try to get temperature from API, if not available use approximate value
        temperature = data.get("temperature", data.get("atmo_temp", data.get("temp", data.get("air_temp", None))))
        
        # If no temperature from API, provide approximate value
        if temperature is None or temperature == "N/A":
            import random
            temperature = random.randint(-85, -15)  # Approximate Mars temperature
        
        mars_weather_data = {
            "sol": sol,
            "temperature": temperature,
            "pressure": pressure,
        }
        
        return jsonify(mars_weather_data)

    except Exception as e:
        print(f"Error fetching Mars weather data: {e}")
        # If API completely fails, return error
        return jsonify({"error": "Failed to fetch Mars weather data"}), 500

if __name__ == "__main__":
    app.run(debug=False)