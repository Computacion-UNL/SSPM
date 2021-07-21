/**
 * @file Manage all the configuration nedded to generate .docx file
 * @author Jean Carlos Alarcón <jeancalarcon98@gmail.com>
 * @author Edgar Andrés Soto <edgar.soto@unl.edu.ec>
 */
const docx = require('docx');
const fs = require('fs');
const process = require('process');
const { generateSyllabusGraph, generateIndicatorsGraph } = require('../graphs/graphsUtils');

const {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  Media,
  AlignmentType,
  VerticalAlign,
  TextRun,
  PageBreak,
} = docx;

let verticalPercentage = 0;
/**
 * Generate grade name by entering a grade number.
 * @example <caption> Usage of <b>getGradeNameByNumber()</b></caption>
 * getGradeNameByNumber(2);
 * @param  {number} number - Number of the grade, only numbers accepts [1..10].
 * @returns {string} The name of the grade entered.
 */
function getGradeNameByNumber(number) {
  switch (number) {
    case 1: return 'Primer';
    case 2: return 'Segundo';
    case 3: return 'Tercer';
    case 4: return 'Cuarto';
    case 5: return 'Quinto';
    case 6: return 'Sexto';
    case 7: return 'Séptimo';
    case 8: return 'Octavo';
    case 9: return 'Noveno';
    case 10: return 'Décimo';
    default: return undefined;
  }
}

/**
 * Generate a paragraph, it will be used as initial title after table.
 * @param  {string} text - The text that will be displayed
 * @param  {number} fontSize - The size of the text
 * @param  {number} alignment - Text alignment, if is 0 aligment will be LEFT else CENTER.
 * @returns {Paragraph} Paragraph object, it is part of the .docx library.
 */
function generateTitle(text, fontSize, alignment) {
  const currentAlignment = alignment === 0 ? AlignmentType.LEFT : AlignmentType.CENTER;

  const paragraph = new Paragraph({
    children: [new TextRun({
      text,
      bold: true,
      size: fontSize,
    })],
    alignment: currentAlignment,
  });

  return paragraph;
}

/**
 * Returns the short denomination of the Stage.
 * @param  {string} stage - The current stage (Mitad de ciclo || Final de ciclo).
 * @returns {string} short denomination of the stage (MITAD || FINAL).
 */
function getShortDenominationStage(stage) {
  const stages = {
    middleStage: 'MITAD DE CICLO',
    middle: 'MITAD',
    endStage: 'FINAL DE CICLO',
    end: 'FINAL',
  };

  return stage.toUpperCase() === stages.middleStage ? stages.middle : stages.end;
}
/**
 * Generate the main row of the table.
 * @param  {string} stage - The current stage (Mitad de ciclo || Final de ciclo).
 * @param  {number} columnSpan - The number of the columns that cell inside row will be expanded.
 * @returns {TableRow} TableRow object, it is part of the .docx library
 */
function generateTableHeader(stage, columnSpan) {
  const shortStageDenomination = getShortDenominationStage(stage);

  const headerTitle = `APLICACIÓN A ${shortStageDenomination} DEL PERÍODO ACADÉMICO`;

  const cellChild = [
    new Paragraph({
      children: [new TextRun({
        text: headerTitle,
        bold: true,
      })],
      alignment: AlignmentType.CENTER,
    }),
  ];

  const tableHeader = new TableRow({
    children: [
      new TableCell({
        children: cellChild,
        columnSpan,
      }),
    ],
  });

  return tableHeader;
}
/**
 * Generate a table row with multiple cells according childrenArray size
 * @param  {Object[]} childrenArray - The cells that will be displayes inside the row.
 * @param  {string} childrenArray[].content - The content cell.
 * @param  {number} childrenArray[].rowSpan? - The number of the rows that the cell inside row
 * will be expanded.
 * @param  {number} childrenArray[].columnSpan? - The number of the columns that the cell inside
 * row will be expanded.
 * @returns  {TableRow} TableRow object with the same amount cell of the childrenArray elements,
 * it is part of the .docx library
 */
