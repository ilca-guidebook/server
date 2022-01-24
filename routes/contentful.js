import express from 'express';

import contentfulClient from '../config/conentful';

const router = express.Router();

router.get('/', async (req, res) => {
    const entries = await contentfulClient.getEntries({
        content_type: 'crag',
        include: 2,
    });

    const crags = entries.items.map(({ fields, sys: { id } }) => {
        const cragFeatures = {
            rockType: fields.rockType,
            routesLength: fields.routesLength,
            season: fields.season,
            shade: fields.shade,
            cellularCoverage: fields.cellularCoverage,
        };

        return {
            id,
            ...fields,
            cragFeatures,
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

                const { image: { fields: { file: { url: sectorImage } = {} } = {} } = {} } = sectorFields;

                if (sectorImage) {
                    sectorData.sectorImage = `https:${sectorImage}`;
                }

                delete sectorData.climbingRoute;
                delete sectorData.boulderProblem;

                return sectorData;
            }),
        };
    });

    return res.json(crags);
});

export default router;
