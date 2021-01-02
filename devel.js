import CragModel from './models/Crag';
import SectorModel from './models/Sector';
import ClimbingRouteModel from './models/ClimbingRoute';

import beitArya from './mockData/beitArye.json';
import beitOren from './mockData/beitOren.json';
import gita from './mockData/gita.json';
import nahalTamar from './mockData/NahalTamar.json';
import yonim from './mockData/yonim.json';
import zanuah from './mockData/Zanuah.json';

const importData = () => {
    const crags = [beitArya, beitOren, gita, nahalTamar, yonim, zanuah];

    const cragsPromises = [];
    const sectorsPromises = [];

    crags.forEach((crag) => {
        const { name, description, access, subCrags, sectors } = crag;

        if (sectors) {
            sectors.forEach((sector) => {
                const { name, routes, description } = sector;

                if (routes) {
                    const routesIds = [];

                    routes.forEach(async (climbingRoute) => {
                        const { name, grade, type, setBy, bolts, stars = 0 } = climbingRoute;

                        routesIds.push(await new ClimbingRouteModel({
                            name,
                            description: '',
                            metaData: { grade, type, setBy, bolts, stars },
                        }).save());
                    });

                    console.log(routesIds);
                }
            });
        }
    });
};

try {
    const args = process.argv;
    console.log('args', args);
    switch (args[2]) {
        case 'importData':
            importData();
            break;
        default:
            console.warn('Could not determine what to do');
            break;
    }
} catch (error) {
    console.warn('error', error);
}
