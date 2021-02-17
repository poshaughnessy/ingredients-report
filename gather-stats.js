import glob from 'glob';
import lineByLine from 'n-readlines';

import { initDatabase, updateStat } from './db.js';

const ingredientsDir = '../wtr-ingredients';
const ingredientsComponentsDir = 'src/ingredients';
// const waitroseDotComDir = '../wtr-website';

let numStoriesExports = 0;

initDatabase();

glob(`${ingredientsDir}/${ingredientsComponentsDir}/**/*.stories.js`, (err, files) => {
  files.forEach((file) => {
    const liner = new lineByLine(file);
    let line;
    while ((line = liner.next())) {
      if (line.toString().match('export const')) {
        numStoriesExports++;
      }
    }
  });

  updateStat('numIngredientsComponents', files.length);
  updateStat('numIngredientsStories', numStoriesExports);
});
