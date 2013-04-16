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
  tab: 0
});

Tab = Backbone.Collection.extend({
  url: '/tab'
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
    this.tab.remove(model);
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
    var amount = parseFloat(amountEl.val());
    if(amount == NaN) {
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
    modelObj.tab = modelObj.tab.toFixed(2);
    var el = this.template(modelObj);
    $("#tab").append(el);
    //TODO inefficient
    $("li.user").hover(userEnter, userLeave);
  },

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
  $(".edit").remove();
  console.log("userEnter");
  var usern = $(event.target).children(".username").text();
  var el = editTemplate({username: usern});
  $(event.target).append(el);
}

function userLeave(event) {
  $(".edit").remove();
}

})(jQuery);

