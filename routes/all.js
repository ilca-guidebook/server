import express from 'express';

import CragModel from '../models/Crag';

const router = express.Router();

router.get('/', async (req, res) => {
    const data = await CragModel.find().populate({
        path: 'sectors',
        populate: { path: 'routes' },
    });

    return res.json({ data });
});

export default router;
