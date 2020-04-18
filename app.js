const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const date = require(__dirname + "/date.js");
const _ = require("lodash");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

// const items = ["buy","eat"];
// const workItems =[];
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://admin-lakshay:Aayushbatra1@@cluster0-qgflw.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

//items schema
const itemsSchema = {
    task: String
};
const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

const item1 = new Item({
    task: "Welcome to your To Do list"
});
const item2 = new Item({
    task: "Hit + to add new items"
});
const item3 = new Item({
    task: "<-- hit this box to delete an item"
});
const defaultItems = [item1, item2, item3];

app.get("/", (req, res) => {
    const day = date.getDate();
    Item.find((err, foundItems) => {
        if (foundItems.length == 0) {
            Item.insertMany(defaultItems, (err) => {
                if (!err) {
                    res.redirect("/");
                }
                else {
                    console.log(err);
                }
            });
        } else {
            res.render("list", { listTitle: day, newItems: foundItems });
        }
    });
});

app.post("/", (req, res) => {

    const newTask = req.body.newTask;
    const listTitle = req.body.switch;
    const newitem = new Item({
        task: newTask
    });
    if (listTitle === date.getDate()) {
        newitem.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listTitle }, (err, foundList) => {
            if (!err) {
                foundList.items.push(newitem);
                foundList.save();
                res.redirect("/" + listTitle);
            }
        });
    }

});

app.post("/delete", (req, res) => {
    const id = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === date.getDate()) {
        Item.findByIdAndRemove(id, (err) => {
            if (!err) {
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: id } } }, (err) => {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }

});

app.get("/:listName", (req, res) => {

    const customListName = _.capitalize(req.params.listName);
    List.findOne({ name: customListName }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                const newList = new List({
                    name: customListName,
                    items: defaultItems
                });
                newList.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", { listTitle: customListName, newItems: foundList.items });
            }

        }
    })

});


app.listen(process.env.PORT || 3000, (req, res) => {
    console.log("server started");
});
