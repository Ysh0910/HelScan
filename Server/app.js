const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
var cors = require('cors');
var methodOverride = require("method-override");
const mongoose = require("mongoose");
const User = require("./models/user");
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const QRCode = require('qrcode');

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

app.get('/rider/:id', async(req,res)=> {
    try{
        const riderId = req.params.id;
        const rider = await User.findById(riderId);
        if(!rider){
            return res.status(400).json({message: "Rider not found"});
        }
        res.status(200).json(rider);
    } catch(error) {
        console.error("Error fetching rider:", error);
        res.status(500).json({ message: "Server error", error: error.message});
    }
});

app.post("/riderform", async (req,res)=>{
    res.send("takingriderinput");
    try{
        let details = req.body;
        console.log(details);
        const newRider = new User(details);
        const savedUser = await newRider.save();

        res.status(201).json({
            message:"Saved",
            id: savedUser._id
        });
    }catch(error){
        console.error("DataBase Error:", error);
    }
    //will need to take data from a form, and send it in json to this, and then get's stored in db
})

app.get('/download-qr/:id', async (req, res)=>{
    try{
        const {id} = req.params;
        const publicUrl = `http://localhost:5173/u/${id}`; //later get changed to the vercer url

        const qrBuffer = await QRCode.toBuffer(publicUrl, {
            width: 400,
            margin:1,
            errorCorrectionLevel: 'H'
        });

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([216,144]);
        const qrImage = await pdfDoc.embedPng(qrBuffer);

        page.drawRectangle({
            x:0,
            y:120,
            width:216,
            height:24,
            color: rgb(0.8,0,0),
        });

        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        page.drawText('EMERGENCY MEDICAL ID', {
            x:45,
            y:127,
            size:10,
            font:font,
            color: rgb(1,1,1),
        });

        page.drawImage(qrImage, {
            x:58,
            y:20,
            width:100,
            height:100,
        });

        page.drawText(`ID; ${id}`, {
            x:10,
            y:5,
            size:8,
            color: rgb(0.5, 0.5,0.5),
        });

        const pdfBytes = await pdfDoc.save();

        res.setHeader('Content-Type','application/pdf');
        res.setHeader('Content-Disposition',`attachment; filename=sticker-${id}.pdf`);
        res.send(Buffer.from(pdfBytes));
    } catch(error){
        console.error(error);
        res.status(500).send("Error generating PDF");
    }
});

app.listen(port, ()=>{
    console.log("Server running");
})