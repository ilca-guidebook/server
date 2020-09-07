import express from 'express';
import UserModel from '../models/Crag';

const router = express.Router();

router.get('/', async (req, res) => {
    const users = await UserModel.find({});

    return res.json({ users });
});

router.post('/', async (req, res) => {
    const { data } = req.body;
    const user = await new UserModel({ ...data }).save();

    return res.json({ user });
});

router.patch('/', async (req, res) => {
    const { data } = req.body;
    const user = await UserModel.findOneAndUpdate(
        { _id: data._id },
        { ...data },
        { new: true },
    );

    return res.json({ user });
});

export default router;
