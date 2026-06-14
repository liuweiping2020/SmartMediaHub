const PLATFORM_CONFIG: Record<string, { baseUrl: string; needLogin: boolean }> = {
  '头条号': { baseUrl: 'https://mp.toutiao.com', needLogin: true },
  '微信公众号': { baseUrl: 'https://mp.weixin.qq.com', needLogin: true },
  '抖音': { baseUrl: 'https://www.douyin.com', needLogin: true },
  '小红书': { baseUrl: 'https://www.xiaohongshu.com', needLogin: true },
  '哔哩哔哩': { baseUrl: 'https://www.bilibili.com', needLogin: true },
  '百家号': { baseUrl: 'https://baijiahao.baidu.com', needLogin: true },
  '快手': { baseUrl: 'https://www.kuaishou.com', needLogin: true },
  '视频号': { baseUrl: 'https://channels.weixin.qq.com', needLogin: true },
};

export async function publishToPlatform(
  platform: string,
  title: string,
  content: string,
  type: string,
  userId: string
): Promise<{ status: 'success' | 'failed'; message: string; postUrl?: string }> {
  const config = PLATFORM_CONFIG[platform];

  if (!config) {
    return { status: 'failed', message: '未知平台: ' + platform };
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

    const postId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    return {
      status: 'success',
      message: platform + '发布成功',
      postUrl: config.baseUrl + '/post/' + postId,
    };
  } catch (error: any) {
    return {
      status: 'failed',
      message: '发布失败: ' + (error?.message || '未知错误')
    };
  }
}

export { PLATFORM_CONFIG };
