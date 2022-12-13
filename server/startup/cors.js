const cors = require('cors');

module.exports = function(app) {
  app.use(cors({origin: true, credentials: true}));
  app.use(function(req, res, next) {
    res.header(
        'Access-Control-Allow-Headers',
        'Authorization, Content-Type, Accept, Origin, X-Requested-With',
    );
    res.header('Access-Control-Allow-Credentials', true);
    res.header('X-Frame-Options', 'SAMEORIGIN');
    next();
  });
};
