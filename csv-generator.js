import objectsToCsv from 'objects-to-csv';

const DEPRECATED_CSV_FILEPATH = './output/deprecated-by-team.csv';
const PRIORITY_DEPRECATED_CSV_FILEPATH = './output/priority-deprecated-by-team.csv';
const PRIORITY_DEPRECATED_HTML_ELEMENTS_CSV_FILEPATH =
  './output/priority-deprecated-html-elements-by-team.csv';

export const generateDeprecatedCsv = async (
  deprecatedComponentsByTeamAndComponentPath,
  filesWithDeprecatedMissingTeamByComponentPath,
) => {
  let csvData = [];

  Object.keys(deprecatedComponentsByTeamAndComponentPath).forEach((teamName) => {
    Object.keys(deprecatedComponentsByTeamAndComponentPath[teamName]).forEach((componentPath) => {
      deprecatedComponentsByTeamAndComponentPath[teamName][componentPath].forEach((filepath) => {
        csvData.push({
          Team: teamName,
          'Deprecated component': componentPath,
          'Found in filepath': filepath,
        });
      });
    });
  });

  Object.keys(filesWithDeprecatedMissingTeamByComponentPath).forEach((componentPath) => {
    filesWithDeprecatedMissingTeamByComponentPath[componentPath].forEach((filepath) => {
      csvData.push({
        Team: 'crossCutting',
        'Deprecated component': componentPath,
        'Found in filepath': filepath,
      });
    });
  });

  const csv = new objectsToCsv(csvData);
  await csv.toDisk(DEPRECATED_CSV_FILEPATH);
  console.log('\nWritten CSV', DEPRECATED_CSV_FILEPATH);
};

export const generatePriorityDeprecatedCsv = async (
  priorityDeprecatedComponentsByTeamAndComponent,
  filesWithPriorityDeprecatedMissingTeam,
) => {
  let csvData = [];

  Object.keys(priorityDeprecatedComponentsByTeamAndComponent).forEach((teamName) => {
    Object.keys(priorityDeprecatedComponentsByTeamAndComponent[teamName]).forEach(
      (componentKey) => {
        priorityDeprecatedComponentsByTeamAndComponent[teamName][componentKey].forEach(
          (filepath) => {
            csvData.push({
              Team: teamName,
              'Priority component': componentKey,
              'Found in filepath': filepath,
            });
          },
        );
      },
    );
  });

  Object.keys(filesWithPriorityDeprecatedMissingTeam).forEach((componentKey) => {
    filesWithPriorityDeprecatedMissingTeam[componentKey].forEach((filepath) => {
      csvData.push({
        Team: 'crossCutting',
        'Priority component': componentKey,
        'Found in filepath': filepath,
      });
    });
  });

  const csv = new objectsToCsv(csvData);
  await csv.toDisk(PRIORITY_DEPRECATED_CSV_FILEPATH);
  console.log('\nWritten CSV', PRIORITY_DEPRECATED_CSV_FILEPATH);
};

export const generatePriorityDeprecatedHTMLElementsCsv = async (
  priorityDeprecatedHTMLElementsByTeamAndComponent,
  filesWithPriorityDeprecatedHTMLElementsMissingTeam,
) => {
  let csvData = [];

  Object.keys(priorityDeprecatedHTMLElementsByTeamAndComponent).forEach((teamName) => {
    Object.keys(priorityDeprecatedHTMLElementsByTeamAndComponent[teamName]).forEach(
      (componentKey) => {
        priorityDeprecatedHTMLElementsByTeamAndComponent[teamName][componentKey].forEach(
          (filepath) => {
            csvData.push({
              Team: teamName,
              'Priority component': componentKey,
              'Found in filepath': filepath,
            });
          },
        );
      },
    );
  });

  Object.keys(filesWithPriorityDeprecatedHTMLElementsMissingTeam).forEach((componentKey) => {
    filesWithPriorityDeprecatedHTMLElementsMissingTeam[componentKey].forEach((filepath) => {
      csvData.push({
        Team: 'crossCutting',
        'Priority component': componentKey,
        'Found in filepath': filepath,
      });
    });
  });

  const csv = new objectsToCsv(csvData);
  await csv.toDisk(PRIORITY_DEPRECATED_HTML_ELEMENTS_CSV_FILEPATH);
  console.log('\nWritten CSV', PRIORITY_DEPRECATED_HTML_ELEMENTS_CSV_FILEPATH);
};
