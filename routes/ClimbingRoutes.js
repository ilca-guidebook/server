import express from 'express';
import ClimbingRouteModel from '../models/ClimbingRoute';

const router = express.Router();

router.get('/', async (req, res) => {
    const climbingRoutes = await ClimbingRouteModel.find({});

    return res.json({ climbingRoutes });
});

router.post('/', async (req, res) => {
    const { data } = req.body;
    const climbingRoute = await new ClimbingRouteModel({ ...data }).save();

    return res.json({ climbingRoute });
});

router.put('/', async (req, res) => {
    const { data } = req.body;
    const climbingRoute = await ClimbingRouteModel.findOneAndUpdate(
        { _id: data._id },
        { ...data },
        { new: true },
    );

    return res.json({ climbingRoute });
});

export default router;
