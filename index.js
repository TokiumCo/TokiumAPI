const express = require('express');
const app = express();


if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config({
        path: `${__dirname}/.env.development.local`
    })       
}

require('dotenv').config();
require('./server/startup/cors')(app);
require('./server/startup/routes')(app);

const port = process.env.PORT || 8080;

app.listen(port, function () {
    console.log("Running on port " + port)
});
