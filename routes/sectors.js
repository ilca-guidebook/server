import express from 'express';
import SectorModel from '../models/Sector';

const router = express.Router();

router.get('/', async (req, res) => {
    const sectors = await SectorModel.find({});

    return res.json({ sectors });
});

router.post('/', async (req, res) => {
    const { data } = req.body;
    const sector = await new SectorModel({ ...data }).save();

    return res.json({ sector });
});

router.put('/', async (req, res) => {
    const { data } = req.body;
    const sector = await SectorModel.findOneAndUpdate(
        { _id: data._id },
        { ...data },
        { new: true },
    );

    return res.json({ sector });
});

export default router;
