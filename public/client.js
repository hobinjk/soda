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
     "<li>"
    +  "<span class=\"username\"><%= username %></span>"
    +  "<span class=\"tab\"><%= tab %></span>"
    +  "<select class=\"update-type\">"
    +    "<option value=\"credit\">credit</option>"
    +    "<option value=\"charge\">charge</option"
    +    "<option value=\"set\">set</option"
    +  "</select>"
    +  "<input type=\"text\" placeholder=\"0.0\" class=\"update-amount\"/>"
    +  "<input type=\"button\" data-id=\"<%= username %>\" class=\"update-user\" value=\"update\"/>"
    +  "<input type=\"button\" data-id=\"<%= username %>\" class=\"remove-user\" value=\"remove\"/>"
    +"</li>"
  ),
  tab: new Tab(),
  initialize: function() {
    _(this).bindAll(
        'addUser',
        'removeUser',
        'updateUser',
        'render',
        'append'
    );
    console.log("initializing this biz");
    this.tab.bind('refresh', this.render);
    this.tab.bind('add', this.append);
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
    console.log("removing user");
    var tabItemId = $(event.target).parent().attr("id");
    this.tab.remove(this.tabItems.get(id));
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

    var model = this.tab.get({username: username});
    var endBalance = model.tab;
    if(type == "credit") {
      endBalance += amount
    } else if(type == "charge") {
      endBalance -= amount;
    } else {
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
      console.log(model.toJSON());
      this.append(model);
    }, this);
  },
  append: function(model) {
    $("#tab").append(this.template(model.toJSON()));
  }
});

window.appview = new AppView;
window.appview.tab.fetch();
})(jQuery);

