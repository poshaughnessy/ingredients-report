import objectsToCsv from 'objects-to-csv';

const DEPRECATED_CSV_FILEPATH = './output/deprecated-by-team.csv';
const PRIORITY_DEPRECATED_CSV_FILEPATH = './output/priority-deprecated-by-team.csv';

export const generateDeprecatedCsv = ()  => {
  let csvData = [];
  Object.keys(deprecatedComponentsByTeam).forEach((componentPath) => {
    Object.keys(deprecatedComponentsByTeam[componentPath]).forEach((teamName) => {
      deprecatedComponentsByTeam[componentPath][teamName].forEach((filepath) => {
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
}

export const  generatePriorityDeprecatedCsv = () => {
  let csvData = [];
  Object.keys(priorityDeprecatedComponentsByTeam).forEach((componentKey) => {
    Object.keys(priorityDeprecatedComponentsByTeam[componentKey]).forEach((teamName) => {
      priorityDeprecatedComponentsByTeam[componentKey][teamName].forEach((filepath) => {
        csvData.push({
          Team: teamName,
          'Priority component': componentKey,
          'Found in filepath': filepath,
        });
      });
    });
  });

  const csv = new objectsToCsv(csvData);
  await csv.toDisk(PRIORITY_DEPRECATED_CSV_FILEPATH);
  console.log('\nWritten CSV', PRIORITY_DEPRECATED_CSV_FILEPATH);
}
