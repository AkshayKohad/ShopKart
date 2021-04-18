const mongoose = require("mongoose")
const Product = require("../models/product")
const products = require("./products")

mongoose.connect('mongodb://localhost:27017/shopping', {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex:true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error"));
db.once("open", ()=>{
    console.log("Database Connected");
});

const seedDB = async ()=>{
    await Product.deleteMany({})
    for(let i=0;i<4;i++)
    {
        const thing = new Product({
            author:"607b313e2489ea33fc302ee7",
            imagePath: products[i].imagePath,
            title: products[i].title,
            description: products[i].description,
            price: products[i].price
        })
      await thing.save()       
    }
}


seedDB().then( ()=>{
    mongoose.connection.close()
});