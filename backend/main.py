import os
import uuid
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from services import video_processor, audio_processor, translation_service

app = FastAPI(title="Video Translator API")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Временная папка для обработки файлов
TEMP_DIR = "temp"
os.makedirs(TEMP_DIR, exist_ok=True)

@app.post("/process_video")
async def process_video(
    url: str,
    translate_audio: bool = True,
    add_subtitles: bool = True,
    quality: str = "high"
):
    try:
        # Создаем уникальный ID для задачи
        task_id = str(uuid.uuid4())
        task_dir = os.path.join(TEMP_DIR, task_id)
        os.makedirs(task_dir, exist_ok=True)
        
        # Скачиваем видео
        video_path = await video_processor.download_video(url, task_dir)
        
        # Извлекаем аудио
        audio_path = await video_processor.extract_audio(video_path, task_dir)
        
        # Транскрибируем
        transcript = await audio_processor.transcribe(audio_path)
        
        # Переводим текст
        translated_text = await translation_service.translate(transcript)
        
        # Синтезируем русскую речь
        if translate_audio:
            translated_audio = await audio_processor.synthesize_speech(translated_text, task_dir)
        else:
            translated_audio = None
        
        # Генерируем субтитры
        if add_subtitles:
            subtitles_path = await video_processor.generate_subtitles(translated_text, task_dir)
        else:
            subtitles_path = None
        
        # Собираем финальное видео
        output_path = await video_processor.combine_video(
            video_path,
            translated_audio,
            subtitles_path,
            quality,
            task_dir
        )
        
        return {"task_id": task_id, "status": "completed", "output_file": output_path}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download/{task_id}")
async def download_result(task_id: str):
    task_dir = os.path.join(TEMP_DIR, task_id)
    output_path = os.path.join(task_dir, "output.mp4")
    
    if not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        output_path,
        media_type="video/mp4",
        filename="translated_video.mp4"
    )