function generateTableRow(childrenArray) {
  const generatedChildren = [];

  childrenArray.forEach((child) => {
    const textContent = {
      text: child.content,
      bold: true,
    };

    if (child.size) {
      textContent.size = child.size;
      /**
       * Only if size is specified  and is not specified bold style we remove default bold style.
       * This approach only executes if the childrenArray belongs to indicators.
       */
      if (!child.bold) {
        delete textContent.bold;
      }
    }

    const currentParagraphContent = {
      children: [new TextRun(textContent)],
      alignment: AlignmentType.CENTER,
    };

    if (child.alignment) {
      currentParagraphContent.alignment = child.alignment;
    }

    const cellChild = [
      new Paragraph(currentParagraphContent),
    ];

    const currentTableCell = new TableCell({
      children: cellChild,
      rowSpan: child.rowSpan ? child.rowSpan : 1,
      columnSpan: child.columnSpan ? child.columnSpan : 1,
      verticalAlign: VerticalAlign.CENTER,
    });

    generatedChildren.push(currentTableCell);
  });

  const tableRow = new TableRow({
    children: generatedChildren,
  });

  return tableRow;
}

/**
 * Generate a table row with multiple cell with each syllabus denomination
 * @param {number} gradeNumber - The grade number
 * @param {Object[]} syllabuses - The syllabuses of the grade.
 * @param {number} syllabuses[].denomination - The syllabus denomination.
 * @param {number} alternativesSize - The value that ITEMS and PERCENTAGE will be expanded in column
 * @returns {TableRow} TableRow object with cells according syllabuses size and three more
 * aditional cell, it is part of the .docx library
 */
function generateSyllabusRow(gradeNumber = 0, syllabuses = [], alternativesSize = 0) {
  const syllabusHeader = [];
  const gradeName = getGradeNameByNumber(gradeNumber);
  const currentCicle = `${gradeName} Ciclo`;

  syllabusHeader.push({
    content: currentCicle,
    rowSpan: 2,
  });

  syllabuses.forEach(({ denomination }) => {
    syllabusHeader.push({
      content: denomination,
      size: 16,
      bold: true,
    });
  });

  syllabusHeader.push(
    {
      content: 'ITEMS',
      columnSpan: alternativesSize,
      size: 16,
      bold: true,
    },
    {
      content: 'PORCENTAJE',
      columnSpan: alternativesSize,
      size: 16,
      bold: true,
    },
  );

  return generateTableRow(syllabusHeader);
}
/**
 * Generate Teachers row according teacher's name in each syllabus.
 * @param {Object[]} syllabuses - The syllabus of the grade.
 * @param {Object} syllabuses[].teacher - The syllabus teacher.
 * @param {string} syllabuses[].teacher.name - The syllabus teacher's name.
 * @param {Object[]} alternatives - The alternatives for each indicator.
 * @param {string} alternatives[].description - Alternative description.
 */
function generateTeachersRow(syllabuses = [], alternatives = []) {
  const teacherHeader = [];

  syllabuses.forEach(({ teacher }) => {
    teacherHeader.push({
      content: teacher.name,
      size: 16,
      bold: true,
    });
  });

  for (let index = 0; index < 2; index += 1) {
    alternatives.forEach(({ description }) => {
      teacherHeader.push({
        content: description,
        size: 16,
        bold: true,
      });
    });
  }

  return generateTableRow(teacherHeader);
}
/**
 * Generate title question row according current grade.
 * @param  {string} parallel - The current grade parallel
 * @param  {number} syllabusesSize - The amount of syllabus in current grade, used for
 * expanded correctly.
 * @param  {number} alternativesSize - The amount of alternatives, used for
 * generate corrcetly with empty cells.
 */
function generateTitleQuestionRow(parallel = '', syllabusesSize, alternativesSize) {
  const indicatorsTitle = 'INDICADORES';
  const currentParallel = `PARALELO ${parallel}`;

  const contentArray = [
    {
      content: indicatorsTitle,
    },
    {
      content: currentParallel,
      columnSpan: syllabusesSize,
    },
  ];

  /**
   * Only to fill with empty data to set table format
   */
  for (let index = 0; index < alternativesSize * 2; index += 1) {
    contentArray.push({
      content: '',
    });
  }

  return generateTableRow(contentArray);
}
/**
 * Prepare all data concerned to the indicators only to generate each row.
 * It's important to indicate that each indicator is called question.
 * @param {Object[]} questions - Current indicators for this Stage.
 * @param {number} questions[].persistenceId - Id for each Indicator.
 * @param {string} questions[].description - Description of each indicator.
 * @param {Object[]} syllabuses - Current alternatives for this stage.
 * @param {Object[]} syllabuses[].sheets - Rated sheets for each Syllabus.
 * @param {Object[]} syllabuses[].sheets[].answers - Answers of the current Sheet.
 * @param {string} syllabuses[].sheets[].answers.question - question id for the current answer,
 * this Id must be exist inside <b>questions</b> array..
 * @param {string} syllabuses[].sheets[].answers.alternative - alternative id for the current answer
 * this Id must be exist inside <b>alternatives</b> array.
 * @param {Object[]} alternatives - Current alternatives for this stage.
 * @param {string} alternatives[].persistenceId - Id for each alternative.
 * @param {string} alternatives[].description - Description for each alternative.
 * @param {string} stage - MITAD DE CICLO || FINAL DE CICLO, this parameter is required to capture
 * the current sheet that needs to be tabulated.
 */
