import fs from 'fs';
import glob from 'glob';
import lineByLine from 'n-readlines';

import { priorityDeprecatedComponentPaths } from './context.js';
import { generateDeprecatedCsv, generatePriorityDeprecatedCsv } from './csv-generator.js';
import {
  addFileWithDeprecated,
  addFileWithDeprecatedByTeam,
  addFileWithPriorityDeprecated,
  addFileWithPriorityDeprecatedByTeam,
  addFileWithPriorityDeprecatedMissingTeam,
  countStoriesExports,
  findTeamFromFilepath,
  getDeprecatedComponentPaths,
  updateDeprecatedByTeamFilesAndCounts,
  updateDeprecatedFilesAndCounts,
  updateDeprecatedMissingTeamFilesAndCounts,
  updatePriorityDeprecatedByTeamFilesAndCounts,
  updatePriorityDeprecatedFilesAndCounts,
  updatePriorityDeprecatedMissingTeamFilesAndCounts,
} from './update-utils.js';
import { initDatabase, updateStat } from './db.js';

const deprecatedComponentPaths = getDeprecatedComponentPaths();
const isPathExcluded = (path) => path.includes('components/wdx/') || path.includes('.spec.js');

let deprecatedComponentsByTeam = {};
let deprecatedComponentsByTeamAndComponentPath = {};
let filesWithPriorityDeprecatedMissingTeam = {};
let filesWithDeprecated = [];
let filesWithDeprecatedByComponent = {};
let filesWithDeprecatedMissingTeam = [];
let filesWithPriorityDeprecated = {};
let numDeprecatedInstances = 0;
let numIngredientsComponents = 0;
let numPriorityDeprecatedInstances = {};
let priorityDeprecatedComponentsByTeamAndComponent = {};

initDatabase();

// Ingredients components and stories
glob(`../wtr-ingredients/src/ingredients/**/*.stories.js`, (err, files) => {
  const numStoriesExports = countStoriesExports(files);
  numIngredientsComponents = files.length;
  updateStat('numIngredientsComponents', numIngredientsComponents);
  updateStat('numIngredientsStories', numStoriesExports);
});

// Waitrose.com tech debt
// Search for imports of the deprecated components in src code
glob(`../wtr-website/src/**/*.js`, (err, files) => {
  files.forEach((file) => {
    if (isPathExcluded(file)) {
      return;
    }
    const linerSrc = new lineByLine(file);
    let line;
    const filepath = file.split('wtr-website')[1];

    while ((line = linerSrc.next())) {
      // Each line of source code...
      const lineString = line.toString();
      const componentPath = deprecatedComponentPaths.find((path) => lineString.includes(path));

      if (componentPath) {
        console.log(`Found deprecated component in ${filepath}`, lineString);
        addFileWithDeprecated(
          filesWithDeprecated,
          filesWithDeprecatedByComponent,
          filepath,
          componentPath,
        );
        numDeprecatedInstances++;
      }

      for (const componentKey of Object.keys(priorityDeprecatedComponentPaths)) {
        const componentPath = priorityDeprecatedComponentPaths[componentKey].find((path) =>
          lineString.includes(path),
        );
        if (componentPath) {
          console.log(`Found a(n) ${componentKey} in ${filepath}`, lineString);
          addFileWithPriorityDeprecated(
            filesWithPriorityDeprecated,
            numPriorityDeprecatedInstances,
            filepath,
            componentKey,
          );
        }
      }
    }
  });

  updateDeprecatedFilesAndCounts(filesWithDeprecated, numDeprecatedInstances);

  // Components by team...
  Object.keys(filesWithDeprecatedByComponent).forEach((componentPath) => {
    filesWithDeprecatedByComponent[componentPath].forEach((fileWithDeprecated) => {
      const teamName = findTeamFromFilepath(fileWithDeprecated);
      if (teamName) {
        addFileWithDeprecatedByTeam(
          teamName,
          componentPath,
          fileWithDeprecated,
          deprecatedComponentsByTeam,
          deprecatedComponentsByTeamAndComponentPath,
        );
      } else {
        filesWithDeprecatedMissingTeam.push(fileWithDeprecated);
      }
    });
  });

  updateDeprecatedByTeamFilesAndCounts(deprecatedComponentsByTeam);

  updateDeprecatedMissingTeamFilesAndCounts(filesWithDeprecatedMissingTeam);

  // Priority components by team
  for (const componentKey of Object.keys(priorityDeprecatedComponentPaths)) {
    filesWithPriorityDeprecated[componentKey].forEach((fileWithPriorityDeprecated) => {
      const teamName = findTeamFromFilepath(fileWithPriorityDeprecated);
      if (teamName) {
        addFileWithPriorityDeprecatedByTeam(
          teamName,
          componentKey,
          fileWithPriorityDeprecated,
          priorityDeprecatedComponentsByTeamAndComponent,
        );
      } else {
        addFileWithPriorityDeprecatedMissingTeam(
          componentKey,
          fileWithPriorityDeprecated,
          filesWithPriorityDeprecatedMissingTeam,
        );
      }
    });
  }

  updatePriorityDeprecatedFilesAndCounts(
    filesWithPriorityDeprecated,
    numPriorityDeprecatedInstances,
  );

  updatePriorityDeprecatedByTeamFilesAndCounts(priorityDeprecatedComponentsByTeamAndComponent);

  updatePriorityDeprecatedMissingTeamFilesAndCounts(filesWithPriorityDeprecatedMissingTeam);

  console.log(
    'Tech debt per design system component',
    numDeprecatedInstances / numIngredientsComponents,
  );
  updateStat('techDebtPerDesignSystemComponent', numDeprecatedInstances / numIngredientsComponents);

  // Write CSVs with file path info (temporary - next step to include in dashboard)
  generateDeprecatedCsv(deprecatedComponentsByTeamAndComponentPath);
  generatePriorityDeprecatedCsv(priorityDeprecatedComponentsByTeamAndComponent);
});

console.log('Finished');
