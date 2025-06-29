const express=require('express');
const app=express();
const db=require('./db');
require('dotenv').config();

const port = process.env.PORT|| 4000 

const bodyparser=require('body-parser')
app.use(bodyparser.json())

app.get('/',(req,res)=>{
    res.send("Hello users");
})

app.listen(port,()=>{
    console.log(`listening on Port ${port}`);
});
