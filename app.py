from flask import Flask, render_template, jsonify
import requests
import datetime
import math
import random

app = Flask(__name__)

NASA_API_KEY = "DEMO_KEY"

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

if __name__ == "__main__":
    app.run(debug=False)