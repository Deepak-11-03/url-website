const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const express= require('express');
const dotenv=require('dotenv')
const route= require('./routes/routes');
const app = express();

dotenv.config({ path:'./config.env'})

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));

app.use(express.static('public'));


const DB =process.env.DATABASE

mongoose.connect(DB,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,   } )
.then(()=>console.log("mongodb is connected"))
.catch(err=>console.log(err))

app.set('view engine', 'hbs');
app.get('/',  (req, res)=>{
    return res.render('index');
})
app.use('/',route);

app.listen(process.env.PORT,(err)=> {
    console.log(`connected to ${process.env.PORT}`)
})
