$(document).ready(function() {

$("#signin").click(function() {
  navigator.id.request();
});
$("#signout").click(function() {
  navigator.id.logout();
});

//ripped from https://github.com/jbuck/express-persona
navigator.id.watch({
  onlogin: function(assertion) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/persona/verify", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.addEventListener("loadend", function(e) {
      var data = JSON.parse(this.responseText);
      if (data && data.status === "okay") {
        console.log("You have been logged in as: " + data.email);
      }
    }, false);

    xhr.send(JSON.stringify({
      assertion: assertion
    }));

    $("#signin").hide();
    $("#signout").show();
  },
  onlogout: function() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/persona/logout", true);
    xhr.addEventListener("loadend", function(e) {
      console.log("You have been logged out");
    });
    xhr.send();
    $("#signin").show();
    $("#signout").hide();
  }
});

});

