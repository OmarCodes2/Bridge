import requests

def get_spotify_artist_id(access_token: str, artist_name: str):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    params = {
        "q": artist_name,
        "type": "artist",
        "limit": 1  # We'll just fetch the first match
    }
    response = requests.get("https://api.spotify.com/v1/search", headers=headers, params=params)
    
    if response.status_code == 200:
        data = response.json()
        if data['artists']['items']:
            artist_id = data['artists']['items'][0]['id']
            return artist_id