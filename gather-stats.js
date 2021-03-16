import fs from 'fs';
import glob from 'glob';
import lineByLine from 'n-readlines';

import { initDatabase, updateStat } from './db.js';

const deprecatedButtonPaths = ['components/Button', 'components/wdx/buttons'];

let deprecatedComponentPaths = [];
let filesIncludingDeprecatedButtons = [];
let filesIncludingDeprecatedComponents = [];
let numStoriesExports = 0;
let numDeprecatedComponentInstances = 0;
let numDeprecatedButtonInstances = 0;

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

  updateStat('numIngredientsComponents', files.length);
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
    const linerSrc = new lineByLine(file);
    let lineSrc;
    let foundInFile = false;
    while ((lineSrc = linerSrc.next())) {
      if (deprecatedComponentPaths.some(path => lineSrc.toString().includes(path))) {
        console.log('Found deprecated component:', lineSrc.toString());
        filesIncludingDeprecatedComponents.push(file);
        numDeprecatedComponentInstances++;
        foundInFile = true;
      }      
      if (deprecatedButtonPaths.some(path => lineSrc.toString().includes(path))) {
        filesIncludingDeprecatedButtons.push(file);
        numDeprecatedButtonInstances++;
        foundInFile = true;
      }
    }
  });

  updateStat('numDeprecatedComponentInstances', numDeprecatedComponentInstances);
  updateStat('numDeprecatedButtonInstances', numDeprecatedButtonInstances);

  // Remove duplicates
  let filesIncludingDeprecatedComponentsFiltered = [];
  filesIncludingDeprecatedComponents.forEach(file => {
    if (!filesIncludingDeprecatedComponentsFiltered.includes(file)) {
      filesIncludingDeprecatedComponentsFiltered.push(file);
    }
  });

  /**
   * Components using deprecated components (by file)
   **/ 

  // Filter out wdx components and spec files
  filesIncludingDeprecatedComponentsFiltered = filesIncludingDeprecatedComponentsFiltered.filter(file => 
    !file.includes('components/wdx/') && !file.includes('.spec.js'));

  console.log('--');
  console.log('Files including deprecated components (filtered):\n');
  filesIncludingDeprecatedComponentsFiltered.forEach(file => console.log(file.split('wtr-website')[1]));

  updateStat('numDeprecatedComponentFiles', filesIncludingDeprecatedComponentsFiltered.length);

  // Remove duplicates
  let filesIncludingDeprecatedButtonsFiltered = [];
  filesIncludingDeprecatedButtons.forEach(file => {
    if (!filesIncludingDeprecatedButtonsFiltered.includes(file)) {
      filesIncludingDeprecatedButtonsFiltered.push(file);
    }
  });

  /**
   * Components using deprecated buttons (by file)
   */

  // Filter out the deprecated components themselves and spec files
  filesIncludingDeprecatedButtonsFiltered = filesIncludingDeprecatedButtonsFiltered.filter(file => 
    !file.includes('components/wdx/') && !file.includes('components/Button') && !file.includes('.spec.js'));
  
  console.log('--');
  console.log('Files including deprecated buttons (filtered):\n');
  filesIncludingDeprecatedButtonsFiltered.forEach(file => console.log(file.split('wtr-website')[1]));

  updateStat('numDeprecatedButtonFiles', filesIncludingDeprecatedButtonsFiltered.length);

  /**
   * By team
   */
  const teamPathMatches = {
    'account': [
      'components/MyDetails',
    ],
    'browse': [
      'components/CategoryLinks',
      'components/ClickToBuy',
      'components/Footer',
      'components/LoadMoreButton',
      'components/PageTitle',
      'components/ProceedThroughCheckout',
      'components/ProductDetails',
      'components/Search',
      'components/SiteHeader',
    ],
    'buyCheckout': [
      'components/Checkout', 
      'components/GiftVouchersAndCards',
      'components/OrderConfirmation', 
      'components/PartnerDiscount', 
      'components/PaymentCard',
      'components/PaymentSavedCard',
      'components/PendingOrderSummary',
      'components/PreviousOrderSummary',
      'components/ViewOrder'
    ],
    'content': [
      'components/Accordion',
      'components/FullWidthNavigation',
      'components/TradingCell',
      'components/TradingComponent',
      'components/WhyWaitrose',
    ],
  };

  let totalDeprecatedComponentsByTeam = 0;
  let totalDeprecatedButtonsByTeam = 0;
  let deprecatedComponentsByTeam = {};
  let deprecatedButtonsByTeam = {};

  ///// Components...
  filesIncludingDeprecatedComponentsFiltered.forEach(file => {
    Object.keys(teamPathMatches).forEach(teamName => {
      teamPathMatches[teamName].forEach(path => {
        if (file.includes(path)) {
          if (!deprecatedComponentsByTeam[teamName]) {
            deprecatedComponentsByTeam[teamName] = [];
          }
          deprecatedComponentsByTeam[teamName].push(file);
          totalDeprecatedComponentsByTeam++;
        }
      });
    });
  });

  Object.keys(deprecatedComponentsByTeam).forEach(teamName => {
    console.log('--');
    console.log(`${teamName} team components using deprecated components:\n`);
    deprecatedComponentsByTeam[teamName].forEach(file => console.log(file));
  
    updateStat(`${teamName}NumDeprecatedComponentFiles`, deprecatedComponentsByTeam[teamName].length);
  })
  

  ///// Buttons...
  filesIncludingDeprecatedButtonsFiltered.forEach(file => {
    Object.keys(teamPathMatches).forEach(teamName => {
      teamPathMatches[teamName].forEach(path => {
        if (file.includes(path)) {
          if (!deprecatedButtonsByTeam[teamName]) {
            deprecatedButtonsByTeam[teamName] = [];
          }
          deprecatedButtonsByTeam[teamName].push(file);
          totalDeprecatedButtonsByTeam++;
        }
      });
    });
  });

  Object.keys(deprecatedButtonsByTeam).forEach(teamName => {
    console.log('--');
    console.log(`${teamName} team components using deprecated buttons:\n`);
    deprecatedButtonsByTeam[teamName].forEach(file => console.log(file));

    updateStat(`${teamName}NumDeprecatedButtonFiles`, deprecatedButtonsByTeam[teamName].length);
  });

  console.log('--');
  console.log('COMPONENTS CURRENTLY MISSING TEAM ASSIGNMENT', filesIncludingDeprecatedComponentsFiltered.length - totalDeprecatedComponentsByTeam);
  console.log('Cross-cutting components using deprecated buttons', filesIncludingDeprecatedButtonsFiltered.length - totalDeprecatedButtonsByTeam);

  updateStat('crossCuttingNumDeprecatedComponentFiles', filesIncludingDeprecatedComponentsFiltered.length - totalDeprecatedComponentsByTeam);
  updateStat('crossCuttingNumDeprecatedButtonFiles', filesIncludingDeprecatedButtonsFiltered.length - totalDeprecatedButtonsByTeam);

});
