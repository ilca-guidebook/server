import express from 'express';

import CragModel from '../models/Crag';
import permissions from '../middleware/express/permissions';

const router = express.Router();

router.get('/', async (req, res) => {
    const crags = await CragModel.find({});

    return res.json({ crags });
});

router.post('/', permissions.write, async (req, res) => {
    const { body: { data } } = req;

    const crag = await new CragModel({ ...data }).save();

    return res.json({ crag });
});

router.put('/', permissions.write, async (req, res) => {
    const { body: { data } } = req;

    const crag = await CragModel.findOneAndUpdate(
        { _id: data._id },
        { ...data },
        { new: true },
    );

    return res.json({ crag });
});

export default router;
