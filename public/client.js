(function($) {
/*
var AppRouter = Backbone.Router.extend({
  routes: {
    "": "home",
    "tab": "something"
  }
});
*/

TabItem = Backbone.Model.extend({
  username: "",
  tab: 0,
  idAttribute: "username",
});

Tab = Backbone.Collection.extend({
  url: '/tab',
  model: TabItem,
  comparator: function(s) {
    return s.get("username");
  }
});

AppView = Backbone.View.extend({
  el: $("body"),
  template: _.template(
     "<li class=\"user\">"
    +  "<span class=\"username\"><%= username %></span>"
    +  "<span class=\"tab\"><%= tab %></span>"
    +"</li>"
  ),
  tab: new Tab(),
  initialize: function() {
    _(this).bindAll(
        'addUser',
        'removeUser',
        'updateUser',
        'render',
        'append',
        'change'
    );
    console.log("initializing this biz");
    this.tab.bind('refresh', this.render);
    this.tab.bind('remove', this.render);
    this.tab.bind('add', this.append);
    this.tab.bind('change', this.change);
    this.tab.fetch().complete(this.render);

  },
  events: {
    "click #add-user": "addUser",
    "click .remove-user": "removeUser",
    "click .update-user": "updateUser"
  },

  addUser: function(event) {
    console.log("adding user");
    var username = $("#username-input").val();
    var tabItemModel = new TabItem({username: username, tab: 0});
    this.tab.add( tabItemModel );
    tabItemModel.save();
  },

  addUserCallback: function(model) {
    console.log("adding user callback");
  },

  removeUser: function(event) {
    var tabItemId = $(event.target).data("id");
    console.log("removing user with id: "+tabItemId);
    var models = this.tab.where({"username": tabItemId});
    if(models.length == 0) {
      console.log("there were none");
      return;
    }
    var model = models[0];
    model.destroy();
    console.log(model);
    console.log("url: "+model.url());
    //this.tab.remove(model);
  },

  removeUserCallback: function(model) {
    //this.render();
    //$("#"+model.get('id')).remove();
  },

  updateUser: function(event) {
    var username = $(event.target).data("id");
    console.log("username: "+username);
    var type = $(event.target).parent()
          .find("select.update-type");
    var amountEl = $(event.target).parent()
          .find("input.update-amount");
    var amount = Math.round(parseFloat(amountEl.val())*100);
    if(isNaN(amount)) {
      amountEl.val("ERROR");
      return;
    }
    var models = this.tab.where({"username": username});
    if(models.length == 0) return;
    var model = models[0];
    console.log("tab: "+model.attributes.tab);
    var endBalance = model.attributes.tab;
    if(!endBalance) endBalance = 0;
    type = type.val();
    console.log("type: "+type+", amount: "+amount+", thing: "+endBalance);
    if(type === "credit") {
      console.log("creditting");
      endBalance += amount;
    } else if(type === "charge") {
      console.log("charging");
      endBalance -= amount;
    } else {
      console.log("setting");
      endBalance = amount;
    }
    console.log("trying to save");
    model.set({tab: endBalance});
    model.save();
    //console.log(id);
    //event.preventDefault();
  },
  render: function() {
    console.log("rendering");
    $("#tab").empty();
    this.tab.each(function(model) {
      this.append(model);
    }, this);
  },
  append: function(model) {
    var modelObj = model.toJSON();
    modelObj.tab = (modelObj.tab / 100.0).toFixed(2);
    var el = this.template(modelObj);
    $("#tab").append(el);
    $("#tab :last-child").hover(userEnter, userLeave);
  },
  //TODO optimize
  change: function() {
    this.render();
  }

});

window.appview = new AppView;
window.appview.tab.fetch();

var editTemplate = _.template("<div class=\"edit\"><select class=\"update-type\">"
    +    "<option value=\"credit\">credit</option>"
    +    "<option value=\"charge\">charge</option>"
    +    "<option value=\"set\">set</option"
    +  "</select>"
    +  "<input type=\"text\" placeholder=\"0.00\" class=\"update-amount\"/>"
    +  "<input type=\"button\" data-id=\"<%= username %>\" class=\"update-user\" value=\"update\"/>"
    +  "<input type=\"button\" data-id=\"<%= username %>\" class=\"remove-user\" value=\"remove\"/></div>");

function userEnter(event) {
  var cont = $(event.target);
  var i = 0;
  while(!cont.hasClass("user")) {
    cont = cont.parent();
    if(i++ > 10) return;
  }
  if(cont.children("div.edit").length > 0) return;
  $(".edit").slideUp(function() $(this).remove());
  var usern = cont.children(".username").text();
  var el = editTemplate({username: usern});
  cont.append(el);
  $(".edit").slideDown();
}

function userLeave(event) {
  $(".edit").slideUp(function() $(this).remove());
}

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

})(jQuery);

