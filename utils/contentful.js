const extractSectorsData = (sector) => {
  const {
    fields: sectorFields,
    sys: { id },
  } = sector;

  const climbingRoutes = (sectorFields.climbingRoute || []).map(
    ({ fields: climbingRouteFields, sys: { id } }, index) => {
      return {
        ...climbingRouteFields,
        id,
        routeId: climbingRouteFields.name.toLowerCase().replace(/ /g, '-'),
        position: index,
      };
    }
  );
  const boulderProblems = (sectorFields.boulderProblem || []).map(
    ({ fields: boulderProblemsFields, sys: { id } }, index) => {
      return {
        ...boulderProblemsFields,
        id,
        routeId: boulderProblemsFields.name.toLowerCase().replace(/ /g, '-'),
        position: index,
      };
    }
  );

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

export const extractCragsData = (crags) => {
  return crags.items
    .map((crag) => {
      const {
        fields,
        sys: { id },
      } = crag;

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
        sectors: fields.sectors.filter(({ fields }) => !!fields).map(extractSectorsData),
      };

      // Skip empty crags (no sectors)
      if (!cragData.sectors.length) {
        return null;
      }

      const { coverImage: { fields: { file: { url: coverImageUrl } = {} } = {} } = {}, galleryImages } = fields;

      if (coverImageUrl) {
        cragData.coverImage = `https:${coverImageUrl}`;
      }

      if (galleryImages && galleryImages.length) {
        cragData.galleryImages = galleryImages.map((image) => {
          const { fields: { file: { url } = {} } = {} } = image;
          const thumbnail = `https:${url}?w=200&h=200&fit=crop`;
          const fullSize = `https:${url}`;

          return {
            fullSize,
            thumbnail,
          };
        });
      }

      return cragData;
    })
    .filter((crag) => crag);
};
