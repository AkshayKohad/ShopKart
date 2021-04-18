const express = require("express")
const Review = require("../models/review")
const router = express.Router({mergeParams:true})
const Product = require("../models/product")
const {isLoggedIn, validateReview, isReviewAuthor} = require("../middleware")
const ExpressError = require("../utils/ExpressError")
const catchAsync = require("../utils/catchAsync")

router.post("/",isLoggedIn, validateReview, catchAsync(async (req,res,next)=>{
const product = await Product.findById(req.params.id)
const review = new Review(req.body.review)
review.author = req.user._id
product.reviews.push(review)
await review.save()
await product.save()
//console.log(review)
//console.log(product)
req.flash("success", "Created new review!")
res.redirect(`/products/${product._id}`)
}))

router.delete("/:reviewId",isLoggedIn, isReviewAuthor, catchAsync(async (req,res,next)=>{
    const {id, reviewId} = req.params
    await Product.findByIdAndUpdate(id, { $pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash("success", "Successfully deleted review")
    res.redirect(`/products/${id}`)
}))

module.exports=router
