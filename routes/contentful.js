import express from 'express';

import { extractCragsData } from '../utils/contentful';
import contentfulClient from '../config/conentful';

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
