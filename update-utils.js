import lineByLine from 'n-readlines';
import { updateStat } from './db.js';

import { componentPathsByTeam, priorityDeprecatedComponentPaths } from './context.js';

export const addFileWithDeprecated = (
  filesWithDeprecated,
  filesWithDeprecatedByComponent,
  filepath,
  componentPath,
) => {
  if (!filesWithDeprecated.includes(filepath)) {
    filesWithDeprecated.push(filepath);
    if (!filesWithDeprecatedByComponent[componentPath]) {
      filesWithDeprecatedByComponent[componentPath] = [];
    }
    filesWithDeprecatedByComponent[componentPath].push(filepath);
  }
};

export const addFileWithPriorityDeprecated = (
  filesWithPriorityDeprecated,
  numPriorityDeprecatedInstances,
  filepath,
  componentKey,
) => {
  if (!filesWithPriorityDeprecated[componentKey]) {
    filesWithPriorityDeprecated[componentKey] = [];
  }
  if (!filesWithPriorityDeprecated[componentKey].includes(filepath)) {
    filesWithPriorityDeprecated[componentKey].push(filepath);
  }
  if (!numPriorityDeprecatedInstances[componentKey]) {
    numPriorityDeprecatedInstances[componentKey] = 0;
  }
  numPriorityDeprecatedInstances[componentKey]++;
};

export const addFileWithDeprecatedByTeam = (
  teamName,
  componentPath,
  fileWithDeprecated,
  deprecatedComponentsByTeam,
  deprecatedComponentsByTeamAndComponentPath,
  totalDeprecatedComponentsWithTeam,
) => {
  if (!deprecatedComponentsByTeam[teamName]) {
    deprecatedComponentsByTeam[teamName] = [];
  }
  deprecatedComponentsByTeam[teamName].push(fileWithDeprecated);
  totalDeprecatedComponentsWithTeam++;

  // Also store with the componentPath to be able to output that too
  if (!deprecatedComponentsByTeamAndComponentPath[teamName]) {
    deprecatedComponentsByTeamAndComponentPath[teamName] = {};
  }
  if (!deprecatedComponentsByTeamAndComponentPath[teamName][componentPath]) {
    deprecatedComponentsByTeamAndComponentPath[teamName][componentPath] = [];
  }
  deprecatedComponentsByTeamAndComponentPath[teamName][componentPath].push(fileWithDeprecated);
};

export const addFileWithPriorityDeprecatedByTeam = (
  teamName,
  componentKey,
  fileWithPriorityDeprecated,
  priorityDeprecatedComponentsByTeamAndComponent,
  totalPriorityDeprecatedByTeam,
) => {
  if (!priorityDeprecatedComponentsByTeamAndComponent[teamName]) {
    priorityDeprecatedComponentsByTeamAndComponent[teamName] = {};
  }
  if (!priorityDeprecatedComponentsByTeamAndComponent[teamName][componentKey]) {
    priorityDeprecatedComponentsByTeamAndComponent[teamName][componentKey] = [];
  }
  priorityDeprecatedComponentsByTeamAndComponent[teamName][componentKey].push(
    fileWithPriorityDeprecated,
  );
  totalPriorityDeprecatedByTeam[teamName]++;
};

export const addFileWithPriorityDeprecatedMissingTeam = (
  componentKey,
  fileWithPriorityDeprecated,
  filesWithPriorityDeprecatedMissingTeam,
) => {
  if (!filesWithPriorityDeprecatedMissingTeam[componentKey]) {
    filesWithPriorityDeprecatedMissingTeam[componentKey] = [];
  }
  filesWithPriorityDeprecatedMissingTeam[componentKey].push(fileWithPriorityDeprecated);
};

export const countStoriesExports = (files) => {
  let count = 0;
  files.forEach((file) => {
    const linerStory = new lineByLine(file);
    let lineStory;
    while ((lineStory = linerStory.next())) {
      if (lineStory.toString().match('export const')) {
        count++;
      }
    }
  });
  return count;
};

export const findTeamFromFilepath = (filepath) => {
  for (const teamName of Object.keys(componentPathsByTeam)) {
    for (const path of componentPathsByTeam[teamName]) {
      if (filepath.includes(path)) return teamName;
    }
  }
  return null;
};

export const getDeprecatedComponentPaths = (log = true) => {
  const linerDep = new lineByLine(`../wtr-website/deprecated-components`);
  let lineDep;
  let resultArray = [];
  while ((lineDep = linerDep.next())) {
    const deprecatedPath = lineDep.toString().split('=>')[0];
    if (log) console.log('Deprecated path:', deprecatedPath);
    resultArray.push(deprecatedPath);
  }
  return resultArray;
};

export const logDeprecatedFilesAndCounts = (filesWithDeprecated, numDeprecatedInstances) => {
  console.log('--');
  console.log('Files with deprecated components:\n');

  filesWithDeprecated.forEach((file) => console.log(file));

  console.log('numDeprecatedComponentFiles', filesWithDeprecated.length);
  console.log('numDeprecatedComponentInstances', numDeprecatedInstances);
};

export const logDeprecatedComponentsByTeam = (deprecatedComponentsByTeam, teamName) => {
  console.log(`\n${teamName} team components using deprecated components:\n`);
  deprecatedComponentsByTeam[teamName].forEach((file) => console.log(file));
};

