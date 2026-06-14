import { Router } from 'express';
import { getContents, addContent, updateContent, deleteContent } from '../controllers/contentController';

const router = Router();

router.get('/', getContents);
router.post('/', addContent);
router.put('/:id', updateContent);
router.delete('/:id', deleteContent);

export default router; 