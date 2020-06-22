import express from 'express';

const router = express.Router();

router.get('/hello-world', (req, res) => res.send('Hello world!'));

export default router;
