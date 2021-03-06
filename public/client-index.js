getMostRecentStats()
  .then((mostRecentStats) => {
    getComparisonStats()
      .then((comparisonStats) => {
        let data = { stats: {} },
          latestTimestampMoment = 0;

        if (mostRecentStats) {
          mostRecentStats.forEach((stat) => {
            const timestampMoment = moment(stat.timestamp);

            if (timestampMoment > latestTimestampMoment) {
              latestTimestampMoment = timestampMoment;
            }

            data.stats[stat.key] = {
              mostRecent: {
                value: stat.value,
                formatted: formatNumberValue(stat.value),
                timestampMoment: timestampMoment,
              },
            };
          });

          if (comparisonStats) {
            comparisonStats.forEach((stat) => {
              const statRecord = data.stats[stat.key];
              if (statRecord) {
                const mostRecentValue = statRecord.mostRecent.value;
                data.stats[stat.key].comparison = {
                  value: stat.value,
                  change: mostRecentValue - stat.value,
                  changeFormatted: formatNumberValue(mostRecentValue - stat.value),
                  changePercent: (mostRecentValue / stat.value) * 100 - 100,
                  timeDiff: statRecord.mostRecent.timestampMoment.from(
                    moment(stat.timestamp),
                    true,
                  ),
                };
              }
            });
          }

          if (latestTimestampMoment > 0) {
            data.lastUpdatedTime = latestTimestampMoment.format('Do MMM YYYY');
          }
        } else {
          data.error = true;
        }

        data.priorityComponents = {
          ANCHOR_LINK: 'Links',
          BUTTON: 'Buttons',
          ICONS: 'Icons',
          TYPOGRAPHY: 'Typography',
        };

        data.priorityComponentsHTMLELements = {
          ANCHOR_LINK: 'Links',
          BUTTON: 'Buttons',
          TYPOGRAPHY: 'Typography',
        };

        data.priorityComponentsForTeam = (team) => {
          const components = [];
          Object.keys(data.priorityComponents).forEach((component) => {
            if (data.stats[`${team}NumDeprecatedFiles${component}`]) {
              components.push({ key: component, name: data.priorityComponents[component] });
            }
          });
          return components;
        };

        data.priorityComponentsForTeamHTMLElements = (team) => {
          const components = [];
          Object.keys(data.priorityComponentsHTMLELements).forEach((component) => {
            if (data.stats[`${team}NumDeprecatedHTMLElementFiles${component}`]) {
              components.push({
                key: component,
                name: data.priorityComponentsHTMLELements[component],
              });
            }
          });
          return components;
        };

        data.teams = {
          account: 'Account',
          browse: 'Browse',
          buyCheckout: 'Buy Checkout',
          buyTrolley: 'Buy Trolley',
          content: 'Content',
          customerServiceAndComms: 'Customer Service & Comms',
          identity: 'Identity',
          loyalty: 'Loyalty',
          recipes: 'Recipes',
          slots: 'Slots',
          crossCutting: 'Cross-cutting',
        };

        data.comparisonByTeamAndComponent = (team, component) => {
          return data.stats[`${team}NumDeprecatedFiles${component}`].comparison;
        };

        data.comparisonByTeamAndComponentHTMLElements = (team, component) => {
          return data.stats[`${team}NumDeprecatedHTMLELementFiles${component}`]?.comparison;
        };

        data.deprecatedOrToBeDeprecated = (component) => {
          return component === 'ANCHOR_LINK' ? 'to-be-deprecated' : 'deprecated';
        };

        data.lowercase = (string) => {
          return string && string.toLowerCase ? string.toLowerCase() : string;
        };

        new Vue({
          el: '#general-stats',
          data: data,
        });

        console.log('stats', data.stats);
      })
      .catch((err) => {
        console.error('Error', err);
      });
  })
  .catch((err) => {
    console.error('Error', err);
  });

Vue.component('stat-comparison', {
  props: ['comparison'],
  template: `<p class="change" v-if="comparison">
              <template v-if="comparison.change === 0">
                <span class="arrow same">???</span>
              </template>
              <template v-else-if="comparison.change > 0">
                <span class="arrow up">???</span>
              </template>
              <template v-else>
                <span class="arrow down">???</span>
              </template>
              {{comparison.changeFormatted}} (<span>{{comparison.timeDiff}}</span>)
            </p>`,
});
