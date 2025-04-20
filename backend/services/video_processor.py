import os
import subprocess
from pytube import YouTube
import ffmpeg
from typing import Optional

async def download_video(url: str, output_dir: str) -> str:
    """Скачивает видео с YouTube или других платформ"""
    try:
        yt = YouTube(url)
        stream = yt.streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc().first()
        output_path = os.path.join(output_dir, "original.mp4")
        stream.download(output_path=output_dir, filename="original.mp4")
        return output_path
    except Exception as e:
        raise Exception(f"Ошибка загрузки видео: {str(e)}")

async def extact_audio(video_path: str, output_dir: str) -> str:
    """Извлекает аудио из видео"""
    output_path = os.path.join(output_dir, "original_audio.wav")
    try:
        (
            ffmpeg
            .input(video_path)
            .output(output_path, acodec='pcm_s16le', ar='16000')
            .run(quiet=True)
        )
        return output_path
    except Exception as e:
        raise Exception(f"Ошибка извлечения аудио: {str(e)}")

async def generate_subtitles(text: str, output_dir: str) -> str:
    """Генерирует файл субтитров"""
    output_path = os.path.join(output_dir, "subtitles.srt")
    # Здесь должна быть логика генерации .srt файла
    return output_path

async def combine_video(
    video_path: str,
    audio_path: Optional[str],
    subtitles_path: Optional[str],
    quality: str,
    output_dir: str
) -> str:
    """Собирает финальное видео с переводами"""
    output_path = os.path.join(output_dir, "output.mp4")
    
    video_stream = ffmpeg.input(video_path).video
    
    if audio_path:
        audio_stream = ffmpeg.input(audio_path).audio
    else:
        audio_stream = ffmpeg.input(video_path).audio
    
    if quality == "low":
        video_stream = video_stream.filter('scale', w='640', h='360')
    
    streams = [video_stream, audio_stream]
    
    if subtitles_path:
        subtitles = ffmpeg.input(subtitles_path)
        streams.append(subtitles)
    
    (
        ffmpeg
        .concat(*streams, v=1, a=1)
        .output(output_path, vcodec='libx264', acodec='aac')
        .run(quiet=True)
    )
    
    return output_path