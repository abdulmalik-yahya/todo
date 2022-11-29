const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");

const app = express();
const _ = require("lodash");

app.use(bodyParser.urlencoded({ extended: true })); // to parse incoming requests
app.use(express.static('public')); // for the css file
app.set('view engine', 'ejs'); // use ejs as view engine / templating language

// connect to the local db
// mongoose.connect("mongodb://localhost:27017/todoDB");
// connect to the cloud db
mongoose.connect("mongodb+srv://admin-malik:Test123@cluster0.ywsjwyz.mongodb.net/todoDB");
const itemsSchema = {
    name: {
        type: String,
        required: [true, "Please enter Todo name"]
    }
};

// create a collection
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({ name: "Welcome to your todo list" });
const item2 = new Item({ name: "Hit the + button to add new item" });
const item3 = new Item({ name: "<-- Hit this to delete an item." });

const defaultItems = [item1, item2, item3];

const listSchema = { // this for any additional todo lists the user might create after home route "/ListName"
    name: String, // name of the list like "/work"
    items: [itemsSchema] // array of items for each list
};
// create the model for the above list
const List = mongoose.model("List", listSchema);

// find all items, first arg to find is ignored

app.get("/about", (req, res) => { // to render the about page
    res.render("about");
});

app.get("/", (req, res) => {

    Item.find({}, function (err, foundItems) {
        // if currently list is empty then only insert, we don't wanna insert everytime the home page loads
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err)
                    console.log(err);
                else
                    console.log("Successfully created the todo list");
            });
            res.redirect("/"); // render the newly inserted list
        }
        else { // else render the already existing list
            // console.log(foundItems);
            res.render("list", { listTitle: "Today", newItemsList: foundItems }); // list.ejs/homepage should be inside views folder
        }

    });
});

app.post("/", (req, res) => {


    // to receive the request from client root page and resend or redirects the response
    const item = req.body.newTodo;
    const listName = req.body.list;

    // req came from toDo list go to a toDo list page / root
    const newItem = new Item({ name: item });
    if (listName === "Today") { // means Home page containing the day
        newItem.save();
        res.redirect("/");
    }
    else { // another list different from home page
        List.findOne({ name: listName }, (err, foundList) => {
            // console.log(foundList);
            foundList.items.push(newItem);
            foundList.save();

        });
        res.redirect("/" + listName); // redirect to that list 
    }
});
// console.log(newItem);

// res.redirect("/"); // redirect to root route, go back to get method



app.post("/delete", (req, res) => {
    const checkedItemID = req.body.checkbox.trim(); // this returns the ID of checked item. trims any spaces
    const listName = req.body.listName.trim();
    console.log(listName);
    // console.log("Checked Item: " + checkedItemID);
    if (listName === "Today") {

        Item.findByIdAndDelete(checkedItemID, (err) => {
            if (err)
                console.log(err);
            else
                console.log("Successfully Removed: " + checkedItemID);
        })
        res.redirect("/"); // load homepage after deletion
    }
    else { // use the $pull operator on items of the list
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemID } } }, (err, foundList) => {

            if (err)
                console.log(err);
            else {
                console.log("Successfully removed from : " + foundList.name);
                res.redirect("/" + listName);
            }
        })
    }
})


// handling new custom lists
app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    // console.log("Custom List name " + customListName);

    List.findOne({ name: customListName }, (err, foundList) => {
        if (!err) {
            if (!foundList || foundList.name !== customListName) {
                // if the list doesn't exist, create it
                // if (foundList.items.length === 0) {

                const newList = new List({
                    name: customListName,
                    items: defaultItems // assign the new custom list with default items
                });
                newList.save();
                // }
                res.redirect("/" + customListName); // stay on same page
            }
            else { // show the existing list
                res.render("list", { listTitle: foundList.name, newItemsList: foundList.items });

            }

        }

    });



});


app.listen(3000, () => {
    console.log("Server started on port 3000");
});
