require('dotenv').config();
const { SenderMailServer } = require('./server/config/email-config');
const connectDB = require('./server/config/connectDB');
const app = require('./server/app');

// Connect to database
connectDB();
// Set up mail server
SenderMailServer();

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
