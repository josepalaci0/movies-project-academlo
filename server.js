// app
const { app } = require('./app');

//miodels init
const { initModel } = require('./util/initModels');

// Utils
const { sequelize } = require('./util/database');

// Database authenticated
sequelize
  .authenticate()
  .then(() => console.log('Database authenticated'))
  .catch((err) => console.log(err));

//init models relations
initModel();

// Database synced with models' relations
sequelize
  .sync()
  .then(() => console.log('Database synced'))
  .catch((err) => console.log(err));

// Spin up server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Express app running on port: ${PORT}`);
});
