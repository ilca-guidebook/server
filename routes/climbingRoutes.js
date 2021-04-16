import express from 'express';

import ClimbingRouteModel from '../models/ClimbingRoute';
import permissions from '../middleware/express/permissions';

const router = express.Router();

router.get('/', async (req, res) => {
    const climbingRoutes = await ClimbingRouteModel.find({});

    return res.json({ climbingRoutes });
});

router.post('/', permissions.write, async (req, res) => {
    const {
        body: { data },
    } = req;

    const climbingRoute = new ClimbingRouteModel(data);
    await climbingRoute.save();

    return res.json({ climbingRoute });
});

router.put('/', permissions.write, async (req, res) => {
    const { data } = req.body;
    const climbingRoute = await ClimbingRouteModel.findOneAndUpdate(
        { _id: data._id },
        { ...data },
        { new: true }
    );

    return res.json({ climbingRoute });
});

export default router;
