const express=require('express');
const cors=require('cors')
//s1-import the package
const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const rateLimit=require('express-rate-limit')
const dotenv=require('dotenv');
dotenv.config()
const app=express();
const port=process.env.PORT
 //middlewares
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// store: ... , // Redis, Memcached, etc. See below.
})

// Apply the rate limiting middleware to all requests.
app.use(limiter)
app.use(cors());
app.use(express.json())

//s2-establish a connection      ---->connection string
async function connection(){
  await mongoose.connect(process.env.MONGODBURL)
  
}

//s3--create a schema
let  productschema=new mongoose.Schema({
  name:{type:String,required:true},
  price:{type:Number,required:true},
  qty:{type:Number,required:true},
  image:{type:String,required:true}
})

//s4-- create a model
let productmodel=mongoose.model('products',productschema)


//======userschema=========/

let userschema=new mongoose.Schema({
 username:{type:String,required:true,unique:true},
 password:{type:String,required:true},
 email:{type:String,required:true}
})

let usermodel=mongoose.model('users',userschema);


//api-1----->status check
app.get('/',function(req,res){
    res.send('server is active')
})  

//api-2 -----> store products in a database

app.post('/products',async function(req,res){
try {
  const {name,price,image,qty}=req.body
 let products= await productmodel.create({name,price,image,qty})
 res.status(201).json({
  message:"product added Succesfully📱"
 })
} catch (error) {
  res.json({
    message:error.message
  })
}
})

//api-3   -----> fetch all products
app.get('/products',async function(req,res){
 try {
   let products= await productmodel.find();
   res.status(200).json({
    products
   })
 } catch (error) {
  res.json({
    message:error.message
  })
 }
})
//api4--->delete a resource
app.delete('/product',async function(req,res){
try {
  const {_id}=req.body;
  let product=await productmodel.findByIdAndDelete(_id);
  res.json({
    message:"product deleted Successfuly"
  })
} catch (error) {
  res.json({
    message:error.message
  })
}
})
//api5----> update the resource
app.put('/products',async function(req,res){
  try {
    const {_id,name}=req.body;
    let product=await productmodel.findByIdAndUpdate(_id,name)
    res.json({
      message:"product is updated Succesfully"
    })
  } catch (error) {
    res.json({
      message:error.message
    })
  }
})

//api-6  --->Store Registration details
app.post('/register',async function(req,res){
  try {
    const {username,password,email}=req.body;
    let user= await usermodel.findOne({username})
    if(user) return res.json({message:"user Already Exists"})
    let hashpassword=await bcrypt.hash(password,10);
   let finaluser= await usermodel.create({username,password:hashpassword,email});
   res.json({
    message:'Registration Succesfull'
   })
  } catch (error) {
    res.json({
      message:error.message
    })
  }
})
//api-7-----> login
app.post('/login',function(req,res){
try {
  const {username,password}=req.body;

} catch (error) {
  
}

})

app.listen(port,async function(){
    console.log(`the server  is running on ${port}`)
   await connection();
   console.log('DB IS CONNECTED')
 

})