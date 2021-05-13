import fs from 'fs';
import glob from 'glob';
import lineByLine from 'n-readlines';

import componentPathsByTeam from './component-paths-by-team.js';
import { initDatabase, updateStat } from './db.js';

const ADD_LIST = 'ADD_LIST';
const ALERT = 'ALERT';
const BUTTON = 'BUTTON';
const CARD = 'CARD';
const MODAL = 'MODAL';
const TEXT_INPUT = 'TEXT_INPUT';

// Exact matches rather than checking just included in path
const specificDeprecatedComponentFullPaths = {
  ALERT: [
    'components/wdx/Alert',
  ],
  ADD_LIST: [
    'components/Lists/CreateList/Button',
  ],
  BUTTON: [
    'components/Button', 
    'components/Button/Spinner',
    'components/Button/Submit',
  ],
  CARD: [
    'components/wdx/Card',
  ],
  MODAL: [
    'components/Modal',
    'components/Modal/CommonModal',
    'components/PortalModal',
    'components/wdx/FormattedModal',
  ],
  TEXT_INPUT: [
    'components/Form/TextInput',
    'components/Forms/FormFields/InputText',
    'components/Forms/ReduxFormFields/InputText',
  ],
};

const isPathExcluded = path => path.includes('components/wdx/') || path.includes('.spec.js');

let deprecatedComponentPaths = [];
let filesIncludingSpecificDeprecatedComponents = {};
let filesIncludingDeprecatedComponents = [];
let numDeprecatedComponentInstances = 0;
let numIngredientsComponents = 0;
let numSpecificDeprecatedComponentInstances = {};
let numStoriesExports = 0;

initDatabase();

// Ingredients components and stories
glob(`../wtr-ingredients/src/ingredients/**/*.stories.js`, (err, files) => {
  files.forEach((file) => {
    const linerStory = new lineByLine(file);
    let lineStory;
    while ((lineStory = linerStory.next())) {
      if (lineStory.toString().match('export const')) {
        numStoriesExports++;
      }
    }
  });

  numIngredientsComponents = files.length;
  updateStat('numIngredientsComponents', numIngredientsComponents);
  updateStat('numIngredientsStories', numStoriesExports);
});

// Waitrose.com tech debt
const linerDep = new lineByLine(`../wtr-website/deprecated-components`);
let lineDep;
while ((lineDep = linerDep.next())) {
  const deprecatedPath = lineDep.toString().split('=>')[0];

  console.log('Deprecated path:', deprecatedPath);

  deprecatedComponentPaths.push(deprecatedPath);
}

