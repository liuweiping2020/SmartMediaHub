import React, { useRef, useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Box, Button, Stack, Tooltip, Dialog, DialogTitle, DialogContent, TextField, DialogActions, IconButton, Typography, Chip, Alert, Card, CardContent, Link } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import MovieIcon from '@mui/icons-material/Movie';
import MicIcon from '@mui/icons-material/Mic';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const toolbarStyle = {
  background: 'linear-gradient(90deg, #0ff 0%, #09f 100%)',
  borderRadius: 12,
  padding: 8,
  marginBottom: 16,
  boxShadow: '0 2px 12px #0ff3',
  display: 'flex',
  gap: 12,
  alignItems: 'center',
};

interface ContentItem {
  _id: string;
  title: string;
  content: string;
  status: string;
  platforms: string[];
  createdAt: string;
}

interface RichMediaEditorProps {
  editId?: string;
}

const RichMediaEditor: React.FC<RichMediaEditorProps> = ({ editId }) => {
  const navigate = useNavigate();
  const quillRef = useRef<any>(null);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentContentId, setCurrentContentId] = useState<string | null>(editId || null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [publishStatus, setPublishStatus] = useState<Record<string, { status: string; message: string; postUrl?: string; publishedAt?: string }>>({});

  const PLATFORMS = ['头条号', '微信公众号', '抖音', '小红书', '哔哩哔哩', '百家号', '快手', '视频号'];

  // 弹窗状态
  const [imgOpen, setImgOpen] = useState(false);
  const [imgPrompt, setImgPrompt] = useState('');
  const [audioOpen, setAudioOpen] = useState(false);
  const [audioPrompt, setAudioPrompt] = useState('');
  const [asrOpen, setAsrOpen] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [img2VideoOpen, setImg2VideoOpen] = useState(false);
  const [img2VideoUrl, setImg2VideoUrl] = useState('');
  const [img2VideoPrompt, setImg2VideoPrompt] = useState('');
  const [localImgOpen, setLocalImgOpen] = useState(false);
  const [localImgFile, setLocalImgFile] = useState<File | null>(null);
  const [fileOpen, setFileOpen] = useState(false);
  const [fileType, setFileType] = useState<'audio'|'video'|'md'|'doc'|'pdf'|''>('');
  const [fileObj, setFileObj] = useState<File|null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
    }
    if (editId) {
      loadContent(editId);
    }
  }, []);

  const loadContent = async (id: string) => {
    try {
      const res = await axios.get(`/api/contents?userId=${localStorage.getItem('userId')}`);
      const content = res.data.find((c: ContentItem) => c._id === id);
      if (content) {
        setTitle(content.title);
        setCurrentContentId(content._id);
        setSelectedPlatforms(content.platforms || []);
        if ((content as any).publishStatus) {
          const statusObj: Record<string, any> = {};
          const raw = (content as any).publishStatus;
          if (raw instanceof Map) {
            raw.forEach((value, key) => { statusObj[key] = value; });
          } else if (typeof raw === 'object') {
            for (const key of Object.keys(raw)) {
              statusObj[key] = raw[key];
            }
          }
          setPublishStatus(statusObj);
        }
        if (quillRef.current) {
          quillRef.current.getEditor().root.innerHTML = content.content;
        }
      }
    } catch (error) {
      console.error('加载内容失败', error);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setMessage({ type: 'error', text: '请输入标题' });
      return;
    }
    const content = quillRef.current?.getEditor().root.innerHTML || '';
    if (!content.trim() || content === '<p><br></p>') {
      setMessage({ type: 'error', text: '请输入内容' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const userId = localStorage.getItem('userId');
      if (currentContentId) {
        await axios.put(`/api/contents/${currentContentId}`, {
          userId, title, content, platforms: selectedPlatforms, status: 'draft'
        });
        setMessage({ type: 'success', text: '保存成功' });
      } else {
        const res = await axios.post('/api/contents', {
          userId, title, content, platforms: selectedPlatforms, status: 'draft'
        });
        setCurrentContentId(res.data._id);
        setMessage({ type: 'success', text: '保存成功' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      setMessage({ type: 'error', text: '请输入标题' });
      return;
    }
    const content = quillRef.current?.getEditor().root.innerHTML || '';
    if (!content.trim() || content === '<p><br></p>') {
      setMessage({ type: 'error', text: '请输入内容' });
      return;
    }
    if (selectedPlatforms.length === 0) {
      setMessage({ type: 'error', text: '请选择至少一个发布平台' });
      return;
    }

    setPublishing(true);
    setMessage(null);

    const pendingStatus: Record<string, any> = {};
    for (const p of selectedPlatforms) {
      pendingStatus[p] = { status: 'pending', message: '发布中...' };
    }
    setPublishStatus(prev => ({ ...prev, ...pendingStatus }));

    try {
      const userId = localStorage.getItem('userId');
      let contentId = currentContentId;

      if (!contentId) {
        const createRes = await axios.post('/api/contents', {
          userId, title, content, platforms: selectedPlatforms, status: 'draft'
        });
        contentId = createRes.data._id;
        setCurrentContentId(contentId);
      } else {
        await axios.put(`/api/contents/${contentId}`, {
          userId, title, content, platforms: selectedPlatforms
        });
      }

      const publishRes = await axios.post(`/api/contents/${contentId}/publish`, {
        platforms: selectedPlatforms,
        userId,
      });

      const results = publishRes.data.results || {};
      setPublishStatus(prev => ({ ...prev, ...results }));

      const successCount = Object.values(results).filter((r: any) => r.status === 'success').length;
      const failedCount = Object.values(results).filter((r: any) => r.status === 'failed').length;

      if (failedCount === 0) {
        setMessage({ type: 'success', text: `成功发布到 ${successCount} 个平台！` });
      } else {
        setMessage({ type: 'error', text: `发布完成：成功 ${successCount} 个，失败 ${failedCount} 个` });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || '发布失败' });
      const failedStatus: Record<string, any> = {};
      for (const p of selectedPlatforms) {
        failedStatus[p] = { status: 'failed', message: '发布请求失败' };
      }
      setPublishStatus(prev => ({ ...prev, ...failedStatus }));
    } finally {
      setPublishing(false);
    }
  };

  const handleClear = () => {
    setTitle('');
    if (quillRef.current) {
      quillRef.current.getEditor().root.innerHTML = '';
    }
    setCurrentContentId(null);
    setSelectedPlatforms([]);
    setMessage(null);
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // AI生成图片
  const handleAIGenerateImage = async () => {
    try {
      const res = await fetch('/api/multimodal-image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imgPrompt, provider: 'openai' })
      });
      const data = await res.json();
      const quill = quillRef.current.getEditor();
      quill.insertEmbed(quill.getSelection().index, 'image', data.url || data.data?.[0]?.url);
      setImgOpen(false);
      setImgPrompt('');
    } catch (error) {
      setMessage({ type: 'error', text: 'AI图片生成失败' });
    }
  };
  // AI生成语音
  const handleAIGenerateAudio = async () => {
    try {
      const res = await fetch('/api/tts/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: audioPrompt })
      });
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const quill = quillRef.current.getEditor();
      quill.insertEmbed(quill.getSelection().index, 'audio', audioUrl);
      setAudioOpen(false);
      setAudioPrompt('');
    } catch (error) {
      setMessage({ type: 'error', text: 'AI语音生成失败' });
    }
  };
  // 语音转文字
  const handleASR = async () => {
    if (!audioFile) return;
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      const res = await fetch('/api/asr/openai', { method: 'POST', body: formData });
      const data = await res.json();
      const quill = quillRef.current.getEditor();
      quill.insertText(quill.getSelection().index, data.text || data.result || '');
      setAsrOpen(false);
      setAudioFile(null);
    } catch (error) {
      setMessage({ type: 'error', text: '语音识别失败' });
    }
  };
  // 图片转视频
  const handleImage2Video = async () => {
    try {
      const res = await fetch('/api/video-gen/image2video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: img2VideoUrl, prompt: img2VideoPrompt, apiUrl: '', apiKey: '' })
      });
      const data = await res.json();
      const quill = quillRef.current.getEditor();
      quill.insertEmbed(quill.getSelection().index, 'video', data.videoUrl || data.url);
      setImg2VideoOpen(false);
      setImg2VideoUrl('');
      setImg2VideoPrompt('');
    } catch (error) {
      setMessage({ type: 'error', text: '图片转视频失败' });
    }
  };
  // 本地图片上传处理
  const handleLocalImgUpload = async () => {
    if (!localImgFile) return;
    const reader = new FileReader();
    reader.onload = () => {
      const quill = quillRef.current.getEditor();
      quill.insertEmbed(quill.getSelection().index, 'image', reader.result as string);
      setLocalImgOpen(false);
      setLocalImgFile(null);
    };
    reader.readAsDataURL(localImgFile);
  };
  const handleFileUpload = async () => {
    if (!fileObj) return;
    const quill = quillRef.current.getEditor();
    if (fileType === 'audio') {
      const url = URL.createObjectURL(fileObj);
      quill.insertEmbed(quill.getSelection().index, 'audio', url);
    } else if (fileType === 'video') {
      const url = URL.createObjectURL(fileObj);
      quill.insertEmbed(quill.getSelection().index, 'video', url);
    } else if (fileType === 'md') {
      const text = await fileObj.text();
      quill.insertText(quill.getSelection().index, text);
    } else if (fileType === 'doc' || fileType === 'docx' || fileType === 'pdf') {
      const url = URL.createObjectURL(fileObj);
      quill.insertText(quill.getSelection().index, `[${fileObj.name}](${url})`);
    }
    setFileOpen(false);
    setFileObj(null);
    setFileType('');
  };

  return (
    <Box sx={{ background: '#101c2c', borderRadius: 4, boxShadow: '0 4px 24px #0ff2', p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <SmartToyIcon sx={{ fontSize: 32, color: '#0ff' }} />
        <Typography variant="h5" sx={{ color: '#0ff', fontWeight: 700 }}>智能富媒体内容创作</Typography>
      </Stack>

      {/* 消息提示 */}
      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {/* 标题输入 */}
      <TextField
        fullWidth
        label="文章标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{
          mb: 2,
          '& .MuiInputLabel-root': { color: '#0ff' },
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#0ff' },
            '&:hover fieldset': { borderColor: '#fff' },
            '&.Mui-focused fieldset': { borderColor: '#0ff' },
            color: '#fff',
          },
        }}
      />

      {/* AI工具栏 */}
      <Stack direction="row" sx={toolbarStyle}>
        <Tooltip title="AI生成图片" arrow>
          <IconButton color="primary" onClick={() => setImgOpen(true)}><ImageIcon /></IconButton>
        </Tooltip>
        <Tooltip title="AI生成语音" arrow>
          <IconButton color="primary" onClick={() => setAudioOpen(true)}><VolumeUpIcon /></IconButton>
        </Tooltip>
        <Tooltip title="语音转文字" arrow>
          <IconButton color="primary" onClick={() => setAsrOpen(true)}><MicIcon /></IconButton>
        </Tooltip>
        <Tooltip title="图片转视频" arrow>
          <IconButton color="primary" onClick={() => setImg2VideoOpen(true)}><MovieIcon /></IconButton>
        </Tooltip>
        <Tooltip title="本地图片上传" arrow>
          <IconButton color="primary" onClick={() => setLocalImgOpen(true)}><PhotoCamera /></IconButton>
        </Tooltip>
        <Tooltip title="上传文件" arrow>
          <IconButton color="primary" onClick={() => setFileOpen(true)}><AttachFileIcon /></IconButton>
        </Tooltip>
      </Stack>

      {/* 富文本编辑器 */}
      <ReactQuill ref={quillRef} theme="snow" style={{ minHeight: 320, background: '#18243a', color: '#fff', borderRadius: 8, marginBottom: 16 }} />

      {/* 发布平台选择 */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography sx={{ color: '#0ff', mb: 1, fontWeight: 600 }}>选择发布平台：</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {PLATFORMS.map((platform) => (
            <Chip
              key={platform}
              label={platform}
              onClick={() => togglePlatform(platform)}
              sx={{
                bgcolor: selectedPlatforms.includes(platform) ? '#0ff' : 'rgba(0,255,255,0.1)',
                color: selectedPlatforms.includes(platform) ? '#101c2c' : '#0ff',
                fontWeight: 600,
                border: '1px solid #0ff',
                cursor: 'pointer',
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* 逐平台发布状态 */}
      {Object.keys(publishStatus).length > 0 && (
        <Card sx={{ bgcolor: 'rgba(0, 255, 255, 0.05)', borderRadius: 2, mb: 3, border: '1px solid rgba(0, 255, 255, 0.2)' }}>
          <CardContent>
            <Typography sx={{ color: '#0ff', fontWeight: 600, mb: 2 }}>平台发布状态：</Typography>
            {Object.entries(publishStatus).map(([platform, status]) => (
              <Box key={platform} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography sx={{ color: '#fff' }}>{platform}</Typography>
                  <Chip
                    label={
                      status.status === 'success' ? '✓ 已发布' :
                      status.status === 'failed' ? '✗ 失败' :
                      '发布中...'
                    }
                    size="small"
                    sx={{
                      bgcolor: status.status === 'success' ? '#4caf50' :
                               status.status === 'failed' ? '#ff6b6b' :
                               '#ff9800',
                      color: '#fff',
                      fontWeight: 600,
                    }}
                  />
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography sx={{ color: '#fff', opacity: 0.6, fontSize: 12 }}>{status.message}</Typography>
                  {status.postUrl && (
                    <Link href={status.postUrl} target="_blank" rel="noopener noreferrer" sx={{ color: '#0ff', fontSize: 12 }}>
                      查看
                    </Link>
                  )}
                  {status.publishedAt && (
                    <Typography sx={{ color: '#fff', opacity: 0.4, fontSize: 11 }}>
                      {new Date(status.publishedAt).toLocaleString('zh-CN')}
                    </Typography>
                  )}
                </Stack>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 操作按钮 */}
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          startIcon={<DeleteIcon />}
          onClick={handleClear}
          sx={{ color: '#ff6b6b', borderColor: '#ff6b6b' }}
        >
          清空
        </Button>
        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ color: '#0ff', borderColor: '#0ff' }}
        >
          {saving ? '保存中...' : '保存草稿'}
        </Button>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={handlePublish}
          disabled={publishing}
          sx={{
            bgcolor: '#0ff',
            color: '#101c2c',
            fontWeight: 'bold',
            '&:hover': { bgcolor: '#fff' }
          }}
        >
          {publishing ? '发布中...' : '发布'}
        </Button>
      </Stack>

      {/* AI生成图片弹窗 */}
      <Dialog open={imgOpen} onClose={() => setImgOpen(false)}>
        <DialogTitle>AI生成图片</DialogTitle>
        <DialogContent>
          <TextField label="请输入图片描述" fullWidth value={imgPrompt} onChange={e => setImgPrompt(e.target.value)} autoFocus sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImgOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleAIGenerateImage}>生成并插入</Button>
        </DialogActions>
      </Dialog>
      {/* AI生成语音弹窗 */}
      <Dialog open={audioOpen} onClose={() => setAudioOpen(false)}>
        <DialogTitle>AI生成语音</DialogTitle>
        <DialogContent>
          <TextField label="请输入要转为语音的文字" fullWidth value={audioPrompt} onChange={e => setAudioPrompt(e.target.value)} autoFocus sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAudioOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleAIGenerateAudio}>生成并插入</Button>
        </DialogActions>
      </Dialog>
      {/* 语音转文字弹窗 */}
      <Dialog open={asrOpen} onClose={() => setAsrOpen(false)}>
        <DialogTitle>语音转文字</DialogTitle>
        <DialogContent>
          <Button variant="outlined" component="label" sx={{ mt: 2 }}>
            上传音频文件
            <input type="file" accept="audio/*" hidden onChange={e => setAudioFile(e.target.files?.[0] || null)} />
          </Button>
          {audioFile && <Box sx={{ mt: 1, color: '#0ff' }}>{audioFile.name}</Box>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAsrOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleASR} disabled={!audioFile}>识别并插入</Button>
        </DialogActions>
      </Dialog>
      {/* 图片转视频弹窗 */}
      <Dialog open={img2VideoOpen} onClose={() => setImg2VideoOpen(false)}>
        <DialogTitle>图片转视频</DialogTitle>
        <DialogContent>
          <TextField label="图片URL" fullWidth value={img2VideoUrl} onChange={e => setImg2VideoUrl(e.target.value)} sx={{ mt: 2 }} />
          <TextField label="视频描述" fullWidth value={img2VideoPrompt} onChange={e => setImg2VideoPrompt(e.target.value)} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImg2VideoOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleImage2Video} disabled={!img2VideoUrl}>生成并插入</Button>
        </DialogActions>
      </Dialog>
      {/* 本地图片上传弹窗 */}
      <Dialog open={localImgOpen} onClose={() => setLocalImgOpen(false)}>
        <DialogTitle>本地图片上传</DialogTitle>
        <DialogContent>
          <Button variant="outlined" component="label" sx={{ mt: 2 }}>
            选择图片文件
            <input type="file" accept="image/*" hidden onChange={e => setLocalImgFile(e.target.files?.[0] || null)} />
          </Button>
          {localImgFile && <Box sx={{ mt: 1, color: '#0ff' }}>{localImgFile.name}</Box>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocalImgOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleLocalImgUpload} disabled={!localImgFile}>插入图片</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={fileOpen} onClose={() => setFileOpen(false)}>
        <DialogTitle>上传文件</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant={fileType==='audio'?'contained':'outlined'} onClick={()=>setFileType('audio')}>音频</Button>
            <Button variant={fileType==='video'?'contained':'outlined'} onClick={()=>setFileType('video')}>视频</Button>
            <Button variant={fileType==='md'?'contained':'outlined'} onClick={()=>setFileType('md')}>Markdown</Button>
            <Button variant={fileType==='doc'?'contained':'outlined'} onClick={()=>setFileType('doc')}>Word</Button>
            <Button variant={fileType==='pdf'?'contained':'outlined'} onClick={()=>setFileType('pdf')}>PDF</Button>
          </Stack>
          <Button variant="outlined" component="label" sx={{ mt: 2 }}>
            选择文件
            <input
              type="file"
              accept={
                fileType==='audio' ? 'audio/*' :
                fileType==='video' ? 'video/*' :
                fileType==='md' ? '.md' :
                fileType==='doc' ? '.doc,.docx' :
                fileType==='pdf' ? '.pdf' : '*'
              }
              hidden
              onChange={e => setFileObj(e.target.files?.[0] || null)}
            />
          </Button>
          {fileObj && <Box sx={{ mt: 1, color: '#0ff' }}>{fileObj.name}</Box>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFileOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleFileUpload} disabled={!fileObj || !fileType}>插入</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RichMediaEditor;
