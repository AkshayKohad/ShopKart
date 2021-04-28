const express = require("express")
const router = express.Router()
const passport = require("passport")
const catchAsync = require("../utils/catchAsync")
const User = require("../models/user")
const {isLoggedIn} = require("../middleware")
const Product = require("../models/product")


// user routes
router.get("/user/signup", (req,res,next)=>{
    //res.render("user/signup", {csrfToken: req.csrfToken()})
    res.render("user/signup")
})

router.post("/user/signup", async (req,res,next)=>{
  //  res.redirect("/")
  try{
      const {email, username, password } = req.body
      const user = new User({ email, username })
      const registeredUser = await User.register(user, password)

      req.login(registeredUser, err =>{
          if (err) return next(err)
          req.flash("success", "Welcome to Yelp Camp!")
          res.redirect("/")
      })
  } catch (e) {
      req.flash("error", e.message)
      res.redirect("/user/signup")
  }
})



router.get("/user/signin", (req,res,next)=>{
    res.render("user/signin")
})

router.post("/user/signin",passport.authenticate("local", {failureFlash: true, failureRedirect: "/user/signin"}), (req,res,next)=>{
    req.flash("success", "Welcome back!!!!")
    const redirectUrl = req.session.returnTo || "/"
    delete req.session.returnTo
    res.redirect(redirectUrl)
})

router.get("/logout",(req,res,next) =>{
    req.logout()
    req.flash("success", "Goodbye!")
    res.redirect("/")
})


router.get("/user", isLoggedIn,(req,res,next)=>{
    res.render("user/profile")
})


router.get("/shoppingcart/:id",isLoggedIn,catchAsync(async (req,res,next)=>{
    const {id} = req.params
    const product = await Product.findById(req.params.id)
    console.log(product)
   // console.log(currentUser)
    if(!product)
  {
      req.flash("error", "Cannot find that product!")
      return res.redirect("/")
    } 
   const user = await User.findById(req.user._id)
   var result = false
   for(let shoppingcart of user.shoppingcart)
   {
       if(shoppingcart._id==id)
       result=true
   }

   if(!result)
   {
   user.shoppingcart.push(product)
   await user.save()
   req.flash("success", "Added to shopping cart !")
res.redirect("/")
   }

   else{
    req.flash("error", "Already added in shopping cart!")
    res.redirect("/")
   }
}))

router.delete("/shoppingcart/:id",isLoggedIn,catchAsync(async(req,res,next)=>{
    const {id} = req.params
    await User.findByIdAndUpdate(req.user._id, { $pull: {shoppingcart: id}})
    req.flash("success", "Successfully deleted review")
    res.redirect("/shoppingcart")

}))
router.get("/shoppingcart",isLoggedIn,catchAsync(async(req,res,next)=>{
    const user = await User.findById(req.user._id).findOne({}).populate("shoppingcart")
    //const user = await User.findById(req.user._id)
    //console.log(user)
    res.render("shop/cart",{user})

}))
module.exports = router