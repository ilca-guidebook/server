import express from 'express';

import contentfulClient from '../config/conentful';

const router = express.Router();

router.get('/', async (req, res) => {
    const entries = await contentfulClient.getEntries({
        content_type: 'crag',
        include: 2,
    });

    const crags = entries.items.map(({ fields, sys: { id } }) => {
        return {
            id,
            ...fields,
            sectors: fields.sectors.map(({ fields: sectorFields, sys: { id } }) => {
                const climbingRoutes = (sectorFields.climbingRoute || []).map(({
                    fields: climbingRouteFields,
                    sys: { id },
                }) => ({ ...climbingRouteFields, id }));
                const boulderProblems = (sectorFields.boulderProblem || []).map(({
                    fields: boulderProblemsFields,
                    sys: { id },
                }) => ({ ...boulderProblemsFields, id }));

                const sectorData = {
                    ...sectorFields,
                    id,
                    climbingRoutes,
                    boulderProblems,
                };

                delete sectorData.climbingRoute;
                delete sectorData.boulderProblem;

                return sectorData;
            }),
        };
    });

    // return res.json({ climbingRoutes });
    return res.json(crags);
});

export default router;
