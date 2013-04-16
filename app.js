var express = require('express');
var app = express();
var util = require('util');

var globalId = 0;
var tab = [
  {
    id: globalId++,
    username: "hobinjk",
    tab: 0
  },
];

app.configure(function() {
  app.set('port', process.env.port || 3000);
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.static(__dirname+'/public'));
});


app.get('/tab', function(req, res) {
  res.send(tab);
  console.log("sending: "+util.inspect(tab));
});

function getTabByUsername(name) {
  for(var i = 0; i < tab.length; i++)
    if(tab[i].username == name) return tab[i];
}

function getTabById(id) {
  for(var i = 0; i < tab.length; i++)
    if(tab[i].id == id) return tab[i];
}

function setTabById(id, newTab) {
  for(var i = 0; i < tab.length; i++) {
    if(tab[i].id != id) continue;
    tab[i] = newTab;
    return;
  }
}
    

app.get('/tab/:username', function(req, res) {
  res.send(getTabByUsername(req.params.username));
});

app.post('/tab', function(req, res) {
  var t = req.body;
  t.id = globalId++;
  console.log("posted: "+util.inspect(t));
  tab.push(t);
  res.send(t);
});

app.delete('/tab/:username', function(req, res) {
  tab = _.reject(tab, function(t) {
    return t.username == req.params.username;
  });
  res.send(req.body);
});
app.put('/tab/:id', function(req, res) {
  console.log("put: "+util.inspect(req.body));
  var t = getTabById(req.params.id);
  setTabById(t.id, req.body);
  res.send(req.body);
});

app.listen(3000);
