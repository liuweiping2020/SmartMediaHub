import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Stack, List, ListItem, ListItemText, IconButton, Container } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface PlatformAccount {
  _id: string;
  platform: string;
  username: string;
}

const PLATFORMS = ['头条号', '微信公众号', '抖音', '小红书', '哔哩哔哩', '百家号', '快手', '视频号'];

const PlatformAccounts: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<PlatformAccount[]>([]);
  const [platform, setPlatform] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`/api/platform-accounts?userId=${userId}`);
      setAccounts(response.data);
    } catch (error) {
      console.error('获取账号列表失败', error);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform || !username) return;
    setLoading(true);
    try {
      await axios.post('/api/platform-accounts', { userId, platform, username });
      setPlatform('');
      setUsername('');
      fetchAccounts();
    } catch (error) {
      console.error('添加账号失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await axios.delete(`/api/platform-accounts/${id}`);
      setAccounts(accounts.filter(account => account._id !== id));
    } catch (error) {
      console.error('删除账号失败', error);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100vw',
      overflowX: 'hidden',
      background: 'linear-gradient(120deg, #101c2c 60%, #0ff 100%)',
      p: { xs: 2, md: 4 }
    }}>
      {/* 顶部导航 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <CloudUploadIcon sx={{ fontSize: 40, color: '#0ff' }} />
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>平台账号管理</Typography>
        </Stack>
        <Button
          onClick={() => navigate('/dashboard')}
          sx={{ color: '#0ff' }}
        >
          返回首页
        </Button>
      </Stack>

      <Container maxWidth="md">
        {/* 添加账号表单 */}
        <Card sx={{ bgcolor: '#18243a', borderRadius: 3, mb: 4, border: '1px solid rgba(0, 255, 255, 0.3)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: '#0ff', mb: 2 }}>添加账号</Typography>
            <Box component="form" onSubmit={handleAddAccount}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  fullWidth
                  label="选择平台"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  SelectProps={{ native: true }}
                  InputLabelProps={{ sx: { color: '#0ff' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#0ff' },
                      '&:hover fieldset': { borderColor: '#fff' },
                      '&.Mui-focused fieldset': { borderColor: '#0ff' },
                      color: '#fff',
                    },
                  }}
                >
                  <option value="">请选择平台</option>
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="账号名称"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  InputLabelProps={{ sx: { color: '#0ff' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#0ff' },
                      '&:hover fieldset': { borderColor: '#fff' },
                      '&.Mui-focused fieldset': { borderColor: '#0ff' },
                      color: '#fff',
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={loading || !platform || !username}
                  sx={{
                    bgcolor: '#0ff',
                    color: '#101c2c',
                    fontWeight: 'bold',
                    minWidth: 120,
                    '&:hover': { bgcolor: '#fff' }
                  }}
                >
                  添加
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* 账号列表 */}
        <Card sx={{ bgcolor: '#18243a', borderRadius: 3, border: '1px solid rgba(0, 255, 255, 0.3)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: '#0ff', mb: 2 }}>
              已绑定的账号 ({accounts.length})
            </Typography>
            {accounts.length === 0 ? (
              <Typography sx={{ color: '#fff', opacity: 0.7, textAlign: 'center', py: 4 }}>
                暂无已绑定的账号，请在上方添加
              </Typography>
            ) : (
              <List>
                {accounts.map((account, index) => (
                  <ListItem
                    key={account._id}
                    sx={{
                      bgcolor: 'rgba(0, 255, 255, 0.05)',
                      borderRadius: 2,
                      mb: 1,
                      border: '1px solid rgba(0, 255, 255, 0.1)',
                    }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteAccount(account._id)}
                        sx={{ color: '#ff6b6b' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ color: '#0ff', fontWeight: 600 }}>
                          {account.platform}
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ color: '#fff', opacity: 0.8 }}>
                          {account.username}
                        </Typography>
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

export default PlatformAccounts;
