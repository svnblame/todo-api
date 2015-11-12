var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

// ToDo list (collection)
var todos = [
    // todo items (model(s))
    {
        id: 1,
        description: 'Meet Mom for dinner',
        completed: false
    }, {
        id: 2,
        description: 'Go to Cherry Valley Mall',
        completed: false
    }, {
        id: 3,
        description: 'Get new dumb phones',
        completed: true
    }, {
        id: 4,
        description: 'Go shopping at Meijers',
        completed: true
    }
];

app.get('/', function(req, res) {
    res.send('Todo API Root');
});

app.get('/todos', function(req, res) {
    res.json(todos);
});

app.get('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);

    // Iterate over todos array and find the match
    var matchedTodo;

    todos.forEach(function(todo) {
        if (todoId === todo.id) {
            matchedTodo = todo;
        }
    });

    if (matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send('Match not found');
    }
});

app.listen(PORT, function() {
    console.log('Express listening on port ' + PORT);
});
