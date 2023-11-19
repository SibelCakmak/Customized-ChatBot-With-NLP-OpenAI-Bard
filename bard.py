from bardapi import Bard
from dotenv import load_dotenv
import os

load_dotenv()
os.environ["_BARD_API_KEY"] = os.getenv("BARD_API_KEY")

def bardDevrede(message):
    bard = Bard()
    answer = bard.get_answer(str(message))
    return answer["content"]
