const process = require('process');
const { generateDocument } = require('./reportUtils');

exports.generateReport = async (req, res) => {
  const data = req.body;
  try {
    const documentPath = await generateDocument(data);
    res.json(documentPath);
  } catch (exception) {
    res.status(400).send({
      message: 'The data sent is inconsistent',
    });
  }
};

exports.downloadReport = (req, res) => {
  const { folder, documentName } = req.params;

  if (!folder || !documentName) {
    res.status(400).send({
      message: 'Folder and Document name are required',
    });
  }
  const documentPath = `${process.cwd()}/reports/${folder}/${documentName}`;
  res.download(documentPath);
};
