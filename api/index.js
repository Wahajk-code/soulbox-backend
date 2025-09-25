const app = require("../src/index");

// Wrap Express app for Vercel
module.exports = (req, res) => {
  return app(req, res);
};
