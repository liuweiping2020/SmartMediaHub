import { Router } from 'express';
import { getContents, getContent, addContent, updateContent, publishContent, deleteContent } from '../controllers/contentController';

const router = Router();

router.get('/', getContents);
router.get('/:id', getContent);
router.post('/', addContent);
router.put('/:id', updateContent);
router.post('/:id/publish', publishContent);
router.delete('/:id', deleteContent);

export default router; 