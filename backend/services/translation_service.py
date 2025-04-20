from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def translate(text: str) -> str:
    """Переводит текст на русский с помощью GPT"""
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a professional translator. Translate the following text to Russian while preserving the meaning and tone."},
                {"role": "user", "content": text}
            ],
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"Ошибка перевода: {str(e)}")