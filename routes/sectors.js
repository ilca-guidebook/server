import express from 'express';

import SectorModel from '../models/Sector';
import permissions from '../middleware/express/permissions';

const router = express.Router();

router.get('/', async (req, res) => {
    const sectors = await SectorModel.find({});

    return res.json({ sectors });
});

router.post('/', permissions.write, async (req, res) => {
    const { body: { data } } = req;

    const sector = await new SectorModel({ ...data }).save();

    return res.json({ sector });
});

router.put('/', permissions.write, async (req, res) => {
    const { body: { data } } = req;

    const sector = await SectorModel.findOneAndUpdate(
        { _id: data._id },
        { ...data },
        { new: true },
    );

    return res.json({ sector });
});

export default router;
