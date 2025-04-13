if(process.env.NODE_ENV != 'production'){
   require('dotenv').config()
}
 
const express=require('express');
const app= express();
const mongoose=require('mongoose')
const path=require('path')
const methodOverride=require('method-override');
const ejsMate=require("ejs-mate");
const ExpressError=require('./utils/ExpressError.js')
const session = require('express-session')
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport')
const localStrategy = require('passport-local');
const User = require("./models/user.js")


const listingRouter = require('./routes/listing.js')
const reviewRouter = require('./routes/review.js')
const userRouter = require('./routes/user.js')

app.set('view engine','ejs')
app.set('views',path.join(__dirname,'/views'))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.engine('ejs',ejsMate)
app.use(express.static(path.join(__dirname,"/public")))
app.use(express.json());


// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust" //local humara url

const dbUrl = process.env.ATLASDB_URL //mongo atlas db ka url

main()
.then(()=>{
    console.log('connection successful');
    
})
.catch((err) => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);
    
}

const store= MongoStore.create({
    mongoUrl:dbUrl,
    crypt:{
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600
})

store.on('error',()=>{
    console.log("ERROR IN MONGO SESSION STORE",ERR);
    
})

const sessionOptions={
    store:store,  //above store jo create kia
    secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires:Date.now() + 7*24*60*60*1000 ,//yha hum aj ki date se aj se 7 din baad tk ki expiry rkh rhe or ye mili second mein count hoti so 7days * 24hr * 60min * 60sec * 1000milisec
    maxAge: 7*24*60*60*1000,
    httpOnly:true
  }
}

app.use(session(sessionOptions))
app.use(flash()); //flash ko hume routes se pehle access krna hoga routes k baad krenge to error

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    next();
})

// app.get('/',(req,res)=>{
//     res.send('Hello i am root')
// })


// app.get('/demouser',async(req,res)=>{
//     let fakeUser = new User ({
//         email:'abc@gmail.com',
//         username:'deltas-student'
//     })
// let registeredUser=await User.register(fakeUser,'helloworld')    
// res.send(registeredUser)
// })

app.use('/listings',listingRouter);
app.use('/listings/:id/reviews',reviewRouter)
app.use('/',userRouter)

 
app.all('*',(req,res,next)=>{
    next(new ExpressError(404,'page not found'))
})

app.use((err,req,res,next)=>{
    let {status=500,message='something went wrong'} = err;
    res.status(status).render('error.ejs',{message})
    // res.status(status).send(message)
})

app.listen(8080,(req,res)=>{
    console.log('app listen on port: 8080');
    
})