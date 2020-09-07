import express from 'express';
import CragModel from '../models/Crag';

const router = express.Router();

router.get('/', async (req, res) => {
    const crags = await CragModel.find({});

    return res.json({ crags });
});

router.post('/', async (req, res) => {
    const { data } = req.body;
    const crag = await new CragModel({ ...data }).save();

    return res.json({ crag });
});

router.put('/', async (req, res) => {
    const { data } = req.body;
    const crag = await CragModel.findOneAndUpdate(
        { _id: data._id },
        { ...data },
        { new: true },
    );

    return res.json({ crag });
});

export default router;
