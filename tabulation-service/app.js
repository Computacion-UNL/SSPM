const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const reportRoutes = require('./src/components/report/reportRoute');
/**
 * Global configuration
 */
require('./config/config');

app.use(bodyParser.json());

app.use('/api/docx', reportRoutes);

app.listen(process.env.PORT, () => {
  console.log(`We are running node in port: ${process.env.PORT}`);
});
