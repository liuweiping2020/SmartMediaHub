import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Stack, Card, CardContent, Chip, List, ListItem, ListItemText, IconButton, Grid, Container } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ArticleIcon from '@mui/icons-material/Article';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RichMediaEditor from '../components/RichMediaEditor';

interface ContentItem {
  _id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  platforms: string[];
  createdAt: string;
}

const ContentPublish: React.FC = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    loadContents();
  }, []);

  const loadContents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/contents?userId=${userId}`);
      setItems(res.data);
    } catch (error) {
      console.error('加载内容列表失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该内容吗？')) return;
    try {
      await axios.delete(`/api/contents/${id}`);
      setItems(items.filter(item => item._id !== id));
    } catch (error) {
      console.error('删除失败', error);
    }
  };

  const handleEdit = (id: string) => {
    setEditId(id);
    setShowEditor(true);
  };

  const handleNew = () => {
    setEditId(null);
    setShowEditor(true);
  };

  const handleBackToList = () => {
    setShowEditor(false);
    setEditId(null);
    loadContents();
  };

  if (showEditor) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #101c2c 60%, #0ff 100%)',
        p: { xs: 2, md: 4 }
      }}>
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ color: '#0ff', fontWeight: 700 }}>
              {editId ? '编辑内容' : '新建内容'}
            </Typography>
            <Button variant="outlined" onClick={handleBackToList} sx={{ color: '#0ff', borderColor: '#0ff' }}>
              返回列表
            </Button>
          </Stack>
          <RichMediaEditor editId={editId || undefined} />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #101c2c 60%, #0ff 100%)',
      p: { xs: 2, md: 4 }
    }}>
      <Container maxWidth="md">
        {/* 顶部导航 */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <SmartToyIcon sx={{ fontSize: 32, color: '#0ff' }} />
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>智能内容创作</Typography>
          </Stack>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNew}
            sx={{ bgcolor: '#0ff', color: '#101c2c', fontWeight: 'bold' }}
          >
            新建内容
          </Button>
        </Stack>

        {/* 统计卡片 */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#18243a', borderRadius: 3, border: '1px solid rgba(0,255,255,0.3)' }}>
              <CardContent>
                <Typography sx={{ color: '#0ff', fontSize: 14 }}>总内容</Typography>
                <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700 }}>{items.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#18243a', borderRadius: 3, border: '1px solid rgba(0,255,255,0.3)' }}>
              <CardContent>
                <Typography sx={{ color: '#0ff', fontSize: 14 }}>已发布</Typography>
                <Typography variant="h3" sx={{ color: '#4caf50', fontWeight: 700 }}>
                  {items.filter(i => i.status === 'published').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#18243a', borderRadius: 3, border: '1px solid rgba(0,255,255,0.3)' }}>
              <CardContent>
                <Typography sx={{ color: '#0ff', fontSize: 14 }}>草稿</Typography>
                <Typography variant="h3" sx={{ color: '#ff9800', fontWeight: 700 }}>
                  {items.filter(i => i.status === 'draft').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 内容列表 */}
        <Card sx={{ bgcolor: '#18243a', borderRadius: 3, border: '1px solid rgba(0,255,255,0.3)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: '#0ff', mb: 2, fontWeight: 600 }}>内容列表</Typography>

            {loading ? (
              <Typography sx={{ color: '#fff', textAlign: 'center', py: 4, opacity: 0.7 }}>
                加载中...
              </Typography>
            ) : items.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <ArticleIcon sx={{ fontSize: 60, color: '#0ff', opacity: 0.4, mb: 2 }} />
                <Typography sx={{ color: '#fff', opacity: 0.7, mb: 2 }}>
                  暂无内容，点击右上角"新建内容"开始创作
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleNew}
                  sx={{ bgcolor: '#0ff', color: '#101c2c', fontWeight: 'bold' }}
                >
                  新建内容
                </Button>
              </Box>
            ) : (
              <List>
                {items.map((item) => (
                  <ListItem
                    key={item._id}
                    sx={{
                      bgcolor: 'rgba(0, 255, 255, 0.05)',
                      borderRadius: 2,
                      mb: 1,
                      border: '1px solid rgba(0, 255, 255, 0.1)',
                    }}
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          edge="end"
                          onClick={() => handleEdit(item._id)}
                          sx={{ color: '#0ff' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDelete(item._id)}
                          sx={{ color: '#ff6b6b' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    }
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>
                            {item.title || '未命名内容'}
                          </Typography>
                          <Chip
                            label={item.status === 'published' ? '已发布' : '草稿'}
                            size="small"
                            sx={{
                              bgcolor: item.status === 'published' ? '#4caf50' : '#ff9800',
                              color: '#fff',
                              fontWeight: 600
                            }}
                          />
                        </Stack>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ mb: 1 }}>
                            {item.platforms && item.platforms.length > 0 ? (
                              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                {item.platforms.map((p: string) => {
                                  const itemAny = item as any;
                                  let statusInfo: any = null;
                                  if (itemAny.publishStatus) {
                                    if (itemAny.publishStatus instanceof Map) {
                                      statusInfo = itemAny.publishStatus.get(p);
                                    } else if (typeof itemAny.publishStatus === 'object') {
                                      statusInfo = itemAny.publishStatus[p];
                                    }
                                  }
                                  const labelBase = p;
                                  const hasPublished = statusInfo && statusInfo.status === 'success';
                                  const hasFailed = statusInfo && statusInfo.status === 'failed';
                                  return (
                                    <Chip
                                      key={p}
                                      label={
                                        hasPublished ? `✓ ${labelBase}` :
                                        hasFailed ? `✗ ${labelBase}` :
                                        labelBase
                                      }
                                      size="small"
                                      sx={{
                                        bgcolor: hasPublished ? 'rgba(76, 175, 80, 0.3)' :
                                                 hasFailed ? 'rgba(255, 107, 107, 0.3)' :
                                                 'rgba(0, 255, 255, 0.15)',
                                        color: hasPublished ? '#81c784' :
                                               hasFailed ? '#ff8a80' :
                                               '#0ff',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        mr: 0.5,
                                        mb: 0.5,
                                      }}
                                    />
                                  );
                                })}
                              </Stack>
                            ) : (
                              <Typography sx={{ color: '#fff', opacity: 0.5, fontSize: 12 }}>
                                未选择发布平台
                              </Typography>
                            )}
                          </Box>
                          <Typography sx={{ color: '#fff', opacity: 0.5, fontSize: 12 }}>
                            创建时间：{new Date(item.createdAt).toLocaleString('zh-CN')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ContentPublish;
