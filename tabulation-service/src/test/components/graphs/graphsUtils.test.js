const {
  prepareSyllabusGraphData,
  transformIndicatorWords,
} = require('../../../components/graphs/graphsUtils.js');

describe('Tests inside graphUtils.js file', () => {
  describe('Cases inside prepareSyllabusGraphData', () => {
    const questionsSize = 3;

    const syllabusesRateCounter = [
      [
        {
          counter: 2,
          alternative: 'SI',
          alternativeId: 5,
          denomination: 'Control Automatizado Asistido por computador',
        },
        {
          counter: 0,
          alternative: 'NO',
          alternativeId: 6,
          denomination: 'Control Automatizado Asistido por computador',
        },
        {
          counter: 1,
          alternative: 'EN PARTE',
          alternativeId: 7,
          denomination: 'Control Automatizado Asistido por computador',
        },
      ],
      [
        {
          counter: 3,
          alternative: 'SI',
          alternativeId: 5,
          denomination: 'Sistemas Expertos',
        },
        {
          counter: 0,
          alternative: 'NO',
          alternativeId: 6,
          denomination: 'Sistemas Expertos',
        },
        {
          counter: 0,
          alternative: 'EN PARTE',
          alternativeId: 7,
          denomination: 'Sistemas Expertos',
        },
      ],
    ];

    const alternatives = [
      {
        persistenceId: 5,
        description: 'SI',
        persistenceVersion: 0,
      },
      {
        persistenceId: 6,
        description: 'NO',
        persistenceVersion: 0,
      },
      {
        persistenceId: 7,
        description: 'EN PARTE',
        persistenceVersion: 0,
      },
    ];

    test('When syllabusRate Counter are provided, the returned labels should have the same size', () => {
      const preparedSyllabusData = prepareSyllabusGraphData(
        syllabusesRateCounter,
        alternatives,
        questionsSize,
      );

      const { labels } = preparedSyllabusData;

      expect(labels).toHaveLength(syllabusesRateCounter.length);
    });

    test('Should return correctly the data for alternative SI in first Syllabus', () => {
      const preparedSyllabusData = prepareSyllabusGraphData(
        syllabusesRateCounter,
        alternatives,
        questionsSize,
      );

      const { datasets: [{ data }] } = preparedSyllabusData;

      const yesOptionFirstSyllabusCounter = syllabusesRateCounter[0][0].counter;

      expect(data[0]).toBeCloseTo((yesOptionFirstSyllabusCounter * 100) / questionsSize, 5);
    });

    test('Should return correctly the data for alternative SI in second Syllabus', () => {
      const preparedSyllabusData = prepareSyllabusGraphData(
        syllabusesRateCounter,
        alternatives,
        questionsSize,
      );

      const { datasets: [{ data }] } = preparedSyllabusData;

      const yesOptionFirstSyllabusCounter = syllabusesRateCounter[1][0].counter;

      expect(data[1]).toBeCloseTo((yesOptionFirstSyllabusCounter * 100) / questionsSize, 5);
    });

    test('Should return correctly the data for alternative NO in first Syllabus', () => {
      const preparedSyllabusData = prepareSyllabusGraphData(
        syllabusesRateCounter,
        alternatives,
        questionsSize,
      );

      const { datasets: [, { data }] } = preparedSyllabusData;

      const yesOptionFirstSyllabusCounter = syllabusesRateCounter[0][1].counter;

      const percentage = (yesOptionFirstSyllabusCounter * 100) / questionsSize;

      const currentValue = percentage === 0 ? 0.3 : percentage;

      expect(data[0]).toBeCloseTo(currentValue, 5);
    });

    test('Should return correctly the data for alternative NO in second Syllabus', () => {
      const preparedSyllabusData = prepareSyllabusGraphData(
        syllabusesRateCounter,
        alternatives,
        questionsSize,
      );

      const { datasets: [, { data }] } = preparedSyllabusData;

      const yesOptionFirstSyllabusCounter = syllabusesRateCounter[1][1].counter;

      const percentage = (yesOptionFirstSyllabusCounter * 100) / questionsSize;

      const currentValue = percentage === 0 ? 0.3 : percentage;

      expect(data[1]).toBeCloseTo(currentValue, 5);
    });

    test('Should return correctly the data for alternative EN PARTE in first Syllabus', () => {
      const preparedSyllabusData = prepareSyllabusGraphData(
        syllabusesRateCounter,
        alternatives,
        questionsSize,
      );

      const { datasets: [, , { data }] } = preparedSyllabusData;

      const yesOptionFirstSyllabusCounter = syllabusesRateCounter[0][2].counter;

      const percentage = (yesOptionFirstSyllabusCounter * 100) / questionsSize;

      const currentValue = percentage === 0 ? 0.3 : percentage;

      expect(data[0]).toBeCloseTo(currentValue, 5);
    });

    test('Should return correctly the data for alternative EN PARTE in second Syllabus', () => {
      const preparedSyllabusData = prepareSyllabusGraphData(
        syllabusesRateCounter,
        alternatives,
        questionsSize,
      );

      const { datasets: [, , { data }] } = preparedSyllabusData;

      const yesOptionFirstSyllabusCounter = syllabusesRateCounter[1][2].counter;

      const percentage = (yesOptionFirstSyllabusCounter * 100) / questionsSize;

      const currentValue = percentage === 0 ? 0.3 : percentage;

      expect(data[1]).toBeCloseTo(currentValue, 5);
    });
  });

  describe('Cases inside transformIndicatorWords', () => {
    const indicator = `¿Los objetivos explicitados en el sílabo de
    la asignatura se cumplieron en su totalidad?`;

    const splittedIndicator = transformIndicatorWords(indicator);

    const expectedValue = [
      '¿Los objetivos explicitados en',
      'el sílabo de\n ',
      '  la asignatura',
      'se cumplieron en su',
      'totalidad?',
    ];

    expect(splittedIndicator).toStrictEqual(expectedValue);
  });
});
