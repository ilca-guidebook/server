import express from 'express';

import { extractCragData } from '../utils/contentful';
import contentfulClient from '../config/conentful';

const router = express.Router();

router.get('/', async (req, res) => {
    const entries = await contentfulClient.getEntries({
        content_type: 'crag',
        include: 2,
    });

    const crags = entries.items.map(extractCragData);

    return res.json(crags);
});

export default router;
