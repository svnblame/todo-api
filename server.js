var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');

var app = express();
var PORT = process.env.PORT || 3000;

// ToDo list (collection)
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('Todo API Root');
});

app.get('/todos', function(req, res) {
    var query = req.query;
    var where = {};

    // If 'completed' query parameter was provided, return items filtered on provided value 
    // (true or false)
    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    // If 'q' query parameter was provided, return items filtered on provided value
    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%'
        };
    }

    db.todo.findAll({
        where: where
    }).then(function(todos) {
        res.json(todos);
    }, function() {
        res.status(500).send();
    });
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);

    db.todo.findById(todoId).then(function(todo) {
        if (!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        }
    }, function(e) {
        res.status(500).send();
    })
});

// POST /todos
app.post('/todos', function(req, res) {

    // only allow completed and description fields to be posted
    var body = _.pick(req.body, 'completed', 'description');

    // call create on db.todo
    db.todo.create(body).then(function(todo) {
        res.json(todo.toJSON());
    }, function(e) {
        res.status(400).json(e);
    });

});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id);
    db.todo.destroy({
        where: {
            id: todoId
        }
    }).then(function(rowsDeleted) {
        if (rowsDeleted === 0) {
            res.status(404).json({
                error: 'No todo with that id found'
            })
        } else {
            res.status(204).send();
        }
    }, function() {
        res.status(500).send();
    });
});

// PUT /todos/:id -- Update a specific todo record
app.put('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id);
    var body = _.pick(req.body, 'completed', 'description');
    var attributes = {};

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    // Update
    db.todo.findById(todoId).then(function(todo) {
        if (todo) {
            todo.update(attributes).then(function(todo) {
                res.json(todo.toJSON());
            }, function(e) {
                res.status(400).json(e);
            });
        } else {
            res.status(404).send();
        }
    }, function() {
        res.status(500).send();
    });
});

// POST /users
app.post('/users', function(req, res) {
    // only allow email and password fields to be posted
    var body = _.pick(req.body, 'email', 'password');

    // call create on db.user
    db.user.create(body).then(function(user) {
        res.json(user.toPublicJSON());
    }, function(e) {
        res.status(400).json(e);
    });
});

// POST /users/login
app.post('/users/login', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.authenticate(body).then(function(user) {
        res.json(user.toPublicJSON());
    }, function() {
        res.status(401).send();
    });
});

db.sequelize.sync( {force: true} ).then(function() {
    app.listen(PORT, function() {
        console.log('Express listening on port ' + PORT);
    });
});