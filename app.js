const express = require("express")
const path = require("path")
const ejsMate = require("ejs-mate")
const mongoose = require("mongoose")
const session = require("express-session")
const passport = require("passport")
const flash = require("connect-flash")
const methodOverride = require("method-override")
const ExpressError = require("./utils/ExpressError")
const LocalStrategy = require("passport-local")
const User = require("./models/user")

const MongoStore = require("connect-mongo")
  

const app = express()

mongoose.connect('mongodb://localhost:27017/shopping', {
    useNewUrlParser: true,   
    useUnifiedTopology: true, 
    useCreateIndex:true,
    useFindAndModify:false
});
const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error"));
db.once("open", ()=>{
    console.log("Database Connected");
});


//const ejs = require("ejs")



app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views",path.join(__dirname, "views"))


// const sessionStore = new MongoStore({

//     collection: "sessions"
// })
app.use(session({
    secret: "mysupersecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/shopping',
        collection: "sessions"
      }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24  
    }
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session()) 
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.use(methodOverride("_method"))
app.use(express.urlencoded({ extended: true}))
app.use(express.static(path.join(__dirname,"public")))

app.use((req,res,next)=>{
    // console.log(req.session)
     res.locals.currentUser = req.user
     res.locals.success = req.flash("success")
     res.locals.error = req.flash("error")
     next()
 })

const home = require("./routes/index")
const reviewRoutes = require("./routes/review")
const userRoutes = require("./routes/user")

app.use("/",home)
app.use("/products/:id/reviews", reviewRoutes)
app.use("/", userRoutes)


app.use("*",(req,res,next)=>{
    next(new ExpressError("page Not Found",404))
})
app.use((err,req,res,next)=>{
    const { statusCode = 500, message = "something went wrong" }=err
    res.status(statusCode).render("error",{err})
 //   res.send("OH boy, we got An error!!!")
})

app.listen(3000,(req,res)=>{
    console.log("listening to port 3000")
})