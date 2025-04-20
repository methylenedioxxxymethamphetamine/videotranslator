import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [translationMode, setTranslationMode] = useState('both');
  const [quality, setQuality] = useState('high');
  const [taskId, setTaskId] = useState(null);
  const [history, setHistory] = useState([]);
  const videoRef = useRef(null);

  // Загружаем историю из localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('translationHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    
    // Проверяем предпочтения темы
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);

  // Сохраняем историю в localStorage
  useEffect(() => {
    localStorage.setItem('translationHistory', JSON.stringify(history));
  }, [history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url || isProcessing) return;

    setIsProcessing(true);
    setProgress(0);
    setProgressText('Начинаем обработку...');

    try {
      // Имитация прогресса для демонстрации
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      // Обновляем текст прогресса
      const progressStages = [
        'Загрузка видео...',
        'Извлечение аудио...',
        'Транскрибация...',
        'Перевод текста...',
        'Синтез речи...',
        'Генерация субтитров...',
        'Сборка видео...'
      ];
      
      let stage = 0;
      const textInterval = setInterval(() => {
        setProgressText(progressStages[stage]);
        stage = (stage + 1) % progressStages.length;
      }, 2000);

      // Отправляем запрос на бекенд
      const response = await axios.post('http://localhost:8000/process_video', {
        url,
        translate_audio: translationMode === 'audio' || translationMode === 'both',
        add_subtitles: translationMode === 'subtitles' || translationMode === 'both',
        quality
      });

      clearInterval(progressInterval);
      clearInterval(textInterval);
      
      setProgress(100);
      setProgressText('Готово!');
      setTaskId(response.data.task_id);
      
      // Добавляем в историю
      setHistory(prev => [
        {
          id: response.data.task_id,
          url,
          date: new Date().toISOString(),
          mode: translationMode,
          quality
        },
        ...prev.slice(0, 9)
      ]);

      // Воспроизводим звук уведомления
      new Audio('/notification.mp3').play();
      
    } catch (error) {
      console.error('Ошибка:', error);
      setProgressText(`Ошибка: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!taskId) return;
    window.open(`http://localhost:8000/download/${taskId}`, '_blank');
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleHistoryClick = (item) => {
    setUrl(item.url);
    setTranslationMode(item.mode);
    setQuality(item.quality);
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <button className="theme-toggle" onClick={toggleTheme}>
        {darkMode ? '☀️' : '🌙'}
      </button>

      <motion.div 
        className="container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="title">Видео Переводчик</h1>
        <p className="subtitle">Переводим видео на русский с ИИ</p>

        <form onSubmit={handleSubmit} className="url-form">
          <motion.div 
            className="input-container"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Вставьте ссылку на видео (YouTube, Vimeo и др.)"
              className="url-input"
              disabled={isProcessing}
            />
            <button 
              type="submit" 
              className="submit-button"
              disabled={!url || isProcessing}
            >
              {isProcessing ? 'Обработка...' : 'Перевести'}
            </button>
          </motion.div>
        </form>

        <div className="options">
          <div className="option-group">
            <label>Режим перевода:</label>
            <select 
              value={translationMode} 
              onChange={(e) => setTranslationMode(e.target.value)}
              disabled={isProcessing}
            >
              <option value="both">Озвучка + субтитры</option>
              <option value="audio">Только озвучка</option>
              <option value="subtitles">Только субтитры</option>
            </select>
          </div>

          <div className="option-group">
            <label>Качество:</label>
            <select 
              value={quality} 
              onChange={(e) => setQuality(e.target.value)}
              disabled={isProcessing}
            >
              <option value="high">Высокое</option>
              <option value="medium">Среднее</option>
              <option value="low">Низкое</option>
            </select>
          </div>
        </div>

        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              className="progress-container"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="progress-text">{progressText}</div>
              <div className="progress-bar">
                <motion.div 
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="progress-percent">{Math.round(progress)}%</div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {taskId && !isProcessing && (
            <motion.div 
              className="result-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3>Перевод готов!</h3>
              <div className="video-preview">
                <video 
                  ref={videoRef}
                  src={`http://localhost:8000/download/${taskId}`}
                  controls
                  className="video-player"
                />
              </div>
              <button 
                onClick={handleDownload}
                className="download-button"
              >
                Скачать видео
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {history.length > 0 && (
          <div className="history-section">
            <h3>История переводов</h3>
            <ul className="history-list">
              {history.map((item) => (
                <motion.li
                  key={item.id}
                  className="history-item"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleHistoryClick(item)}
                >
                  <div className="history-url">{item.url}</div>
                  <div className="history-meta">
                    {new Date(item.date).toLocaleString()} • {item.mode} • {item.quality}
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default App;