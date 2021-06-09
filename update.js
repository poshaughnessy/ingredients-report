import fs from 'fs';
import glob from 'glob';
import lineByLine from 'n-readlines';
import objectsToCsv from 'objects-to-csv';

import componentPathsByTeam from './component-paths-by-team.js';
import { initDatabase, updateStat } from './db.js';

const ADD_LIST = 'ADD_LIST';
const ALERT = 'ALERT';
const ANCHOR_LINK = 'ANCHOR_LINK';
const BUTTON = 'BUTTON';
const CARD = 'CARD';
const ICONS = 'ICONS';
const MODAL = 'MODAL';
const TEXT_INPUT = 'TEXT_INPUT';
const TYPOGRAPHY = 'TYPOGRAPHY';

// Exact matches rather than checking just included in path
const specificDeprecatedComponentFullPaths = {
  ADD_LIST: [
    'components/Lists/CreateList/Button',
  ],
  ALERT: [
    'components/wdx/Alert',
  ],
  ADDRESS_TILE: [
    'ingredients/AddressTile/', // NOTE trailing slash - but there is only one reference
  ],
  ANCHOR_LINK: [
    'components/AnchorLink',
  ],
  BUTTON: [
    'components/Button', 
    'components/Button/Spinner',
    'components/Button/Submit',
  ],
  CARD: [
    'components/wdx/Card',
  ],
  ICONS: [
    'components/wdx/Iconography',
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
  TYPOGRAPHY: [
    'components/wdx/Text',
  ],
};

const isPathExcluded = path => path.includes('components/wdx/') || path.includes('.spec.js');

let deprecatedComponentPaths = [];
let filesIncludingDeprecatedComponents = [];
let filesIncludingDeprecatedComponentsByComponent = {};
let filesIncludingSpecificDeprecatedComponents = {};
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
glob(`../wtr-website/src/**/*.js`, async (err, files) => {
  files.forEach((file) => {
    if (isPathExcluded(file)) {
      return;
    } 
    const linerSrc = new lineByLine(file);
    let lineSrc;
    while ((lineSrc = linerSrc.next())) {
      const path = deprecatedComponentPaths.find(path => lineSrc.toString().includes(path));
      if (path) {
        const filepath = file.split('wtr-website')[1];
        console.log(`Found deprecated component in ${filepath}`, lineSrc.toString());
        if (!filesIncludingDeprecatedComponents.includes(filepath)) {
          filesIncludingDeprecatedComponents.push(filepath);
          if (!filesIncludingDeprecatedComponentsByComponent[path]) {
            filesIncludingDeprecatedComponentsByComponent[path] = [];
          }  
          filesIncludingDeprecatedComponentsByComponent[path].push(filepath);
        }
        numDeprecatedComponentInstances++;
      }      
      for (const componentKey of Object.keys(specificDeprecatedComponentFullPaths)) {
        if (specificDeprecatedComponentFullPaths[componentKey].some(path => lineSrc.toString().includes(`'${path}'`))) {
          console.log(`Found a(n) ${componentKey} in ${file}`, lineSrc.toString());
          if (!filesIncludingSpecificDeprecatedComponents[componentKey]) {
            filesIncludingSpecificDeprecatedComponents[componentKey] = [];
          }
          if (!filesIncludingSpecificDeprecatedComponents[componentKey].includes(file)) {
            filesIncludingSpecificDeprecatedComponents[componentKey].push(file.split('wtr-website')[1]);
          }
          if (!numSpecificDeprecatedComponentInstances[componentKey]) {
            numSpecificDeprecatedComponentInstances[componentKey] = 0;
          }
          numSpecificDeprecatedComponentInstances[componentKey]++;
        }
      }
    }
  });

  console.log('--');
  console.log('Files including deprecated components:\n');
  filesIncludingDeprecatedComponents.forEach(file => console.log(file));

  console.log('numDeprecatedComponentFiles', filesIncludingDeprecatedComponents.length);
  console.log('numDeprecatedComponentInstances', numDeprecatedComponentInstances);

  updateStat('numDeprecatedComponentFiles', filesIncludingDeprecatedComponents.length);
  updateStat('numDeprecatedComponentInstances', numDeprecatedComponentInstances);

  console.log('\n-- SPECIFIC DEPRECATED COMPONENTS --');

  for (const componentKey of Object.keys(specificDeprecatedComponentFullPaths)) {
    console.log('--');
    console.log(`Num of components using deprecated ${componentKey}`, filesIncludingSpecificDeprecatedComponents[componentKey]?.length ?? 0);
    console.log(`Num of instances of deprecated ${componentKey}`, numSpecificDeprecatedComponentInstances[componentKey] ?? 0);

    console.log(`Files including deprecated ${componentKey} (filtered):\n`);
    filesIncludingSpecificDeprecatedComponents[componentKey].forEach(file => console.log(file));
  
    updateStat(`numDeprecatedFiles${componentKey}`, filesIncludingSpecificDeprecatedComponents[componentKey].length);
    updateStat(`numDeprecatedInstances${componentKey}`, numSpecificDeprecatedComponentInstances[componentKey]);
  }

  let totalDeprecatedComponentsByTeam = 0;
  let deprecatedComponentsByTeam = {};
  let deprecatedComponentsByComponentAndTeam = {};
  let filesIncludingDeprecatedComponentsMissingTeam = [];

  ///// Components by team...
  Object.keys(filesIncludingDeprecatedComponentsByComponent).forEach(componentPath => {
    filesIncludingDeprecatedComponentsByComponent[componentPath].forEach(file => {
      let foundTeam = false;
      for (const teamName of Object.keys(componentPathsByTeam)) {
        for (const path of componentPathsByTeam[teamName]) {
          if (file.includes(path)) {
            if (!deprecatedComponentsByTeam[teamName]) {
              deprecatedComponentsByTeam[teamName] = [];
            }
            if (!deprecatedComponentsByComponentAndTeam[componentPath]) {
              deprecatedComponentsByComponentAndTeam[componentPath] = {};
            }
            if (!deprecatedComponentsByComponentAndTeam[componentPath][teamName]) {
              deprecatedComponentsByComponentAndTeam[componentPath][teamName] = [];
            }
            deprecatedComponentsByTeam[teamName].push(file);
            deprecatedComponentsByComponentAndTeam[componentPath][teamName].push(file);
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
  });

  console.log('\n-- COMPONENTS BY TEAM --');

  Object.keys(deprecatedComponentsByTeam).forEach(teamName => {
    console.log(`\n${teamName} team components using deprecated components:\n`);
    deprecatedComponentsByTeam[teamName].forEach(file => console.log(file));
  
    updateStat(`${teamName}NumDeprecatedComponentFiles`, deprecatedComponentsByTeam[teamName].length);
  })
  
  let deprecatedSpecificComponentsByTeam = {};
  let totalDeprecatedByTeam = {};
  let filesIncludingSpecificDeprecatedComponentsMissingTeam = {}

  ///// Specific components by team...
  for (const componentKey of Object.keys(specificDeprecatedComponentFullPaths)) {

    filesIncludingSpecificDeprecatedComponents[componentKey].forEach(file => {
      let foundTeam = false;
      for (const teamName of Object.keys(componentPathsByTeam)) {
        for (const path of componentPathsByTeam[teamName]) {
          if (file.includes(path)) {
            if (!deprecatedSpecificComponentsByTeam[componentKey]) {
              deprecatedSpecificComponentsByTeam[componentKey] = {};
            }
            if (!deprecatedSpecificComponentsByTeam[componentKey][teamName]) {
              deprecatedSpecificComponentsByTeam[componentKey][teamName] = [];
            }
            deprecatedSpecificComponentsByTeam[componentKey][teamName].push(file);
            if (!totalDeprecatedByTeam[componentKey]) {
              totalDeprecatedByTeam[componentKey] = 0;
            }
            totalDeprecatedByTeam[componentKey]++;
            foundTeam = true;
            break;
          }
        }
        if (foundTeam) break;
      }
      if (!foundTeam) {
        if (!filesIncludingSpecificDeprecatedComponentsMissingTeam[componentKey]) {
          filesIncludingSpecificDeprecatedComponentsMissingTeam[componentKey] = [];
        }
        filesIncludingSpecificDeprecatedComponentsMissingTeam[componentKey].push(file);
      }
    });
  }
  

  console.log('\n-- SPECIFIC COMPONENTS BY TEAM --');

  Object.keys(deprecatedSpecificComponentsByTeam).forEach(componentKey => {
    Object.keys(deprecatedSpecificComponentsByTeam[componentKey]).forEach(teamName => {    
      console.log(`\n${teamName} team components using deprecated ${componentKey}:\n`);
      deprecatedSpecificComponentsByTeam[componentKey][teamName].forEach(file => console.log(file));

      updateStat(`${teamName}NumDeprecatedFiles${componentKey}`, deprecatedSpecificComponentsByTeam[componentKey][teamName].length);
    });
  });

  console.log('\n-- COMPONENTS WITH DEPRECATED COMPONENTS MISSING TEAMS --');
  filesIncludingDeprecatedComponentsMissingTeam.forEach(file => console.log(file));

  Object.keys(filesIncludingSpecificDeprecatedComponentsMissingTeam).forEach(componentKey => {
    console.log(`\n-- COMPONENTS WITH DEPRECATED ${componentKey} COMPONENTS MISSING TEAMS --`);
    filesIncludingSpecificDeprecatedComponentsMissingTeam[componentKey].forEach(file => console.log(file));
  });

  console.log('\n--');
  console.log('Number of components with deprecated components missing teams', filesIncludingDeprecatedComponentsMissingTeam.length);
  for (const componentKey of Object.keys(filesIncludingSpecificDeprecatedComponentsMissingTeam)) {
    console.log(`Number of components with deprecated ${componentKey} missing teams`, filesIncludingSpecificDeprecatedComponentsMissingTeam[componentKey].length);
  }

  updateStat('crossCuttingNumDeprecatedComponentFiles', filesIncludingDeprecatedComponents.length - totalDeprecatedComponentsByTeam);
  for (const componentKey of Object.keys(specificDeprecatedComponentFullPaths)) {
    updateStat(`crossCuttingNumDeprecatedFiles${componentKey}`, filesIncludingSpecificDeprecatedComponents[componentKey].length - totalDeprecatedByTeam[componentKey]);
  }
  
  console.log('Tech debt per design system component', numDeprecatedComponentInstances / numIngredientsComponents);
  updateStat('techDebtPerDesignSystemComponent', numDeprecatedComponentInstances / numIngredientsComponents);

  ///// Write CSVs with file path info (temporary - next step to include in dashboard)
  let componentsFilepathData = [];
  Object.keys(deprecatedComponentsByComponentAndTeam).forEach(componentPath => {
    Object.keys(deprecatedComponentsByComponentAndTeam[componentPath]).forEach(teamName => {
      deprecatedComponentsByComponentAndTeam[componentPath][teamName].forEach(filepath => {
        componentsFilepathData.push(
          {
            'Team': teamName,
            'Deprecated component': componentPath,
            'Found in filepath': filepath,
          }
        )
      });
    });
  });
  const COMPONENTS_CSV_FILEPATH = './deprecated-by-team.csv';
  const componentsCsv = new objectsToCsv(componentsFilepathData);
  await componentsCsv.toDisk(COMPONENTS_CSV_FILEPATH);
  console.log('\nWritten CSV', COMPONENTS_CSV_FILEPATH);

  let specificComponentsFilepathData = [];
  Object.keys(deprecatedSpecificComponentsByTeam).forEach(componentKey => {
    Object.keys(deprecatedSpecificComponentsByTeam[componentKey]).forEach(teamName => {    
      deprecatedSpecificComponentsByTeam[componentKey][teamName].forEach(filepath => {
        specificComponentsFilepathData.push(
          {
            'Team': teamName, 
            'Component': componentKey, 
            'Found in filepath': filepath,
          });
      });
    });
  });
  const SPECIFIC_COMPONENTS_FILEPATH = './specific-components-by-team.csv';
  const specificComponentsCsv = new objectsToCsv(specificComponentsFilepathData);
  await specificComponentsCsv.toDisk(SPECIFIC_COMPONENTS_FILEPATH);
  console.log('\nWritten CSV', SPECIFIC_COMPONENTS_FILEPATH);

});