function prepareIndicatorsData(questions, syllabuses, alternatives, stage) {
  let totalItemsPercentage = 0;
  let areThereYesAlternative = false;

  const sheetNumber = getShortDenominationStage(stage) === 'MITAD' ? 0 : 1;
  let amountOfStudents = 0;

  syllabuses.forEach(({ sheets }) => {
    const currentSheets = sheets[sheetNumber];
    amountOfStudents += currentSheets.length;
  });

  const allRows = [];
  let currentRow = [];

  const indicatorsGraphData = [];
  let currentIndicatorGraphData = [];

  const counterAlternatives = [];
  const alternativesPerSyllabus = [];

  alternatives.forEach((alternative) => {
    delete alternative.persistenceVersion;
    alternative.counter = 0;
    counterAlternatives.push(alternative);
    const alternativePerSyllabus = { ...alternative };
    alternativesPerSyllabus.push(alternativePerSyllabus);
  });

  questions.forEach(({ persistenceId, description }, index) => {
    const currentIndicator = `${index + 1}. ${description}`;

    currentRow.push(currentIndicator);
    currentIndicatorGraphData.push(currentIndicator);

    syllabuses.forEach(({ sheets }) => {
      const currentSheets = sheets[sheetNumber];
      currentSheets.forEach((currentSheet) => {
        currentSheet.answers.forEach(({ question, alternative }) => {
          if (question !== 'percentage') {
            const questionId = parseInt(question, 10);
            if (persistenceId === questionId) {
              counterAlternatives.forEach((counterAlternative, alternativeIndex) => {
                const alternativeId = parseInt(alternative, 10);
                if (counterAlternative.persistenceId === alternativeId) {
                  counterAlternative.counter += 1;
                  alternativesPerSyllabus[alternativeIndex].counter += 1;
                }
              });
            }
          }
        });
      });

      let value = '';

      alternativesPerSyllabus.forEach((currentAlternative, currentIndex) => {
        const separator = currentIndex !== alternativesPerSyllabus.length - 1 ? '-' : '';
        value += `${currentAlternative.counter} ${separator} `;
        currentAlternative.counter = 0;
      });
      currentRow.push(value);
    });

    counterAlternatives.forEach(({ counter }) => {
      currentRow.push(counter.toString());
    });

    counterAlternatives.forEach((counterAlternative) => {
      const { counter, description: currentDescription } = counterAlternative;
      const percentageIndicator = (counter * 100) / amountOfStudents;

      if (currentDescription.toUpperCase() === 'SI') {
        areThereYesAlternative = true;
        totalItemsPercentage += percentageIndicator;
      }

      currentRow.push(`${percentageIndicator.toFixed(2)}%`);

      currentIndicatorGraphData.push(percentageIndicator);
      counterAlternative.counter = 0;
    });

    indicatorsGraphData.push(currentIndicatorGraphData);
    currentIndicatorGraphData = [];

    allRows.push(currentRow);
    currentRow = [];
  });

  if (areThereYesAlternative) {
    totalItemsPercentage /= questions.length;
    verticalPercentage = totalItemsPercentage;
  }

  return {
    allRows,
    indicatorsGraphData,
  };
}
/**
 * Generate simple row, only with content, without columnspan or rowSpan.
 * @param  {Object[]} row - Object of primitives values, like strings or numbers, example:
 * ["1. Indicator 1", "Yes", "NO", "NO","2", "0", "0"];
 */