export const logPriorityDeprecatedFilesAndCounts = (
  componentKey,
  filesWithPriorityDeprecated,
  numPriorityDeprecatedInstances,
) => {
  console.log('--');
  console.log(
    `Num of components using deprecated ${componentKey}`,
    filesWithPriorityDeprecated[componentKey]?.length ?? 0,
  );
  console.log(
    `Num of instances of deprecated ${componentKey}`,
    numPriorityDeprecatedInstances[componentKey] ?? 0,
  );

  console.log(`Files including deprecated ${componentKey} (filtered):\n`);
  filesWithPriorityDeprecated[componentKey].forEach((file) => console.log(file));
};

export const logPriorityDeprecatedFilesAndCountsByTeam = () => {
  console.log('\n-- Priority Components By Team --');

  Object.keys(deprecatedSpecificComponentsByTeam).forEach((componentKey) => {
    Object.keys(deprecatedSpecificComponentsByTeam[componentKey]).forEach((teamName) => {
      console.log(`\n${teamName} team components using deprecated ${componentKey}:\n`);
      deprecatedSpecificComponentsByTeam[componentKey][teamName].forEach((file) =>
        console.log(file),
      );

      updateStat(
        `${teamName}NumDeprecatedFiles${componentKey}`,
        deprecatedSpecificComponentsByTeam[componentKey][teamName].length,
      );
    });
  });
};

export const logDeprecatedMissingTeamFilesAndCounts = (filesWithDeprecatedMissingTeam) => {
  console.log('\n-- Components with priority components missing teams --');
  filesWithDeprecatedMissingTeam.forEach((file) => console.log(file));
  console.log(
    '\nNumber of components with deprecated components missing teams',
    filesWithDeprecatedMissingTeam.length,
  );
};

export const logPriorityDeprecatedMissingTeamFilesAndCounts = (
  filesWithPriorityDeprecatedMissingTeam,
) => {
  Object.keys(filesWithPriorityDeprecatedMissingTeam).forEach((componentKey) => {
    console.log(
      `\n-- Components with deprecated priority ${componentKey} components missing teams --`,
    );
    filesWithPriorityDeprecatedMissingTeam[componentKey].forEach((file) => console.log(file));
  });

  for (const componentKey of Object.keys(filesWithPriorityDeprecatedMissingTeam)) {
    console.log(
      `\nNumber of components with deprecated ${componentKey} missing teams`,
      filesWithPriorityDeprecatedMissingTeam[componentKey].length,
    );
  }
};

export const updateDeprecatedFilesAndCounts = (
  filesWithDeprecated,
  numDeprecatedInstances,
  log = true,
) => {
  if (log) logDeprecatedFilesAndCounts(filesWithDeprecated, numDeprecatedInstances);
  updateStat('numDeprecatedComponentFiles', filesWithDeprecated.length);
  updateStat('numDeprecatedComponentInstances', numDeprecatedInstances);
};

export const updateDeprecatedByTeamFilesAndCounts = (deprecatedComponentsByTeam, log = true) => {
  if (log) console.log('\n-- Components by team');

  Object.keys(deprecatedComponentsByTeam).forEach((teamName) => {
    if (log) logDeprecatedComponentsByTeam(deprecatedComponentsByTeam, teamName);

    updateStat(
      `${teamName}NumDeprecatedComponentFiles`,
      deprecatedComponentsByTeam[teamName].length,
    );
  });
};

export const updatePriorityDeprecatedFilesAndCounts = (
  filesWithPriorityDeprecated,
  numPriorityDeprecatedInstances,
  log = true,
) => {
  if (log) console.log('\n-- Priority Deprecated Components --');
  for (const componentKey of Object.keys(priorityDeprecatedComponentPaths)) {
    if (log)
      logPriorityDeprecatedFilesAndCounts(
        componentKey,
        filesWithPriorityDeprecated,
        numPriorityDeprecatedInstances,
      );

    updateStat(
      `numDeprecatedFiles${componentKey}`,
      filesWithPriorityDeprecated[componentKey].length,
    );
    updateStat(
      `numDeprecatedInstances${componentKey}`,
      numPriorityDeprecatedInstances[componentKey],
    );
  }
};

export const updateDeprecatedMissingTeamFilesAndCounts = (
  filesWithDeprecatedMissingTeam,
  totalDeprecatedComponentsWithTeam,
  log = true,
) => {
  if (log) logDeprecatedMissingTeamFilesAndCounts(filesWithDeprecatedMissingTeam);
  updateStat(
    'crossCuttingNumDeprecatedComponentFiles',
    filesWithDeprecatedMissingTeam.length - totalDeprecatedComponentsWithTeam,
  );
};

export const updatePriorityDeprecatedMissingTeamFilesAndCounts = (
  filesWithPriorityDeprecatedMissingTeam,
  totalPriorityDeprecatedByTeam,
  log = true,
) => {
  if (log) logPriorityDeprecatedMissingTeamFilesAndCounts(filesWithPriorityDeprecatedMissingTeam);

  for (const componentKey of Object.keys(priorityDeprecatedComponentPaths)) {
    if (filesWithPriorityDeprecatedMissingTeam[componentKey]) {
      updateStat(
        `crossCuttingNumDeprecatedFiles${componentKey}`,
        filesWithPriorityDeprecatedMissingTeam[componentKey].length -
          totalPriorityDeprecatedByTeam[componentKey],
      );
    }
  }
};
