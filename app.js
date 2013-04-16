var express = require('express');
var app = express();
var util = require('util');
var _ = require('underscore');
var sodadb = require("./sodadb.js");

var globalId = 0;
app.configure(function() {
  app.set('port', process.env.port || 3000);
  app //.use(express.logger('dev'))
     .use(express.bodyParser())
     .use(express.static(__dirname+'/public'))
     .use(express.cookieParser())
     .use(express.session({
       secret: "kndsfaksjdfhkabsdkfbkajsd"
     }));
});

require("express-persona")(app, {
  audience: "http://localhost:3000",
});
function guard(fn) {
  return function(req, res) {
    console.log("email: "+req.session.email);
    if(!req.session.email || req.session.email !== "hobinjk@mit.edu") {
      res.send(403);
      return;
    }
    return fn(req,res);
  };
}
app.get('/tab', function(req, res) {
  sodadb.getFullTab(function(tab) {
    //console.log("sending: "+util.inspect(tab));
    res.send(tab);
  });
});

/*function getTabByUsername(name) {
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
}*/
    

app.get('/tab/:username', function(req, res) {
  sodadb.getTabByUsername(req.params.username, function(tab) {
    res.send(tab);
  });
});

app.put('/tab', guard(function(req, res) {
  var t = req.body;
  console.log("put: "+util.inspect(t));
  res.send(t);
  sodadb.putTab(t);
}));

app.post('/tab', guard(function(req, res) {
  var t = req.body;
  console.log("post: "+util.inspect(t));
  res.send(t);
  sodadb.putTab(t);
}));

app.delete('/tab/:username', guard(function(req, res) {
  console.log("deleting: "+req.params.username);
  res.send(req.body);
  sodadb.deleteTab({username: req.params.username});
  /*tab = _.reject(tab, function(t) {
    return t.username == req.params.username;
  });*/
}));

app.put('/tab/:username', guard(function(req, res) {
  console.log("put: "+util.inspect(req.body));
  sodadb.getTabByUsername(req.params.username, function(tab) {
    if(tab) {
      console.log("normal");
      sodadb.updateTab(req.body);
    } else {
      console.log("fancy fallback");
      sodadb.putTab(req.body);
    }
    res.send(req.body);
  });
}));


app.post('/tab', guard(function(req, res) {
  console.log("post/:"+util.inspect(req.body));
}));

var memwatch = require('memwatch');
var hd = new memwatch.HeapDiff();

memwatch.on('leak', function(stats) {
  console.log(JSON.stringify(hd.end(), null, 2));
  hd = new memwatch.HeapDiff();
});

app.listen(3000);
