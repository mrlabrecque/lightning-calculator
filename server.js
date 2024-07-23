//Install express server
const express = require('express');
const path = require('path');
const cors = require('cors')
const app = express();

app.options('*', cors()) // include before other routes

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/app'));

app.get('/*', function(req,res) {
    
res.sendFile(path.join(__dirname+'/dist/app/index.html'));
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);