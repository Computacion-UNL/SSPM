/**
 * @file Manage all the configuration nedded to generate statistics graphs
 * to insert inside .docx file
 * @author Jean Carlos Alarcón <jeancalarcon98@gmail.com>
 * @author Edgar Andrés Soto <edgar.soto@unl.edu.ec>
 */
const QuickChart = require('quickchart-js');

/**
 * Prepare data to manage inside generateSyllabusGraph method.
 * @param {Object[]} syllabuses - Current syllabuses for this stage.
 * @param {Object[]} alternatives - Current alternatives for this stage.
 * @param {string} alternatives[].description - description for current alternative.
 * @param  {number} questionsSize - The amount of indicators to evaluate.
 */
function prepareSyllabusGraphData(syllabuses, alternatives, questionsSize) {
  const labels = [];
  const datasets = [];

  alternatives.forEach(({ description }) => {
    datasets.push({
      label: description,
      data: [],
    });
  });

  syllabuses.forEach((syllabus) => {
    const [{ denomination, studentsAmount }] = syllabus;
    const currentDenomination = denomination.length > 20 ? denomination.split(' ') : denomination;

    labels.push(currentDenomination);

    syllabus.forEach(({ counter, alternative }) => {
      datasets.forEach((currentData) => {
        if (currentData.label === alternative) {
          const currentValue = (counter * 100) / (questionsSize * studentsAmount);

          const dataValue = currentValue === 0 ? 0.3 : currentValue;

          currentData.data.push(dataValue);
        }
      });
    });
  });

  return {
    labels,
    datasets,
  };
}
/**
 * Generate .png image with statistic graph according data passed.
 * @param  {string} titleGraph - The title of the graph
 * @param  {string} grade - The current grade that the graph will be generated.
 * @param  {Object[]} syllabuses - Current grade syllabuses.
 * @param  {Object[]} alternatives - Current stage alternatives.
 * @param  {number} questionsSize - The amount of indicators to evaluate.
 */
async function generateSyllabusGraph(
  titleGraph,
  grade,
  syllabuses,
  alternatives,
  questionsSize,
) {
  const { labels, datasets } = prepareSyllabusGraphData(
    syllabuses,
    alternatives,
    questionsSize,
  );

  const myChart = new QuickChart();
  myChart
    .setConfig({
      type: 'horizontalBar',
      data: {
        labels,
        datasets,
      },
      options: {
        title: {
          display: true,
          text: [titleGraph, grade],
        },
        scales: {
          xAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
        plugins: {
          datalabels: {
            color: 'black',
            font: {
              weight: 'bold',
            },
            anchor: 'bottom',
            align: 'end',
            formatter: (value) => {
              if (value === 0.3) return `${(0).toFixed(2)}%`;
              return `${value.toFixed(2)}%`;
            },
          },
        },
      },
    })
    .setWidth(900)
    .setHeight(400)
    .setBackgroundColor('white');

  await myChart.toFile('myChart.png');

  return 'myChart.png';
}

/**
 * Returns a splited word if word passed is big.
 * @param {string} word - word to split.
 */
function transformIndicatorWords(word) {
  const arrayWord = word.split(' ');
  const rows = [];
  let rowArray = [];

  if (arrayWord.length < 4) {
    return word;
  }

  for (let i = 0; i < arrayWord.length; i += 4) {
    for (let j = i; j <= i + 3; j += 1) {
      if (j < arrayWord.length) {
        rowArray.push(arrayWord[j]);
      }
    }
    rows.push(rowArray.join(' '));
    rowArray = [];
  }

  return rows;
}

/**
 * Prepare data to manage inside generateIndicatorsGraph method.
 * @param  {Object[]} indicatorsData - information according indicators data.
 * @param  {Object[]} alternatives - Current stage alternatives.
 */
function prepareIndicatorsGraphData(indicatorsData, alternatives) {
  const labels = [];
  const datasets = [];

  alternatives.forEach(({ description }) => {
    datasets.push({
      label: description,
      data: [],
    });
  });

  for (let index = 0; index < indicatorsData.length; index += 1) {
    const currentArray = indicatorsData[index];
    const indicatorTitle = currentArray[0];

    labels.push(transformIndicatorWords(indicatorTitle));

    const arrayLength = currentArray.length;

    for (let currentIndexArray = 1; currentIndexArray < arrayLength; currentIndexArray += 1) {
      const currentValue = currentArray[currentIndexArray];
      const dataValue = currentValue === 0 ? 0.3 : currentValue;
      datasets[currentIndexArray - 1].data.push(dataValue);
    }
  }

  return {
    labels,
    datasets,
  };
}
/**
 * @param  {string} titleGraph - The title of the graph
 * @param  {string} grade - The current grade that the graph will be generated.
 * @param  {Object[]} indicatorsData - information according indicators data.
 * @param  {Object[]} alternatives - Current stage alternatives.
 */
async function generateIndicatorsGraph(titleGraph, grade, indicatorsData, alternatives) {
  const { labels, datasets } = prepareIndicatorsGraphData(indicatorsData, alternatives);

  const myChart = new QuickChart();

  myChart
    .setConfig({
      type: 'horizontalBar',
      data: {
        labels,
        datasets,
      },
      options: {
        title: {
          display: true,
          text: [titleGraph, grade],
        },
        scales: {
          xAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
        plugins: {
          datalabels: {
            color: 'black',
            font: {
              weight: 'bold',
            },
            anchor: 'bottom',
            align: 'end',
            formatter: (value) => {
              if (value === 0.3) return `${(0).toFixed(2)}%`;
              return `${value.toFixed(2)}%`;
            },
          },
        },
      },
    })
    .setWidth(900)
    .setHeight(1300)
    .setBackgroundColor('white');

  await myChart.toFile('myIndicatorsChart.png');

  return 'myIndicatorsChart.png';
}

module.exports = {
  generateSyllabusGraph,
  generateIndicatorsGraph,
  prepareSyllabusGraphData,
  transformIndicatorWords,
};
