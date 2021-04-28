const express = require("express")
const Product = require("../models/product")
const router = express.Router()
const csrf = require("csurf")
const Review = require("../models/review")
const catchAsync = require("../utils/catchAsync")
//const {productSchema} = require("../schemas")
const {isLoggedIn, isAuthor, validateProduct} = require("../middleware")
const ExpressError = require("../utils/ExpressError")


//const csrfProtection = csrf()
//router.use(csrfProtection)


//shop route

// use to see all shopping products
router.get("/", catchAsync(async(req, res, next)=> {
    const products = await Product.find({})
    res.render("shop/index", {title: "Express", products})
}))

//use to make new product

router.post("/", isLoggedIn, validateProduct, catchAsync( async(req,res,next)=>{
    const product = new Product(req.body.product)
    product.author = req.user._id
    await product.save()
   // console.log(req.body)
   req.flash("success", "Successfully made a new Product!")
    res.redirect("/")
}))


router.get("/new", isLoggedIn, (req, res, next)=>{
    res.render("shop/new")
})



// product routes

// use to see details of Product
router.get("/products/:id", catchAsync(async (req,res,next)=>{
   // const product =  await Product.findById(req.params.id).findOne({}).populate("reviews")
    const product =  await Product.findById(req.params.id).findOne({}).populate({
        path:"reviews",
        populate: {
          path: "author"
        }
      }).populate("author")
    if(!product)
    {
        req.flash("error", "Cannot find that product!")
        return res.redirect("/")
      } 
    res.render("shop/show",{product})
}))
// use to delete product
router.delete("/products/:id",isLoggedIn, isAuthor, validateProduct,catchAsync(async (req,res,next)=>{
    const product = await Product.findByIdAndDelete(req.params.id)
    for(let review of product.reviews)
    {
        await Review.findByIdAndDelete(review._id)
    }
    req.flash("success", "successfully deleted product!")
    res.redirect("/")
}))

// used for making update form available for user to update Product

router.get("/products/:id/edit",isLoggedIn,isAuthor,catchAsync(async (req,res,next)=>{
    const {id} = req.params
    const product = await Product.findById(id)
    if(!product)
  {
      req.flash("error", "Cannot find that product!")
      return res.redirect("/")
    } 
    res.render("shop/edit",{product})
}))
// used for updating products
router.put("/products/:id",isLoggedIn,isAuthor, validateProduct, catchAsync(async (req,res,next)=>{
    const {id} = req.params
    const product = await Product.findByIdAndUpdate(id, {...req.body.product})
    await product.save()
    req.flash("success", "Successfully updated product")
    res.redirect(`/products/${product._id}`)   
}))

module.exports = router