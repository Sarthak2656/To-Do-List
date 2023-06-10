const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const app = express();
mongoose.connect("mongodb+srv://Sarthak:Tcv13254@cluster0.075skmj.mongodb.net/todolistDB");
app.set('view engine', 'ejs');
const _=require("lodash");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema={
  name:String
};

const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"Welcome to your To-do List"
});
const item2=new Item({
  name:"Hit + to enter a new item"
});
const item3=new Item({
  name:" < -- Hit it to clear the item"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({}).then(function(foundItems)
  {
    if(foundItems.length===0)
    {
      Item.insertMany(defaultItems).then(function()
      {
        console.log("Data inserted")
      }).catch(function(error)
      {
        console.log(error);
      });
      res.redirect("/");
    }
    else
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });

  if(listName==="Today")
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name:listName}).then(function(foundList)
    {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete",function(req,res)
{
  const checkedItem=req.body.checkbox;
  const listName=req.body.listName;
  
  if(listName==="Today"){
  Item.findByIdAndRemove(checkedItem).then(function(docs)
  {
    if(docs)
    console.group(docs);
  });
  res.redirect("/");
  }
  else
  {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}}).then(function(foundList)
    {
      res.redirect("/"+listName);
    }).catch(function(err)
    {
      console.log(err);
    });
  }
});

app.get("/:customList",function(req,res)
{
  const customListName=_.capitalize(req.params.customList);
  List.findOne({name:customListName}).then(function(foundList){
    if(!foundList)
    {
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    }
    else
    res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
