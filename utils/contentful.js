const extractSectorsData = (sectors) => {
    const { fields: sectorFields, sys: { id } } = sectors;
    
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
};

export const extractCragData = (crags) => {
    const { fields, sys: { id } } = crags;

    const cragFeatures = {
        rockType: fields.rockType,
        routesLength: fields.routesLength,
        season: fields.season,
        shade: fields.shade,
        cellularCoverage: fields.cellularCoverage,
    };

    const cragData = {
        id,
        ...fields,
        cragFeatures,
        sectors: fields.sectors.map(extractSectorsData),
    };

    const {
        coverImage: { fields: { file: { url: coverImageUrl } = {} } = {} } = {},
        galleryImages,
    } = fields;

    if (coverImageUrl) {
        cragData.coverImage = `https:${coverImageUrl}`;
    }

    if (galleryImages && galleryImages.length) {
        cragData.galleryImages = galleryImages.map((image) => {
            const { fields: { file: { url } = {} } = {} } = image;

            return {
                fullSize: `https:${url}`,
                thumbnail: `https:${url}?w=200&h=200&fit=crop`,
            };
        });
    }

    return cragData;
};
