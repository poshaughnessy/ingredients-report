import lineByLine from 'n-readlines';
import { updateStat } from './db.js';

import { componentPathsByTeam } from './context.js';

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
  deprecatedComponentsByTeam,
  totalDeprecatedComponentsWithTeam,
) => {
  if (!deprecatedComponentsByTeam[teamName]) {
    deprecatedComponentsByTeam[teamName] = [];
  }
  deprecatedComponentsByTeam[teamName].push(fileWithDeprecated);
  totalDeprecatedComponentsWithTeam++;
};

export const addFileWithPriorityDeprecatedByTeam = (
  teamName,
  componentPath,
  priorityDeprecatedComponentsByTeam,
  totalPriorityDeprecatedByTeam,
) => {
  if (!priorityDeprecatedComponentsByTeam[componentPath]) {
    priorityDeprecatedComponentsByTeam[componentPath] = {};
  }
  if (!priorityDeprecatedComponentsByTeam[componentPath][teamName]) {
    priorityDeprecatedComponentsByTeam[componentPath][teamName] = [];
  }
  priorityDeprecatedComponentsByTeam[componentPath][teamName].push(fileWithDeprecated);
  totalPriorityDeprecatedByTeam[teamName]++;
};

export const addFileWithPriorityDeprecatedMissingTeam = (
  componentKey,
  filesWithPriorityDeprecatedMissingTeam,
) => {
  if (!filesWithPriorityDeprecatedMissingTeam[componentKey]) {
    filesWithPriorityDeprecatedMissingTeam[componentKey] = [];
  }
  filesWithPriorityDeprecatedMissingTeam[componentKey].push(file);
};

export const countStoriesExports = (files) => {
  files.forEach((file) => {
    const linerStory = new lineByLine(file);
    let lineStory;
    while ((lineStory = linerStory.next())) {
      if (lineStory.toString().match('export const')) {
        numStoriesExports++;
      }
    }
  });
};

export const findTeamFromFilepath = (filepath) => {
  for (const teamName of Object.keys(componentPathsByTeam)) {
    for (const path of componentPathsByTeam[teamName]) {
      return filepath.includes(path);
    }
    return null;
  }
};

export const getDeprecatedComponentPaths = () => {
  const linerDep = new lineByLine(`../wtr-website/deprecated-components`);
  let lineDep;
  while ((lineDep = linerDep.next())) {
    const deprecatedPath = lineDep.toString().split('=>')[0];

    console.log('Deprecated path:', deprecatedPath);

    deprecatedComponentPaths.push(deprecatedPath);
  }
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
  priorityDeprecatedComponentPaths,
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
    updateStat(
      `crossCuttingNumDeprecatedFiles${componentKey}`,
      filesWithPriorityDeprecated[componentKey].length -
        totalPriorityDeprecatedByTeam[componentKey],
    );
  }
};
