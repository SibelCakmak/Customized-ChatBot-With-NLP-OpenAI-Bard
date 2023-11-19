# apply.py

import json
import numpy as np
import nltk
import random
from bard import bardDevrede
from snowballstemmer import TurkishStemmer
import pickle
import tensorflow as tf
from tensorflow.keras.models import load_model

stemmer = TurkishStemmer()
intents = json.loads(open('data.json').read())
model = load_model('model.keras')
words = pickle.load(open('words.pkl', 'rb'))
classes = pickle.load(open('classes.pkl', 'rb'))

def chatbot(user_input):
    input_data = nltk.word_tokenize(user_input)
    input_data = [stemmer.stemWord(word.lower()) for word in input_data]

    input_vector = [0] * len(words)
    for word in input_data:
        if word in words:
            input_vector[words.index(word)] = 1

    input_vector = np.array(input_vector).reshape(1, len(input_vector))
    results = model.predict(input_vector)[0]
    results_index = np.argmax(results)
    tag = classes[results_index]

    # responses değişkenini başlangıçta boş bir liste olarak tanımla
    responses = []

    if results[results_index] > 0.90:
        for tg in intents["intents"]:
            if tg['tag'] == tag:
                responses = tg['responses']

        # Koşul sağlandığında responses değişkenini güncelle
        if responses:
            return random.choice(responses)
        else:
            return "Cevap bulunamadı."
    else:
        return bardDevrede(user_input)
