import express from 'express';

import { extractCragsData } from '../utils/contentful.js';
import contentfulClient from '../config/conentful.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const entries = await contentfulClient.getEntries({
    content_type: 'crag',
    include: 2,
  });

  const crags = await extractCragsData(entries);

  return res.json(crags);
});

export default router;
