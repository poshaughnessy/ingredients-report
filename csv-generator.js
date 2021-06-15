import objectsToCsv from 'objects-to-csv';

const DEPRECATED_CSV_FILEPATH = './output/deprecated-by-team.csv';
const PRIORITY_DEPRECATED_CSV_FILEPATH = './output/priority-deprecated-by-team.csv';

export const generateDeprecatedCsv = async (deprecatedComponentsByTeamAndComponentPath) => {
  let csvData = [];

  console.log(
    'deprecatedComponentsByTeamAndComponentPath',
    deprecatedComponentsByTeamAndComponentPath,
  );

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

  const csv = new objectsToCsv(csvData);
  await csv.toDisk(DEPRECATED_CSV_FILEPATH);
  console.log('\nWritten CSV', DEPRECATED_CSV_FILEPATH);
};

export const generatePriorityDeprecatedCsv = async (
  priorityDeprecatedComponentsByTeamAndComponent,
) => {
  let csvData = [];

  console.log(
    'priorityDeprecatedComponentsByTeamAndComponent',
    priorityDeprecatedComponentsByTeamAndComponent,
  );

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

  const csv = new objectsToCsv(csvData);
  await csv.toDisk(PRIORITY_DEPRECATED_CSV_FILEPATH);
  console.log('\nWritten CSV', PRIORITY_DEPRECATED_CSV_FILEPATH);
};
