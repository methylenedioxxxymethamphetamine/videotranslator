import os
import whisper
from TTS.api import TTS
from typing import Optional

# Загружаем модели при старте
whisper_model = whisper.load_model("medium")
tts_model = TTS(model_name="tts_models/rus/ru_tts", progress_bar=False)

async def transcribe(audio_path: str) -> str:
    """Транскрибирует аудио в текст"""
    try:
        result = whisper_model.transcribe(audio_path, language="en")
        return result["text"]
    except Exception as e:
        raise Exception(f"Ошибка транскрибации: {str(e)}")

async def synthesize_speech(text: str, output_dir: str) -> str:
    """Синтезирует русскую речь из текста"""
    output_path = os.path.join(output_dir, "translated_audio.wav")
    try:
        tts_model.tts_to_file(text=text, file_path=output_path)
        return output_path
    except Exception as e:
        raise Exception(f"Ошибка синтеза речи: {str(e)}")