import { Request, Response } from 'express';
import Content from '../models/Content';
import { publishToPlatform } from '../services/platformPublishService';

export const getContents = async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const contents = await Content.find({ userId }).sort({ createdAt: -1 });
  res.json(contents);
};

export const getContent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const content = await Content.findById(id);
  res.json(content);
};

export const addContent = async (req: Request, res: Response) => {
  const { userId, title, content, type, fileUrl, platforms, scheduledTime, status } = req.body;
  const newContent = new Content({ userId, title, content, type, fileUrl, platforms, scheduledTime, status: status || 'draft' });
  await newContent.save();
  res.status(201).json(newContent);
};

export const updateContent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, type, fileUrl, platforms, scheduledTime, status } = req.body;
  const updated = await Content.findByIdAndUpdate(
    id,
    { title, content, type, fileUrl, platforms, scheduledTime, status },
    { new: true }
  );
  res.json(updated);
};

export const publishContent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { platforms, userId } = req.body;

  const content = await Content.findById(id);
  if (!content) {
    return res.status(404).json({ message: '内容不存在' });
  }

  const targets = (platforms && platforms.length > 0) ? platforms : (content.platforms || []);
  if (targets.length === 0) {
    return res.status(400).json({ message: '请选择发布平台' });
  }

  const results: Record<string, any> = {};
  const existingPublishStatus: any = (content as any).publishStatus || {};

  for (const platform of targets) {
    const result = await publishToPlatform(
      platform,
      content.title,
      content.content,
      (content as any).type || 'article',
      userId || (content as any).userId
    );
    results[platform] = {
      status: result.status,
      message: result.message,
      postUrl: result.postUrl,
      publishedAt: result.status === 'success' ? new Date() : null,
    };
  }

  const updated = await Content.findByIdAndUpdate(
    id,
    {
      status: 'published',
      publishStatus: { ...existingPublishStatus, ...results },
      platforms: Array.from(new Set([...((content as any).platforms || []), ...targets])),
    },
    { new: true }
  );

  res.json({
    message: '发布流程完成',
    results,
    content: updated,
  });
};

export const deleteContent = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Content.findByIdAndDelete(id);
  res.status(200).json({ message: '内容删除成功' });
}; 