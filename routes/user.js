const express = require("express")
const router = express.Router()
const passport = require("passport")
const catchAsync = require("../utils/catchAsync")
const User = require("../models/user")

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

router.post("/user/signin",passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), (req,res,next)=>{
    req.flash("success", "Welcome back!!!!")
    const redirectUrl = req.session.returnTo || "/"
    delete req.session.returnTo
    res.redirect(redirectUrl)
})

module.exports = router