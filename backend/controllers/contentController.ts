import { Request, Response } from 'express';
import Content from '../models/Content';

export const getContents = async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const contents = await Content.find({ userId }).sort({ createdAt: -1 });
  res.json(contents);
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

export const deleteContent = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Content.findByIdAndDelete(id);
  res.status(200).json({ message: '内容删除成功' });
}; 