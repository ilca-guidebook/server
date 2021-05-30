import mongoose from 'mongoose';

import CragModel from '../models/Crag';
import SectorModel from '../models/Sector';
import ClimbingRouteModel from '../models/ClimbingRoute';

import beitArya from '../mockData/beitArye.json';
import beitAryaBoulder from '../mockData/beitAryeBoulder.json';
import beitOren from '../mockData/beitOren.json';
import gitaEast from '../mockData/gitaEast.json';
import gitaWest from '../mockData/gitaWest.json';
import nahalTamar from '../mockData/NahalTamar.json';
import yonim from '../mockData/yonim.json';
import zanuah from '../mockData/Zanuah.json';
import { routeTypes } from '../enums/ClimbingRoutes';

let DB;

/**
 * npm scripts should run as follow: npm run devel <command> <key>:<value>.
 * This function splits the arguments and return an { key: value } object.
 * @param {Array} args
 * @returns {Object}
 */
const argsToObject = (args) => {
    const obj = {};

    args.forEach((item) => {
        const splitted = item.split(':');

        if (splitted[0] && splitted[1]) {
            obj[splitted[0]] = splitted[1];
        }
    });

    return obj;
};

const connectDB = async () => {
    DB = await mongoose.connect(process.env.MONGO_CONNECTION, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    });

    // Debug Mongoose
    // mongoose.set('debug', true);
    mongoose.Promise = global.Promise; // Use native promises as mongoose promises
};

const importData = async () => {
    const crags = [
        beitArya,
        beitAryaBoulder,
        beitOren,
        gitaEast,
        gitaWest,
        nahalTamar,
        yonim,
        zanuah,
    ];
    const cragsDocuments = [];

    for (let i = 0; i < crags.length; i++) {
        const { name, area, description, access, sectors, routesTypes } = crags[i];
        const sectorsDocuments = [];

        if (sectors) {
            for (let j = 0; j < sectors.length; j++) {
                const { name, routes, description } = sectors[j];
                const routesDocuments = [];

                if (routes) {
                    for (let k = 0; k < routes.length; k++) {
                        const {
                            name,
                            grade,
                            type,
                            setBy,
                            bolts,
                            stars = 0,
                        } = routes[k];

                        const routeType = routeTypes.includes(type) ? type : '';
                        routesDocuments.push({
                            name,
                            description: '',
                            metaData: { grade, routeType, setBy, bolts, stars },
                        });
                    }
                }

                const routesIds = (
                    await ClimbingRouteModel.insertMany(routesDocuments)
                ).map((item) => item._id);
                sectorsDocuments.push({
                    name,
                    description,
                    routes: routesIds,
                });
            }
        }

        const sectorsIds = (await SectorModel.insertMany(sectorsDocuments)).map(
            (item) => item._id
        );
        cragsDocuments.push({
            name,
            description,
            location: { description: access, area },
            sectors: sectorsIds,
            routesTypes,
        });
    }

    await CragModel.insertMany(cragsDocuments);
};

async function main() {
    try {
        const { command } = argsToObject(process.argv);

        await connectDB();

        switch (command) {
            case 'health':
                console.log('testing flow');
                break;
            case 'importData':
                await importData();
                console.log('done importing data');
                break;
            default:
                console.warn('Could not determine what to do');
                break;
        }
    } catch (error) {
        console.warn('error', error);
    } finally {
        console.log('disconnecting from db');
        await DB.disconnect();
    }
}

main()
    .then(() => {
        console.log('finished performing task');
    })
    .catch((err) => {
        console.warn('error', err.message);
    });
