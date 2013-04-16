var Database = require('sqlite3').Database;
var db = new Database("./sodadb.sqlite");

var cached = false;
var tab = [];

exports.getFullTab = function getFullTab(callback) {
  if(cached) {
    callback(tab);
    return;
  }
  tab = []; //eh
  db.all("SELECT username, tab FROM sodatab", function(err, rows) {
    if(err) throw err;
    tab = rows;
    cached = true;
    return callback(tab);
  });
};

exports.getTabByUsername = function getTabByUsername(name, callback)  {
  if(cached) {
    for(var i = 0; i < tab.length; i++) {
      if(tab[i].username === name) {
        callback(tab[i]);
        return;
      }
    }
    callback(null);
    return;
  }
  db.get("SELECT username, tab FROM sodatab WHERE username = ?", name, function(err, row) {
    if(err) throw err;
    callback(row);
  });
};

exports.putTab = function putTab(tab) {
  cached = false;
  db.run("INSERT INTO sodatab VALUES (?, ?)", tab.username, tab.tab);
};

exports.deleteTab = function deleteTab(tab) {
  cached = false;
  db.run("DELETE FROM sodatab WHERE username = ?", tab.username);
};

exports.updateTab = function updateTab(tab) {
  cached = false;
  db.run("UPDATE sodatab SET tab = ? WHERE username = ?", tab.tab, tab.username);
};