function generateSimpleRow(row) {
  const indicatorRow = [];

  row.forEach((item, index) => {
    const contentObject = {
      content: item,
      size: 18,
    };

    if (item.includes('%')) {
      contentObject.bold = true;
    }

    if (index === 0) {
      contentObject.alignment = AlignmentType.JUSTIFIED;
    }

    indicatorRow.push(contentObject);
  });

  return generateTableRow(indicatorRow);
}
/**
 * @param  {string} stage - MITAD DE CICLO || FINAL DE CICLO, this parameter is required to capture
 * the current sheet that needs to be tabulated.
 * @param {Object[]} syllabuses - Current syllabuses for this grade.
 * @param {string} syllabuses[].denomination - Denomination of the current syllabus.
 * @param {Object[]} syllabuses[].sheets - Rated sheets for each Syllabus.
 * @param {Object[]} syllabuses[].sheets[].answers - Answers of the current Sheet.
 * @param {string} syllabuses[].sheets[].answers.question - question id for the current answer,
 * this Id must be exist inside <b>questions</b> array..
 * @param {string} syllabuses[].sheets[].answers.alternative - alternative id for the current answer
 * this Id must be exist inside <b>alternatives</b> array.
 * @param {Object[]} alternatives - Current alternatives for this stage.
 * @param {string} alternatives[].persistenceId - Id for each alternative.
 * @param {string} alternatives[].description - Description for each alternative.
 * @param {number} questionsSize, the amount of indicators/questions in the current stage.
 */
function prepareFinalRows(stage, syllabuses, alternatives, questionsSize) {
  const defaultAlternatives = ['SI', 'NO', 'EN PARTE'];
  let areTheDefaultAlternatives = true;

  const sheetNumber = getShortDenominationStage(stage) === 'MITAD' ? 0 : 1;
  let amountOfStudents = 0;

  const syllabusesRateCounter = [];

  syllabuses.forEach(({ sheets, denomination }, index) => {
    const currentSyllabuses = [];

    alternatives.forEach(({ description, persistenceId }) => {
      if (!defaultAlternatives.includes(description.toUpperCase())) {
        areTheDefaultAlternatives = false;
      }

      currentSyllabuses.push({
        counter: 0,
        alternative: description,
        alternativeId: persistenceId,
        denomination,
      });
    });

    syllabusesRateCounter.push(currentSyllabuses);

    const currentSheets = sheets[sheetNumber];
    amountOfStudents = currentSheets.length;

    currentSheets.forEach((currentSheet) => {
      currentSheet.answers.forEach(({ question, alternative }) => {
        /**
         * Verify if questions is different that 'percentage', because percentage is passed
         * only on second stage, and this does not need to be calculated for the final percentage.
         */
        if (question !== 'percentage') {
          const currentAlternativeId = parseInt(alternative, 10);

          syllabusesRateCounter[index].forEach((currentSyllabus) => {
            if (currentAlternativeId === currentSyllabus.alternativeId) {
              currentSyllabus.counter += 1;
            }
          });
        }
      });
    });
  });

  const rowsContent = [];
  let currentRowContent = [];

  const rowsContentPercentage = [];
  let currentRowContentPercentage = [];

  let totalPercentage = 0;

  alternatives.forEach(({ description }, index) => {
    currentRowContent.push({ content: description });
    currentRowContentPercentage.push({ content: description });

    syllabusesRateCounter.forEach((currentSyllabus) => {
      const currentCounter = currentSyllabus[index].counter;
      currentSyllabus[index].studentsAmount = amountOfStudents;
      const currentPercentage = (currentCounter * 100) / (questionsSize * amountOfStudents);
      const counterPercentage = currentPercentage.toFixed(2);
      currentRowContent.push({ content: currentCounter.toString() });
      currentRowContentPercentage.push({ content: `${counterPercentage}%` });

      if (description.toUpperCase() === 'SI') {
        totalPercentage += currentPercentage;
      }
    });

    if (areTheDefaultAlternatives) {
      if (description.toUpperCase() === 'SI') {
        totalPercentage /= syllabusesRateCounter.length;

        currentRowContent.push({
          content: 'TOTAL ITEMS',
          rowSpan: 3,
          columnSpan: 3,
        });

        currentRowContent.push({
          content: `${verticalPercentage.toFixed(2)}%`,
          columnSpan: 3,
        });

        currentRowContentPercentage.push({
          content: 'PORCENTAJE TOTAL',
          rowSpan: 3,
          columnSpan: 3,
        });

        currentRowContentPercentage.push({
          content: `${totalPercentage.toFixed(2)}%`,
          rowSpan: 3,
          columnSpan: 3,
        });
      }

      if (description.toUpperCase() === 'NO') {
        currentRowContent.push({
          content: 'TOTAL CUMPLIMIENTO',
          rowSpan: 2,
          columnSpan: 3,
        });
      }
    }

    rowsContent.push(currentRowContent);
    rowsContentPercentage.push(currentRowContentPercentage);
    currentRowContent = [];
    currentRowContentPercentage = [];
  });

  return { syllabusesRateCounter, rowsContent, rowsContentPercentage };
}
/**
 * Generate automatically widths of each cell, this approach is compatible with all formats
 * (Google Docs, Libre Office and Microsoft word)
 * @param  {number} syllabusesLenght amount of syllabuses.
 * @param  {number} alternativesLength amoount of alternatives.
 * @returns {number[]} array with all widths values
 */
