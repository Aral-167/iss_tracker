from flask import Flask, render_template, jsonify
import requests

app = Flask(__name__)

NASA_API_KEY = "DEMO_KEY"

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

if __name__ == "__main__":
    app.run(debug=False)
