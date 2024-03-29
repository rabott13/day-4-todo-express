// Dependencies

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes');
var tasks = require('./routes/tasks');

var http = require('http');
var path = require('path');


var routes = require('./routes/index');
var users = require('./routes/users');
var mongoskin = require('mongoskin');
var db = mongoskin.db('mongodb://localhost:27017?auto_reconnect', {safe:true});
var app = express();

app.use(function(req,res, next) {
    req.db = {};
    req.db.tasks = db.collection('tasks');
    next();
})
    app.locals.appname = "express.js todo app"

// view engine setup
app.set('port', process.env.PORT || 3000);
app.set('views', _dirname + '/views'));
app.set('view engine', 'jade');


app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser.json());
app.use(express.bodyParser.urlencoded());
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(express.session({
    secret: '59B93087-78BC-4EB9-993A-A61FC844F6C9'
}));
app.use(express.csrf());


app.use(require('less-middleware')({
    src: __dirname + '/public',
    compress: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req,res,next) {
    res.locals._csrf = req.session._csrf;
    return next();
})
app.use(app.router);

if('development' == app.get('env')) {
    app.use)express.errorHandler());
}
app.param('task_id', function(req,res,next, taskId) {
    req.db.tasks.findById(taskId, function(error, task) {
        if (error) return next(error);
        if (!task) return next(new Error('Task is not found'));
        req.task = task;
        return next();
    });
});

app.get('/', routes.index);
app.get('/tasks', tasks.list);
app.post('/tasks', tasks.markAllCompleted)
app.post('/tasks', tasks.add);
app.post('/tasks/:task_id', tasks.markCompleted);
app.del('/tasks/:task_id', tasks.del);
app.get('/tasks/completed', tasks.completed);

app.all('*', function(req,res) {
    res.send(404);
})

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
})