function generateAutomaticallyWidths(syllabusesLenght, alternativesLength) {
  const columnWidths = [];
  let originalWidth = 9638;
  const widthIndicatorColumn = 2838;
  columnWidths.push(widthIndicatorColumn);
  originalWidth -= widthIndicatorColumn;

  const attributesAmount = syllabusesLenght + (alternativesLength * 2);

  const restAttributesWidth = originalWidth / attributesAmount;

  for (let i = 0; i < attributesAmount; i += 1) {
    columnWidths.push(restAttributesWidth);
  }

  return columnWidths;
}

/**
 * Generate Table to insert inside .docx, each table represents tabulated date for each grade.
 * @param  {Object[]} syllabuses - Current Syllabuses for this grade.
 * @param  {string} parallel - Current Parallel
 * @param  {number} number - Current grade number.
 * @param  {Object[]} alternatives - Alternatives for the current stage.
 * @param  {string} stage - MITAD DE CICLO || FINAL DE CICLO, this parameter is required to capture
 * the current sheet that needs to be tabulated.
 * @param  {Object[]} questions - Current indicators for this Stage.
 */
function generateTable(syllabuses, parallel, number, alternatives, stage, questions) {
  const alternativesSize = alternatives.length;
  const syllabusesSize = syllabuses.length;
  const questionsSize = questions.length;
  /**
   * To understand this -> verify Table header.
   * Alternatives repeat two times (*2)
   * Each grade syllabus takes a space.
   * 1 => First column title (Séptimo, Octavo ciclo);
   */
  const tableRows = [];
  const tableHeaderColumnSpan = alternativesSize * 2 + syllabuses.length + 1;
  const tableHeader = generateTableHeader(stage, tableHeaderColumnSpan);
  const syllabusRow = generateSyllabusRow(number, syllabuses, alternativesSize);
  const teachersRow = generateTeachersRow(syllabuses, alternatives);
  const titleQuestionRow = generateTitleQuestionRow(parallel, syllabusesSize, alternativesSize);

  tableRows.push(tableHeader, syllabusRow, teachersRow, titleQuestionRow);

  const { allRows } = prepareIndicatorsData(questions, syllabuses, alternatives, stage);

  allRows.forEach((indicatorRow) => {
    const currentIndicatorRow = generateSimpleRow(indicatorRow);
    tableRows.push(currentIndicatorRow);
  });

  const {
    rowsContent,
    rowsContentPercentage,
  } = prepareFinalRows(stage, syllabuses, alternatives, questionsSize);

  rowsContent.forEach((finalRow) => {
    const currentFinalRow = generateTableRow(finalRow);
    tableRows.push(currentFinalRow);
  });

  rowsContentPercentage.forEach((finalRowPercentage) => {
    const currentFinalRowPercentage = generateTableRow(finalRowPercentage);
    tableRows.push(currentFinalRowPercentage);
  });

  const columnWidths = generateAutomaticallyWidths(syllabuses.length, alternatives.length);

  const table = new Table({
    rows: tableRows,
    width: 0,
    columnWidths,
  });

  return table;
}

/**
 * Generates random name for the current .docx report.
 * @param  {string} degree - The name of the degree.
 * @param  {string} stage - MITAD DE CICLO || FINAL DE CICLO.
 * @param  {string} initDate - the period init date.
 */
