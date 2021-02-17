import fs from 'fs';
import path from 'path';

import { initDatabase, updateStat } from './db.js';

const ingredientsDir = '../wtr-ingredients';
const ingredientsComponentsDir = 'src/ingredients';
const waitroseDotComDir = '../wtr-website';

initDatabase();

fs.readdir(path.join(ingredientsDir, ingredientsComponentsDir), (err, files) => {
  const numIngredientsComponents = files.filter((filename) => filename === 'index.js').length;
  // const numIngredientsStories = files.filter((filename) => filename.endsWith('stories.js'))
  // Just for now:
  const numIngredientsStories = numIngredientsComponents;

  updateStat('numIngredientsComponents', numIngredientsComponents);
  updateStat('numIngredientsStories', numIngredientsStories);
});
