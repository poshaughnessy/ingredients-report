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

        data.teams = {
          account: 'Account',
          browse: 'Browse',
          buyCheckout: 'Buy Checkout',
          buyTrolley: 'Buy Trolley',
          content: 'Content',
          customerServiceAndComms: 'Customer Service & Comms',
          identity: 'Identity',
          loyalty: 'Loyalty',
          // recipes: 'Recipes',
          slots: 'Slots',
          crossCutting: 'Cross-cutting',
        };

        data.comparisonByTeamAndComponent = (team, component) => {
          return data.stats[`${team}NumDeprecatedFiles${component}`].comparison;
        };

        new Vue({
          el: '#general-stats',
          data: data,
        });
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
                <span class="arrow same">‒</span>
              </template>
              <template v-else-if="comparison.change > 0">
                <span class="arrow up">↑</span>
              </template>
              <template v-else>
                <span class="arrow down">↓</span>
              </template>
              {{comparison.changeFormatted}} (<span>{{comparison.timeDiff}}</span>)
            </p>`,
});
