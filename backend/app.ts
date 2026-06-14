import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes';
import platformAccountRoutes from './routes/platformAccountRoutes';
import contentRoutes from './routes/contentRoutes';
import scheduledPublishRoutes from './routes/scheduledPublishRoutes';
import statisticsRoutes from './routes/statisticsRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import deepseekRoutes from './routes/deepseekRoutes';
import qwenRoutes from './routes/qwenRoutes';
import openaiRoutes from './routes/openaiRoutes';
import geminiRoutes from './routes/geminiRoutes';
import ttsRoutes from './routes/ttsRoutes';
import asrRoutes from './routes/asrRoutes';
import videoGenRoutes from './routes/videoGenRoutes';
import depsRoutes from './routes/depsRoutes';

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartmediahub';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB 连接成功'))
  .catch((err) => console.error('MongoDB 连接失败:', err));

app.use('/api/users', userRoutes);
app.use('/api/platform-accounts', platformAccountRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/scheduled-publish', scheduledPublishRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/deepseek', deepseekRoutes);
app.use('/api/qwen', qwenRoutes);
app.use('/api/openai', openaiRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/asr', asrRoutes);
app.use('/api/video-gen', videoGenRoutes);
app.use('/api/deps', depsRoutes);

app.get('/', (req, res) => {
  res.send('欢迎使用智媒通（SmartMediaHub）API！');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SmartMediaHub 后端服务已启动，端口：${PORT}`);
}); 