// Search for imports of these deprecated components in src code
glob(`../wtr-website/src/**/*.js`, (err, files) => {
  files.forEach((file) => {
    if (isPathExcluded(file)) {
      return;
    } 
    const linerSrc = new lineByLine(file);
    let lineSrc;
    while ((lineSrc = linerSrc.next())) {
      if (deprecatedComponentPaths.some(path => lineSrc.toString().includes(path))) {
        console.log('Found deprecated component:', lineSrc.toString());
        if (!filesIncludingDeprecatedComponents.includes(file)) {
          filesIncludingDeprecatedComponents.push(file);
        }
        numDeprecatedComponentInstances++;
      }      
      for (const componentKey of Object.keys(specificDeprecatedComponentFullPaths)) {
        if (specificDeprecatedComponentFullPaths[componentKey].some(path => lineSrc.toString().includes(`'${path}'`))) {
          console.log(`Found a(n) ${componentKey}...`, lineSrc.toString());
          if (!filesIncludingSpecificDeprecatedComponents[componentKey]) {
            filesIncludingSpecificDeprecatedComponents[componentKey] = [];
          }
          if (!filesIncludingSpecificDeprecatedComponents[componentKey].includes(file)) {
            filesIncludingSpecificDeprecatedComponents[componentKey].push(file);
          }
          if (!numSpecificDeprecatedComponentInstances[componentKey]) {
            numSpecificDeprecatedComponentInstances[componentKey] = 0;
          }
          numSpecificDeprecatedComponentInstances[componentKey]++;
        }
      }
    }
  });

  updateStat('numDeprecatedComponentInstances', numDeprecatedComponentInstances);
  updateStat('numDeprecatedButtonInstances', numSpecificDeprecatedComponentInstances[BUTTON]);

  console.log('\n-- SPECIFIC DEPRECATED COMPONENTS --');

  for (const componentKey of Object.keys(specificDeprecatedComponentFullPaths)) {
    console.log(`Num of components using deprecated ${componentKey}`, filesIncludingSpecificDeprecatedComponents[componentKey]?.length ?? 0);
    console.log(`Num of instances of deprecated ${componentKey}`, numSpecificDeprecatedComponentInstances[componentKey] ?? 0);
  }

  /**
   * Components using deprecated components (by file)
   **/ 

  console.log('--');
  console.log('Files including deprecated components:\n');
  filesIncludingDeprecatedComponents.forEach(file => console.log(file.split('wtr-website')[1]));

  updateStat('numDeprecatedComponentFiles', filesIncludingDeprecatedComponents.length);

  /**
   * Components using deprecated buttons (by file)
   */

  console.log('--');
  console.log('Files including deprecated buttons (filtered):\n');
  filesIncludingSpecificDeprecatedComponents[BUTTON].forEach(file => console.log(file.split('wtr-website')[1]));

  updateStat('numDeprecatedButtonFiles', filesIncludingSpecificDeprecatedComponents[BUTTON].length);



  let totalDeprecatedComponentsByTeam = 0;
  let totalDeprecatedButtonsByTeam = 0;
  let deprecatedComponentsByTeam = {};
  let deprecatedButtonsByTeam = {};
  let filesIncludingDeprecatedComponentsMissingTeam = [];
  let filesIncludingDeprecatedButtonsMissingTeam = []

  ///// Components by team...
  filesIncludingDeprecatedComponents.forEach(file => {
    let foundTeam = false;
    for (const teamName of Object.keys(componentPathsByTeam)) {
      for (const path of componentPathsByTeam[teamName]) {
        if (file.includes(path)) {
          if (!deprecatedComponentsByTeam[teamName]) {
            deprecatedComponentsByTeam[teamName] = [];
          }
          deprecatedComponentsByTeam[teamName].push(file);
          totalDeprecatedComponentsByTeam++;
          foundTeam = true;
          break;
        }
      }
      if (foundTeam) break;
    }
    if (!foundTeam) {
      filesIncludingDeprecatedComponentsMissingTeam.push(file);
    }
  });

  console.log('\n-- COMPONENTS BY TEAM --');

  Object.keys(deprecatedComponentsByTeam).forEach(teamName => {
    console.log(`\n${teamName} team components using deprecated components:\n`);
    deprecatedComponentsByTeam[teamName].forEach(file => console.log(file));
  
    updateStat(`${teamName}NumDeprecatedComponentFiles`, deprecatedComponentsByTeam[teamName].length);
  })
  

  ///// Buttons by team...
  filesIncludingSpecificDeprecatedComponents[BUTTON].forEach(file => {
    let foundTeam = false;
    for (const teamName of Object.keys(componentPathsByTeam)) {
      for (const path of componentPathsByTeam[teamName]) {
        if (file.includes(path)) {
          if (!deprecatedButtonsByTeam[teamName]) {
            deprecatedButtonsByTeam[teamName] = [];
          }
          deprecatedButtonsByTeam[teamName].push(file);
          totalDeprecatedButtonsByTeam++;
          foundTeam = true;
          break;
        }
      }
      if (foundTeam) break;
    }
    if (!foundTeam) {
      filesIncludingDeprecatedButtonsMissingTeam.push(file);
    }
  });

  console.log('\n-- BUTTONS BY TEAM --');

  Object.keys(deprecatedButtonsByTeam).forEach(teamName => {    
    console.log(`\n${teamName} team components using deprecated buttons:\n`);
    deprecatedButtonsByTeam[teamName].forEach(file => console.log(file));

    updateStat(`${teamName}NumDeprecatedButtonFiles`, deprecatedButtonsByTeam[teamName].length);
  });

  console.log('\n-- COMPONENTS WITH DEPRECATED COMPONENTS MISSING TEAMS --');
  filesIncludingDeprecatedComponentsMissingTeam.forEach(file => console.log(file));

  console.log('\n-- COMPONENTS WITH DEPRECATED BUTTONS MISSING TEAMS --');
  filesIncludingDeprecatedButtonsMissingTeam.forEach(file => console.log(file));

  console.log('\n--');
  console.log('Number of components with deprecated components missing teams', filesIncludingDeprecatedComponentsMissingTeam.length);
  console.log('Number of components with deprecated buttons missing teams', filesIncludingDeprecatedButtonsMissingTeam.length);

  updateStat('crossCuttingNumDeprecatedComponentFiles', filesIncludingDeprecatedComponents.length - totalDeprecatedComponentsByTeam);
  updateStat('crossCuttingNumDeprecatedButtonFiles', filesIncludingSpecificDeprecatedComponents[BUTTON].length - totalDeprecatedButtonsByTeam);

  console.log('Tech debt per design system component', numDeprecatedComponentInstances / numIngredientsComponents);

  updateStat('techDebtPerDesignSystemComponent', numDeprecatedComponentInstances / numIngredientsComponents);

});