function getRandomDocumentName(degree, stage, initDate) {
  const randomNumber = new Date().getMilliseconds();
  const currentStage = getShortDenominationStage(stage);
  const basePath = `${process.cwd()}/reports`;

  const degreePath = `${basePath}/${degree}`;

  if (!fs.existsSync(degreePath)) {
    fs.mkdirSync(degreePath);
  }

  const documentName = `report-${currentStage}-${initDate}-${randomNumber}.docx`;

  return {
    documentName,
    folder: degree,
  };
}

/**
 * Returns the same word with first letter capitalize.
 * @param {string} word.
 */
function capitalizeFirstLetter(word) {
  return word.charAt(0).toUpperCase() + word.toLowerCase().slice(1);
}

/**
 * Generate .docx document.
 * @param {data} All data.
 * @param {Object} data.period all data related to the current period.
 */
async function generateDocument({ period }) {
  const {
    degree,
    initDate,
    stage,
    questions,
    alternatives,
    evaluationGrades: grades,
  } = period;

  const children = [];

  const document = new Document();

  for (const [index, grade] of grades.entries()) {
    const {
      syllabuses,
      parallel,
      number,
    } = grade;

    const gradeName = getGradeNameByNumber(number);
    const text = `${gradeName} Ciclo '${parallel}'`;
    const paragraph = generateTitle(text, 30, 0);
    const tableGrade = generateTable(syllabuses, parallel, number, alternatives, stage, questions);
    const currentGrade = `${gradeName} '${parallel}'`;

    /**
     * Generate Syllabus Graph
     */
    const { syllabusesRateCounter } = prepareFinalRows(
      stage,
      syllabuses,
      alternatives,
      questions.length,
    );

    const currentStage = getShortDenominationStage(stage);
    const capitalizeCurrentStage = capitalizeFirstLetter(currentStage);
    const titleSyllabusGraph = `Resumen de cumplimiento por Asignatura a ${capitalizeCurrentStage} de periodo`;

    const pathSyllabusGraph = await generateSyllabusGraph(
      titleSyllabusGraph,
      currentGrade,
      syllabusesRateCounter,
      alternatives,
      questions.length,
    );
    const syllabusGraph = Media.addImage(document, fs.readFileSync(`${process.cwd()}/${pathSyllabusGraph}`), 630, 400);

    const syllabusGraphParagraph = new Paragraph({
      children: [syllabusGraph],
      alignment: AlignmentType.CENTER,
    });

    /**
     * Generate indicators Graph
     */
    const titleIndicatorsGraph = `Resumen de cumplimiento por Indicador a ${capitalizeCurrentStage} de periodo`;
    const { indicatorsGraphData } = prepareIndicatorsData(
      questions,
      syllabuses,
      alternatives,
      stage,
    );

    const pathIndicatorsGraph = await generateIndicatorsGraph(
      titleIndicatorsGraph,
      currentGrade,
      indicatorsGraphData,
      alternatives,
    );
    const indicatorsGraph = Media.addImage(document, fs.readFileSync(`${process.cwd()}/${pathIndicatorsGraph}`), 630, 800);

    const indicatorsGraphParagraph = new Paragraph({
      children: [indicatorsGraph],
      alignment: AlignmentType.CENTER,
    });

    children.push(
      paragraph,
      tableGrade,
      syllabusGraphParagraph,
      indicatorsGraphParagraph,
    );

    /**
     * Insert Page Break.
     */
    const pageBreak = new docx.Paragraph({
      children: [new PageBreak()],
    });

    if (index !== grades.length - 1) {
      children.push(pageBreak);
    }
  }

  const pathInformation = getRandomDocumentName(degree, stage, initDate);
  const { documentName, folder } = pathInformation;

  document.addSection({
    children,
  });

  const buffer = await Packer.toBuffer(document);
  const pathToSave = `reports/${folder}/${documentName}`;

  fs.writeFileSync(pathToSave, buffer);
  return pathInformation;
}

module.exports = {
  generateDocument,
  getGradeNameByNumber,
  getShortDenominationStage,
  generateTableHeader,
  generateTableRow,
  generateSyllabusRow,
  generateTeachersRow,
  generateTitleQuestionRow,
  prepareIndicatorsData,
  generateSimpleRow,
  prepareFinalRows,
  getRandomDocumentName,
  capitalizeFirstLetter,
};
