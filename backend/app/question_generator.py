import random

def generate_guess_the_audio_question(song_bank):
    # Select four songs from the song bank
    selected_songs = random.sample(song_bank, 4)
    correct_song = random.choice(selected_songs)
    
    question = {
        "question_type": "guess_the_audio",
        "question_text": "Guess what song this is?",
        "audio_url": correct_song["audio_url"],
        "options": [
            {"image_url": song["album_art_url"], "text": f"{song['name']} by {song['artist']}", "is_correct": song == correct_song}
            for song in selected_songs
        ]
    }
    return question

def generate_who_listened_more_question(song):
    # Placeholder for actual implementation
    # Assume we have a method to get listening history and compare
    users = ["user1", "user2", "user3", "user4"]
    correct_user = random.choice(users)
    
    question = {
        "question_type": "who_listened_more",
        "question_text": f"Who listened to {song['name']} more?",
        "options": [
            {"image_url": f"https://example.com/{user}.jpg", "text": user, "is_correct": user == correct_user}
            for user in users
        ]
    }
    return question