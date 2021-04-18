import express from 'express';

import CragModel from '../models/Crag';
import permissions from '../middleware/express/permissions';

const router = express.Router();

router.get('/', async (req, res) => {
    const crags = await CragModel.find({});

    return res.json({ crags });
});

router.get('/recursive', async (req, res) => {
    const crags = await CragModel.find().populate({
        path: 'sectors',
        populate: { path: 'routes' },
    });

    return res.json(crags);
});

router.put('/', permissions.write, async (req, res) => {
    const {
        body: { data },
    } = req;

    const crag = await CragModel.findOneAndUpdate(
        { _id: data._id },
        { ...data },
        { new: true }
    );

    return res.json({ crag });
});

export default router;
