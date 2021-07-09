import lineByLine from 'n-readlines';
import { updateStat } from './db.js';

import {
  componentPathsByTeam,
  priorityDeprecatedComponentPaths,
  priorityDeprecatedRawHTMLElements,
} from './context.js';

export const addFileWithDeprecated = (
  filesWithDeprecated,
  filesWithDeprecatedByComponent,
  filepath,
  componentPath,
) => {
  if (!filesWithDeprecated.includes(filepath)) {
    filesWithDeprecated.push(filepath);
  }
  if (!filesWithDeprecatedByComponent[componentPath]) {
    filesWithDeprecatedByComponent[componentPath] = [];
  }
  if (!filesWithDeprecatedByComponent[componentPath].includes(filepath)) {
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
) => {
  if (!deprecatedComponentsByTeam[teamName]) {
    deprecatedComponentsByTeam[teamName] = [];
  }
  if (!deprecatedComponentsByTeam[teamName].includes(fileWithDeprecated)) {
    deprecatedComponentsByTeam[teamName].push(fileWithDeprecated);
  }

  // Also store with the componentPath to be able to output that too
  if (!deprecatedComponentsByTeamAndComponentPath[teamName]) {
    deprecatedComponentsByTeamAndComponentPath[teamName] = {};
  }
  if (!deprecatedComponentsByTeamAndComponentPath[teamName][componentPath]) {
    deprecatedComponentsByTeamAndComponentPath[teamName][componentPath] = [];
  }
  deprecatedComponentsByTeamAndComponentPath[teamName][componentPath].push(fileWithDeprecated);
};

export const addFileWithDeprecatedMissingTeam = (
  componentPath,
  fileWithDeprecated,
  filesWithDeprecatedMissingTeamByComponentPath,
  filesWithDeprecatedMissingTeam,
) => {
  if (!filesWithDeprecatedMissingTeamByComponentPath[componentPath]) {
    filesWithDeprecatedMissingTeamByComponentPath[componentPath] = [];
  }

  filesWithDeprecatedMissingTeamByComponentPath[componentPath].push(fileWithDeprecated);

  filesWithDeprecatedMissingTeam.push(fileWithDeprecated);
};

export const addFileWithPriorityDeprecatedByTeam = (
  teamName,
  componentKey,
  fileWithPriorityDeprecated,
  priorityDeprecatedComponentsByTeamAndComponent,
) => {
  if (!priorityDeprecatedComponentsByTeamAndComponent[teamName]) {
    priorityDeprecatedComponentsByTeamAndComponent[teamName] = {};
  }
  if (!priorityDeprecatedComponentsByTeamAndComponent[teamName][componentKey]) {
    priorityDeprecatedComponentsByTeamAndComponent[teamName][componentKey] = [];
  }
  if (
    !priorityDeprecatedComponentsByTeamAndComponent[teamName][componentKey].includes(
      fileWithPriorityDeprecated,
    )
  ) {
    priorityDeprecatedComponentsByTeamAndComponent[teamName][componentKey].push(
      fileWithPriorityDeprecated,
    );
  }
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
  console.log('\n--');
  console.log('Files with deprecated components:\n');

  filesWithDeprecated.forEach((file) => console.log(file));

  console.log('\nnumDeprecatedComponentFiles', filesWithDeprecated.length);
  console.log('numDeprecatedComponentInstances', numDeprecatedInstances);
};

export const logDeprecatedComponentsByTeam = (deprecatedComponentsByTeam, teamName) => {
  console.log(
    `\n${teamName} team components using deprecated components (${deprecatedComponentsByTeam[teamName].length}):\n`,
  );
  deprecatedComponentsByTeam[teamName].forEach((file) => console.log(file));
};

export const logDeprecatedMissingTeamFilesAndCounts = (filesWithDeprecatedMissingTeam) => {
  console.log('\n-- Files with deprecated components missing teams --');
  filesWithDeprecatedMissingTeam.forEach((file) => console.log(file));
  console.log(
    '\nNumber of files with deprecated components missing teams',
    filesWithDeprecatedMissingTeam.length,
  );
};

export const logPriorityDeprecatedFilesAndCounts = (
  componentKey,
  filesWithPriorityDeprecated,
  numPriorityDeprecatedInstances,
) => {
  console.log('\n--');
  console.log(
    `Num of files with deprecated ${componentKey}`,
    filesWithPriorityDeprecated[componentKey]?.length ?? 0,
  );
  console.log(
    `Num of instances of deprecated ${componentKey}`,
    numPriorityDeprecatedInstances[componentKey] ?? 0,
  );

  console.log(`\nFiles with deprecated ${componentKey}:\n`);
  filesWithPriorityDeprecated[componentKey].forEach((file) => console.log(file));
};

export const logPriorityDeprecatedHTMLElementFilesAndCounts = (
  componentKey,
  filesWithPriorityDeprecatedHTMLElements,
  numPriorityDeprecatedHTMLElements,
) => {
  console.log('\n--');
  console.log(
    `Num of files with deprecated ${componentKey} HTML elements`,
    filesWithPriorityDeprecatedHTMLElements[componentKey]?.length ?? 0,
  );
  console.log(
    `Num of instances of deprecated ${componentKey} HTML elements`,
    numPriorityDeprecatedHTMLElements[componentKey] ?? 0,
  );

  console.log(`\nFiles with deprecated ${componentKey} HTML elements:\n`);
  filesWithPriorityDeprecatedHTMLElements[componentKey].forEach((file) => console.log(file));
};

export const logPriorityDeprecatedByTeamFilesAndCounts = (
  priorityDeprecatedComponentsByTeamAndComponent,
) => {
  console.log('\n-- Priority Components By Team --');

  Object.keys(priorityDeprecatedComponentsByTeamAndComponent).forEach((teamName) => {
    Object.keys(priorityDeprecatedComponentsByTeamAndComponent[teamName]).forEach(
      (componentKey) => {
        console.log(
          `\n-- ${teamName} team files using deprecated ${componentKey} (${priorityDeprecatedComponentsByTeamAndComponent[teamName][componentKey].length}) --`,
        );
        priorityDeprecatedComponentsByTeamAndComponent[teamName][componentKey].forEach((file) =>
          console.log(file),
        );

        updateStat(
          `${teamName}NumDeprecatedFiles${componentKey}`,
          priorityDeprecatedComponentsByTeamAndComponent[teamName][componentKey].length,
        );
      },
    );
  });
};

export const logPriorityDeprecatedHTMLELementsByTeamFilesAndCounts = (
  priorityDeprecatedHTMLElementsByTeamAndComponent,
) => {
  console.log('\n-- Priority HTML Elements By Team --');

  Object.keys(priorityDeprecatedHTMLElementsByTeamAndComponent).forEach((teamName) => {
    Object.keys(priorityDeprecatedHTMLElementsByTeamAndComponent[teamName]).forEach(
      (componentKey) => {
        console.log(
          `\n-- ${teamName} team files using deprecated ${componentKey} raw HTML elements (${priorityDeprecatedHTMLElementsByTeamAndComponent[teamName][componentKey].length}) --`,
        );
        priorityDeprecatedHTMLElementsByTeamAndComponent[teamName][componentKey].forEach((file) =>
          console.log(file),
        );

        updateStat(
          `${teamName}NumDeprecatedHTMLElementFiles${componentKey}`,
          priorityDeprecatedHTMLElementsByTeamAndComponent[teamName][componentKey].length,
        );
      },
    );
  });
};

export const logPriorityDeprecatedMissingTeamFilesAndCounts = (
  filesWithPriorityDeprecatedMissingTeam,
) => {
  Object.keys(filesWithPriorityDeprecatedMissingTeam).forEach((componentKey) => {
    console.log(
      `\n-- Files with deprecated priority ${componentKey} components missing teams (${filesWithPriorityDeprecatedMissingTeam[componentKey].length}) --`,
    );
    filesWithPriorityDeprecatedMissingTeam[componentKey].forEach((file) => console.log(file));
  });
};

export const logPriorityDeprecatedHTMLElementsMissingTeamFilesAndCounts = (
  filesWithPriorityDeprecatedHTMLElementsMissingTeam,
) => {
  Object.keys(filesWithPriorityDeprecatedHTMLElementsMissingTeam).forEach((componentKey) => {
    console.log(
      `\n-- Files with deprecated priority ${componentKey} raw HTML elements missing teams (${filesWithPriorityDeprecatedHTMLElementsMissingTeam[componentKey].length}) --`,
    );
    filesWithPriorityDeprecatedHTMLElementsMissingTeam[componentKey].forEach((file) =>
      console.log(file),
    );
  });
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
  if (log) console.log('\n-- Deprecated components by team');

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

export const updatePriorityDeprecatedHTMLElementFilesAndCounts = (
  filesWithPriorityDeprecatedHTMLElements,
  numPriorityDeprecatedHTMLElements,
  log = true,
) => {
  if (log) console.log('\n-- Priority Deprecated Raw HTML Elements --');
  for (const componentKey of Object.keys(priorityDeprecatedRawHTMLElements)) {
    if (log)
      logPriorityDeprecatedHTMLElementFilesAndCounts(
        componentKey,
        filesWithPriorityDeprecatedHTMLElements,
        numPriorityDeprecatedHTMLElements,
      );

    updateStat(
      `numDeprecatedHTMLElementFiles${componentKey}`,
      filesWithPriorityDeprecatedHTMLElements[componentKey].length,
    );
    updateStat(
      `numDeprecatedHTMLElementInstances${componentKey}`,
      numPriorityDeprecatedHTMLElements[componentKey],
    );
  }
};

export const updatePriorityDeprecatedByTeamFilesAndCounts = (
  priorityDeprecatedComponentsByTeamAndComponent,
  log = true,
) => {
  if (log) {
    logPriorityDeprecatedByTeamFilesAndCounts(priorityDeprecatedComponentsByTeamAndComponent);
  }

  Object.keys(priorityDeprecatedComponentsByTeamAndComponent).forEach((teamName) => {
    Object.keys(priorityDeprecatedComponentsByTeamAndComponent[teamName]).forEach(
      (componentKey) => {
        updateStat(
          `${teamName}numDeprecatedFiles${componentKey}`,
          priorityDeprecatedComponentsByTeamAndComponent[teamName][componentKey].length,
        );
      },
    );
  });
};

export const updatePriorityDeprecatedHTMLElementsByTeamFilesAndCounts = (
  priorityDeprecatedHTMLElementsByTeamAndComponent,
  log = true,
) => {
  if (log) {
    logPriorityDeprecatedHTMLELementsByTeamFilesAndCounts(
      priorityDeprecatedHTMLElementsByTeamAndComponent,
    );
  }

  Object.keys(priorityDeprecatedHTMLElementsByTeamAndComponent).forEach((teamName) => {
    Object.keys(priorityDeprecatedHTMLElementsByTeamAndComponent[teamName]).forEach(
      (componentKey) => {
        updateStat(
          `${teamName}numDeprecatedHTMLElementFiles${componentKey}`,
          priorityDeprecatedHTMLElementsByTeamAndComponent[teamName][componentKey].length,
        );
      },
    );
  });
};

export const updateDeprecatedMissingTeamFilesAndCounts = (
  filesWithDeprecatedMissingTeam,
  log = true,
) => {
  if (log) logDeprecatedMissingTeamFilesAndCounts(filesWithDeprecatedMissingTeam);
  updateStat('crossCuttingNumDeprecatedComponentFiles', filesWithDeprecatedMissingTeam.length);
};

export const updatePriorityDeprecatedMissingTeamFilesAndCounts = (
  filesWithPriorityDeprecatedMissingTeam,
  log = true,
) => {
  if (log) logPriorityDeprecatedMissingTeamFilesAndCounts(filesWithPriorityDeprecatedMissingTeam);

  for (const componentKey of Object.keys(priorityDeprecatedComponentPaths)) {
    if (filesWithPriorityDeprecatedMissingTeam[componentKey]) {
      updateStat(
        `crossCuttingNumDeprecatedFiles${componentKey}`,
        filesWithPriorityDeprecatedMissingTeam[componentKey].length,
      );
    }
  }
};

export const updatePriorityDeprecatedHTMLElementsMissingTeamFilesAndCounts = (
  filesWithPriorityDeprecatedHTMLElementsMissingTeam,
  log = true,
) => {
  if (log)
    logPriorityDeprecatedHTMLElementsMissingTeamFilesAndCounts(
      filesWithPriorityDeprecatedHTMLElementsMissingTeam,
    );

  for (const componentKey of Object.keys(priorityDeprecatedComponentPaths)) {
    if (filesWithPriorityDeprecatedHTMLElementsMissingTeam[componentKey]) {
      updateStat(
        `crossCuttingNumDeprecatedHTMLElementFiles${componentKey}`,
        filesWithPriorityDeprecatedHTMLElementsMissingTeam[componentKey].length,
      );
    }
  }
};
