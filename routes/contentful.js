import express from 'express';

import contentfulClient from '../config/conentful';
const router = express.Router();

router.get('/', async (req, res) => {
    const entries = await contentfulClient.getEntries({
        content_type: 'crag',
        include: 2,
    });

    const crags = entries.items.map(({ fields }) => {
        return {
            ...fields,
            sectors: fields.sectors.map(({ fields: sectorFields }) => {
                const sectorData = {
                    ...sectorFields,
                    routes: sectorFields.climbingRoute.map(({
                        fields: climbingRouteFields,
                    }) => climbingRouteFields),
                };
                delete sectorData.climbingRoute;

                return sectorData;
            }),
        };
    });

    // return res.json({ climbingRoutes });
    return res.json(crags);
});

export default router;
