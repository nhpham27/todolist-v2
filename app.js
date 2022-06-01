// https://thawing-thicket-71096.herokuapp.com/

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Nguyenhoa:Mongodb7604@cluster0.kmoel.mongodb.net/todolistDB");
// create schema
const itemsSchema = {
  name: String
};

// create model
const Item = mongoose.model("Item", itemsSchema);

// create defaut items
const item1 = new Item({
  name: "Welcome to your todolist"
});

const item2 = new Item({
  name: "Hit the + to add item"
});

const item3 = new Item({
  name: "<-- Check this box to delete item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("successfully added items to DB.");
          }
        });
      }

      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      if (!err) {
        if (foundList) {
          foundList.items.push(item);
          foundList.save();
          res.redirect("/" + listName);
        }
      }
    })
  }


  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function (req, res) {
  const itemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(req.body.checkbox, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("successfully deleted item from DB.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({ name: listName },
      { $pull: { items: { _id: itemID } } },
      function (err, foundList) {
        if(!err){
          res.redirect("/" + listName);
        }
      });
  }


});

app.get("/:route", function (req, res) {
  const listName = _.capitalize(req.params.route);
  List.findOne({ name: listName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: listName,
          items: defaultItems
        });
        console.log(listName);
        list.save();
        res.redirect("/" + listName);
        // setTimeout(function () {
        //   //your code to be executed after 1 second
          
        // }, 50);
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  })
});


// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
