import random
from song_bank_generator import fetch_songs_from_playlist, fetch_songs_from_user, fetch_songs_from_group
from question_generator import generate_guess_the_audio_question, generate_who_listened_more_question

class Quiz:
    def __init__(self, quiz_type, identifier):
        self.quiz_type = quiz_type
        self.identifier = identifier
        self.song_bank = []
        self.questions = []

    def create_song_bank(self):
        # Fetch songs from Spotify API based on quiz type and identifier
        if self.quiz_type == 'Playlist':
            self.song_bank = fetch_songs_from_playlist(self.identifier)
        elif self.quiz_type == 'Taste':
            self.song_bank = fetch_songs_from_user(self.identifier)
        elif self.quiz_type == 'Taste Group':
            self.song_bank = fetch_songs_from_group(self.identifier)
        # Shuffle the song bank for randomness
        random.shuffle(self.song_bank)

    def generate_questions(self):
        # Generate 10 questions based on the song bank and quiz templates
        for _ in range(10):
            question_type = random.choice(["guess_the_audio", "who_listened_more"])
            if question_type == "guess_the_audio":
                self.questions.append(generate_guess_the_audio_question(self.song_bank))
            elif question_type == "who_listened_more":
                song = random.choice(self.song_bank)
                self.questions.append(generate_who_listened_more_question(song))

    def get_next_question(self):
        if self.questions:
            return self.questions.pop(0)
        return None