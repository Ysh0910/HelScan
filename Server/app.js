const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
var cors = require('cors');
var methodOverride = require("method-override");
const mongoose = require("mongoose");
const User = require("./models/user");

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(cors());
app.use(express.json());

const MONGO_URL = "mongodb://127.0.0.1:27017/HelScan";

main()
    .then(()=>{
        console.log("Connected to MongoDB");
    })
    .catch((err)=>{
        console.log("Error connecting to MongoDB:",err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.get("/", (req,res)=>{
    res.send("Hello World");
    //homepage
})

app.get("/rider", (req,res)=>{
    res.send("riderdetailsoutput");
    //fetches the data from db, and sends it to the frontend
})

app.post("/riderform", async (req,res)=>{
    res.send("takingriderinput");
    try{
        let details = req.body;
        console.log(details);
        const newRider = new User(details);
        await newRider.save();
    }catch(error){
        console.error("DataBase Error:", error);
    }
    //will need to take data from a form, and send it in json to this, and then get's stored in db
})

app.listen(port, ()=>{
    console.log("Server running");
})