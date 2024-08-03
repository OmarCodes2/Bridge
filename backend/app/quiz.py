from app.generate_songs import *
import random

class Quiz:
    def __init__(self, token, quiz_type, question_type, room_object):
        self.token = token
        self.quiz_type = quiz_type
        self.question_type = question_type
        self.room_object = room_object
        self.song_bank = []
        self.questions = []

    def create_song_bank(self):
        if self.quiz_type == "artist":
            self.song_bank = generate_songs_artists(self.token, self.room_object.artist)

    def generate_questions(self):
        # Shuffle the song bank to ensure random order
        random.shuffle(self.song_bank)
        
        # Generate questions without repeating any song
        for song in self.song_bank[:10]:  # Assuming you want 10 questions
            # Create a list of wrong options by excluding the current song
            wrong_options = [s for s in self.song_bank if s != song]
            random.shuffle(wrong_options)  # Shuffle to get random wrong options
            
            # Select 3 random wrong options
            options = [
                {"text": song["song_name"], "is_correct": True}
            ]
            
            # Add 3 wrong options
            for wrong_option in wrong_options[:3]:
                options.append({"text": wrong_option["song_name"], "is_correct": False})
            
            # Shuffle options to avoid always placing the correct answer first
            random.shuffle(options)

            # Create the question and add it to the questions list
            question = {
                "question": "Guess the song",
                "mp3": song["preview_url"],  # Use the song's preview URL
                "options": options
            }
            self.questions.append(question)
            
    def get_next_question(self):
        if self.questions:
            return self.questions.pop(0)

