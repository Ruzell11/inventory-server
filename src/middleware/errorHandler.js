const { HTTP_INTERNAL_SERVER_ERROR } = require("../global");

const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(HTTP_INTERNAL_SERVER_ERROR).send(`Error: ${err.message}`);
};

module.exports = errorHandler;
