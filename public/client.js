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
     "<li class=\"user\" id=\"<%= username %>\">"
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
        'change',
        'error'
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
    tabItemModel.save({}, {error: this.error});
  },

  addUserCallback: function(model) {
    console.log("adding user callback");
  },
  error: function(model, xhr, options) {
    alert("Error! "+xhr.status+" "+xhr.responseText+". Are you logged in?");
    console.log(model);
    this.tab.fetch({reset:true, success: function(){window.appview.render();}});//set(model, model);
  },
  removeUser: function(event) {
    var username = $(event.target).data("id");
    var wantTo = window.confirm("Are you sure you want to remove "
        +username+"?");
    if(!wantTo) return;
    console.log("removing user with id: "+username);
    var models = this.tab.where({"username": username});
    if(models.length == 0) {
      console.log("there were none");
      return;
    }
    var model = models[0];
    model.destroy({error: this.error});
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
          .find(".selected").attr("id");
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
    model.save({tab: endBalance}, {error: this.error});
    //console.log(id);
    //event.preventDefault();
  },

  rendered: false,

  render: function() {
    console.log("rendering");
    var start = Date.now()
    //$("#tab").empty();
    this.tab.each(function(model) {
      this.append(model);
    }, this);
    $(".user").hover(userEnter, userLeave);
    console.log("rendering takes "+(Date.now() - start)+" seconds");
    rendered = true;
  },
  append: function(model) {
    var modelObj = model.toJSON();
    modelObj.tab = (modelObj.tab / 100.0).toFixed(2);
    if(!this.rendered) {
      $("#tab").append(this.template(modelObj));
      return;
    }
    var el; 
    if(el = document.getElementById(modelObj.username)) {
      console.log("being lazy");
      $(el).children(".tab").text(modelObj.tab);
      return;
    }
    console.log("tryharding");
    var tab = $("#tab");
    var insertBefore;
    var good = false;
    for(var i = 0; i < tab.children().length; i++) {
      insertBefore = tab.children()[i];
      if(insertBefore.id > modelObj.username) {
        good = true;
        break;
      }
    }
    if(good)
      $(insertBefore).before(this.template(modelObj));
    else
      tab.append(this.template(modelObj));
    $(document.getElementById(modelObj.username)).hover(userEnter, userLeave);
  },
  change: function(model) {
    var el = $(document.getElementById(model.attributes.username));
    el.children(".tab").text((model.attributes.tab/100.0).toFixed(2));
  }

});

window.appview = new AppView;
window.appview.tab.fetch();

var editTemplate = _.template("<div class=\"edit\"><span class=\"update-types\">"
    +    "<div class=\"option selected\" id=\"charge\">charge</div>"
    +    "<div class=\"option\" id=\"credit\">credit</div>"
    +    "<div class=\"option\" id=\"set\">set</div>"
    +  "</span>"
    +  "<input type=\"text\" placeholder=\"0.00\" class=\"update-amount\"/>"
    +  "<a href=\"#\" data-id=\"<%= username %>\" class=\"update-user\">update</a>"
    +  "<a href=\"#\" data-id=\"<%= username %>\" class=\"remove-user\">remove</a>"
    +  "</div>");

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
  $(".option").click(function(evt) {
    $(".selected").removeClass("selected");
    $(evt.target).addClass("selected");
  });

}

function userLeave(event) {
  $(".edit").slideUp(function() $(this).remove());
}

var keyBuffer = '';
var lastKey = 0;
var keyPersist = 600;

$(document).keydown(function(evt) {
  if(document.activeElement.tagName.toLowerCase() !== "body") return;
  if(Date.now() - lastKey > keyPersist) {
    //the keys have expired
    keyBuffer = '';
  }
  if(evt.ctrlKey) return;
  if(evt.altKey) return;
  if(evt.metaKey) return;
  if(evt.shiftKey) return;

  lastKey = Date.now();
  keyBuffer += String.fromCharCode(evt.keyCode).toLowerCase(); //debatable
  var mod = window.appview.tab.find(function(m) {
    return m.get("username").toLowerCase().startsWith(keyBuffer);
  });
  if(!mod) return;
  $.scrollTo($("#"+mod.get("username")));
});

})(jQuery);

