import { Router } from 'express';
import { getPlatformAccounts, addPlatformAccount, deletePlatformAccount } from '../controllers/platformAccountController';

const router = Router();

router.get('/', getPlatformAccounts);
router.post('/', addPlatformAccount);
router.delete('/:id', deletePlatformAccount);

export default router; 