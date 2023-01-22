import sys
import os
import whisper


def transcribe(file):
    """
    Accepts an audio file and transcribes it using Whisper.
    """
    file_extension = os.path.splitext(file)[1]
    if file_extension in ["mp3", ".wav", ".flac", ".ogg", ".m4a", ".wma"]:
        model = whisper.load_model("base")
        result = model.transcribe(file)
        return result["text"]

# pass resulting text back to node.js
print(transcribe(sys.argv[1]))
sys.stdout.flush()