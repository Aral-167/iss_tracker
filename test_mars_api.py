import requests
import json

try:
    response = requests.get("https://api.maas2.apollorion.com")
    response.raise_for_status()
    data = response.json()
    
    print("Mars Weather API Response:")
    print(json.dumps(data, indent=2))
    print("\nAvailable keys:")
    for key in data.keys():
        print(f"- {key}: {data[key]}")
        
except Exception as e:
    print(f"Error: {e}")
