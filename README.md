Требования:
Node.js (v16+)

Python (3.8+)

FFmpeg (должен быть в PATH)

Установка:
Клонируйте репозиторий:

bash
git clone https://github.com/yourusername/video-translator.git
cd video-translator
Установите и запустите бекенд:

bash
cd backend
python -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate
pip install -r requirements.txt

# Создайте .env файл с вашим API ключом OpenAI
echo "OPENAI_API_KEY=ваш_ключ" > .env

# Запустите сервер
uvicorn main:app --reload
Установите и запустите фронтенд:

bash
cd ../frontend
npm install
npm start
Для разработки с Electron:

bash
npm run electron-start
Сборка приложения:

Для сборки production версии:

bash
npm run build
npm run electron-pack
Собранные версии будут в папке dist/