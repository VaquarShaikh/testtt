const { findById } = require('../models/productModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ApiFeatures = require('../utils/apifeatures');


// Create a product --Admin Route

exports.createProduct = catchAsyncErrors(async(req,res,next)=>{
    
    req.body.user = req.user.id
    
    const product = await Product.create(req.body);
    
    res.status(201).json({
        success:true,
        product
    });
});


// Get all products
exports.getAllProducts = catchAsyncErrors(async (req ,res , next)=>{

    // return next(new ErrorHandler("This is my temp error" , 500))

    const resultPerPage = 5;
    const productCount = await Product.countDocuments(); 
    const apiFeature = new ApiFeatures(Product.find() , req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

    const products = await apiFeature.query;
    // const products = await Product.find();
    res.status(200).json({
        // message:"Route is working fine"
        success:true,
        products,
        productCount,
    });
});


// Update a product

exports.updateProduct = catchAsyncErrors(async(req,res,next)=>{
    let product = await Product.findById(req.params.id);
    
    if(!product){
        return res.status(500).json({
            success:false,
            message:"Product not found"
        })
    }
    
    product = await Product.findByIdAndUpdate(req.params.id , req.body , {
        new:true,
        useFindAndModify:false,
        runValidators:true
    });
    
    res.status(200).json({
        success:true,
        product
    })
})


// Delete a product

exports.deleteProduct = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
    
    if(!product){
        return next(new ErrorHandler("Product not found" , 404));
    }
    
    await product.remove();
    
    res.status(200).json({
        success:true,
        message:"The product was deleted successfully"
    })
    
})

// Get product details

exports.getProductDetails = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
    
    if(!product){
        return next(new ErrorHandler("Product not found" , 404));
    }
    res.status(200).json({
        success:true,
        product,
        // productCount,
    })

})


// Create new review or update review 

exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
  
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };
  
    const product = await Product.findById(productId);
  
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );
  
    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString())
          (rev.rating = rating), (rev.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }
  
    let avg = 0;
  
    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    product.ratings = avg / product.reviews.length;
  
    await product.save({ validateBeforeSave: false });
  
    res.status(200).json({
      success: true,
    });
  });

  exports.getProductReviews = catchAsyncErrors(async (req,res,next)=>{
      const product = await Product.findById(req.query.id);

      if(!product){
          return next(new ErrorHandler('Product not found' , 404));
      }

      res.status(200).json({
          success:true,
          reviews:product.reviews,

      });
  });


//   Delete a review

exports.deleteReview = catchAsyncErrors(async (req, res , next)=>{
    const product = await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler('Product not found' , 404));
    }


    const reviews = product.reviews.filter( 
        rev=> rev._id.toString() !== req.query.id.toString()
    );


    let avg = 0;
  
    reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    const ratings = avg / reviews.length;

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId , {
        reviews,
        ratings,
        numOfReviews,
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });

    res.status(200).json({
        success:true,

    });
})