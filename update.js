import fs from 'fs';
import glob from 'glob';
import lineByLine from 'n-readlines';

import { priorityDeprecatedComponentPaths, priorityDeprecatedRawHTMLElements } from './context.js';
import {
  generateDeprecatedCsv,
  generatePriorityDeprecatedCsv,
  generatePriorityDeprecatedHTMLElementsCsv,
} from './csv-generator.js';
import {
  addFileWithDeprecated,
  addFileWithDeprecatedByTeam,
  addFileWithDeprecatedMissingTeam,
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
  updatePriorityDeprecatedHTMLElementFilesAndCounts,
  updatePriorityDeprecatedHTMLElementsByTeamFilesAndCounts,
  updatePriorityDeprecatedMissingTeamFilesAndCounts,
  updatePriorityDeprecatedHTMLElementsMissingTeamFilesAndCounts,
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
let filesWithPriorityDeprecatedHTMLElementsMissingTeam = {};
let filesWithDeprecatedMissingTeamByComponentPath = {};
let filesWithPriorityDeprecated = {};
let filesWithPriorityDeprecatedHTMLElements = {};
let numDeprecatedInstances = 0;
let numIngredientsComponents = 0;
let numPriorityDeprecatedInstances = {};
let numPriorityDeprecatedHTMLElements = {};
let priorityDeprecatedComponentsByTeamAndComponent = {};
let priorityDeprecatedHTMLElementsByTeamAndComponent = {};

initDatabase();

// Ingredients components and stories
glob(`../wtr-ingredients/src/ingredients/**/*.stories.@(js|tsx)`, (err, files) => {
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
        const componentPath = priorityDeprecatedComponentPaths[componentKey].find((path) => {
          // EXCEPTION - only count `import { Link } from 'react-router-dom'`, not all 'react-router-dom' imports
          if (componentKey === 'ANCHOR_LINK' && path === 'react-router-dom') {
            return lineString.includes(`{ Link } from '${path}'`);
          } else {
            return lineString.includes(path);
          }
        });
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

      // Raw HTML elements
      for (const componentKey of Object.keys(priorityDeprecatedRawHTMLElements)) {
        const match = priorityDeprecatedRawHTMLElements[componentKey].find((element) => {
          // "<" and the element tagname followed by either whitespace, newline, ">", or end of line
          const regex = new RegExp(`<${element}([\\s\\n\\r>]|$)`);
          return lineString.match(regex);
        });

        if (match) {
          console.log(`Found a(n) ${componentKey} raw ${match} element in ${filepath}`, lineString);
          addFileWithPriorityDeprecated(
            filesWithPriorityDeprecatedHTMLElements,
            numPriorityDeprecatedHTMLElements,
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
        addFileWithDeprecatedMissingTeam(
          componentPath,
          fileWithDeprecated,
          filesWithDeprecatedMissingTeamByComponentPath,
          filesWithDeprecatedMissingTeam,
        );
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
    '\n\n**** filesWithPriorityDeprecatedHTMLElements',
    filesWithPriorityDeprecatedHTMLElements,
  );

  // HTML elements by team
  for (const componentKey of Object.keys(filesWithPriorityDeprecatedHTMLElements)) {
    console.log('**** COMPONENT KEY', componentKey);
    filesWithPriorityDeprecatedHTMLElements[componentKey].forEach(
      (fileWithPriorityDeprecatedHTMLElement) => {
        const teamName = findTeamFromFilepath(fileWithPriorityDeprecatedHTMLElement);
        if (teamName) {
          addFileWithPriorityDeprecatedByTeam(
            teamName,
            componentKey,
            fileWithPriorityDeprecatedHTMLElement,
            priorityDeprecatedHTMLElementsByTeamAndComponent,
          );
        } else {
          addFileWithPriorityDeprecatedMissingTeam(
            componentKey,
            fileWithPriorityDeprecatedHTMLElement,
            filesWithPriorityDeprecatedHTMLElementsMissingTeam,
          );
        }
      },
    );
  }

  updatePriorityDeprecatedHTMLElementFilesAndCounts(
    filesWithPriorityDeprecatedHTMLElements,
    numPriorityDeprecatedHTMLElements,
  );

  updatePriorityDeprecatedHTMLElementsByTeamFilesAndCounts(
    priorityDeprecatedHTMLElementsByTeamAndComponent,
  );

  updatePriorityDeprecatedHTMLElementsMissingTeamFilesAndCounts(
    filesWithPriorityDeprecatedHTMLElementsMissingTeam,
  );

  console.log(
    'Tech debt per design system component',
    numDeprecatedInstances / numIngredientsComponents,
  );
  updateStat('techDebtPerDesignSystemComponent', numDeprecatedInstances / numIngredientsComponents);

  // Write CSVs with file path info (temporary - next step to include in dashboard)
  generateDeprecatedCsv(
    deprecatedComponentsByTeamAndComponentPath,
    filesWithDeprecatedMissingTeamByComponentPath,
  );

  generatePriorityDeprecatedCsv(
    priorityDeprecatedComponentsByTeamAndComponent,
    filesWithPriorityDeprecatedMissingTeam,
  );

  generatePriorityDeprecatedHTMLElementsCsv(
    priorityDeprecatedHTMLElementsByTeamAndComponent,
    filesWithPriorityDeprecatedHTMLElementsMissingTeam,
  );
});

console.log('Finished');
