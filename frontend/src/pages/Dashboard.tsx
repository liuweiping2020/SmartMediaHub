import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Avatar, Stack } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ArticleIcon from '@mui/icons-material/Article';
import BarChartIcon from '@mui/icons-material/BarChart';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    // Optionally, navigate to the login page after logout
    navigate('/login');
  };

  const handleProtectedClick = (path: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', background: 'linear-gradient(120deg, #101c2c 60%, #0ff 100%)', p: { xs: 2, md: 4 } }}>
      {/* 顶部导航 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar src="/assets/logo.svg" sx={{ width: 48, height: 48, bgcolor: '#0ff' }} />
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, letterSpacing: 2 }}>智媒通 SmartMediaHub</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {isAuthenticated ? (
            <>
              <Button color="inherit" startIcon={<SettingsIcon />} sx={{ color: '#0ff' }}>设置</Button>
              <Avatar sx={{ bgcolor: '#0ff', color: '#101c2c' }}>U</Avatar>
              <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ color: '#0ff' }}>
                退出
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" startIcon={<LoginIcon />} onClick={() => navigate('/login')} sx={{ color: '#0ff' }}>
                登录
              </Button>
              <Button color="inherit" startIcon={<PersonAddIcon />} onClick={() => navigate('/register')} sx={{ color: '#0ff' }}>
                注册
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      {/* 快速入口和欢迎语整体居中容器 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: { xs: 400, md: 420 }, width: '100%' }}>
        {/* 快速入口卡片 */}
        <Grid container spacing={3} sx={{ mb: 4, maxWidth: 1200 }} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#18243a', color: '#0ff', borderRadius: 3, boxShadow: 3, cursor: 'pointer' }} onClick={() => handleProtectedClick('/content-publish')}>
              <CardContent>
                <SmartToyIcon sx={{ fontSize: 40 }} />
                <Typography variant="h6" sx={{ mt: 2 }}>智能内容创作</Typography>
                <Typography variant="body2" sx={{ color: '#fff', mt: 1 }}>AI驱动富媒体编辑器，支持多模态内容生成</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#18243a', color: '#0ff', borderRadius: 3, boxShadow: 3, cursor: 'pointer' }} onClick={() => handleProtectedClick('/platform-accounts')}>
              <CardContent>
                <CloudUploadIcon sx={{ fontSize: 40 }} />
                <Typography variant="h6" sx={{ mt: 2 }}>平台账号管理</Typography>
                <Typography variant="body2" sx={{ color: '#fff', mt: 1 }}>绑定/管理头条、抖音、公众号等账号</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#18243a', color: '#0ff', borderRadius: 3, boxShadow: 3, cursor: 'pointer' }} onClick={() => handleProtectedClick('/data-statistics')}>
              <CardContent>
                <BarChartIcon sx={{ fontSize: 40 }} />
                <Typography variant="h6" sx={{ mt: 2 }}>数据统计</Typography>
                <Typography variant="body2" sx={{ color: '#fff', mt: 1 }}>多平台展现量、收益、粉丝等数据一览</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#18243a', color: '#0ff', borderRadius: 3, boxShadow: 3, cursor: 'pointer' }} onClick={() => handleProtectedClick('/dependency-manager')}>
              <CardContent>
                <ArticleIcon sx={{ fontSize: 40 }} />
                <Typography variant="h6" sx={{ mt: 2 }}>依赖管理</Typography>
                <Typography variant="body2" sx={{ color: '#fff', mt: 1 }}>一键可视化管理项目依赖包</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* 欢迎语 */}
        <Box sx={{ mt: 2, color: '#fff', opacity: 0.8, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>欢迎使用智媒通，开启智能自媒体创作新体验！</Typography>
          <Typography variant="body2">如需帮助或建议，欢迎加入社区或提交反馈。</Typography>
        </Box>
      </Box>
      <Box sx={{ flex: 1 }} />
      <Box sx={{ width: '100%', mt: 8, mb: 0 }}>
        <hr style={{ border: 'none', borderTop: '2px solid #0ff', opacity: 0.2, margin: 0 }} />
      </Box>
      <Box sx={{ mt: 2, mb: 2, textAlign: 'center', color: '#0ff', fontWeight: 700, fontSize: 20, letterSpacing: 2, opacity: 0.9, position: 'relative', bottom: 0 }}>
        AI 码力出品，比属精品
      </Box>
    </Box>
  );
};

export default Dashboard; 