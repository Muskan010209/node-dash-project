const express = require('express');
const cors = require("cors")
require('./db/config');
const User = require('./db/User');
const Product = require('./db/Product');

const Jwt = require('jsonwebtoken');
const JwtKey = 'e-commerce';

const app = express();

app.use(express.json());
app.use(cors());

// Root route handler
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

app.post('/register', async (req, res) => {
  try {
    // Create a new user object using the User model
    let newUser = new User(req.body);

    // Save the user to the database
    let result = await newUser.save();
    res.status(201).send(result);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Internal server error');
  }
});


app.post("/login", async (req, res) => {
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      Jwt.sign({ user }, JwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          res.send({ result: "Something went wrong, Please try after sometime" })

        }
        res.send(user, { auth: token })


      });
      res.send(user)
    } else {
      res.send({ result: "no user found" })
    }

  }
});

// app.post("/login",async(req,res)=>{app.post("/login", async (req, res) => {
//   console.log(req.body);
//   try {
//       if (req.body.password && req.body.email) {
//           let user = await User.findOne({ email: req.body.email, password: req.body.password }).select("password");
//           if (user) {
//               jwt.sign({ user }, jwtkey, { expiresIn: '2h' }, (err, token) => {
//                   if (err) {
//                       console.error('Error generating token:', err);
//                       res.status(500).send({ error: 'Internal Server Error' });
//                   } else {
//                       res.status(200).send({ token });
//                   }
//               });
//           } else {
//               res.status(404).send({ error: 'User not found' });
//           }
//       } else {
//           res.status(400).send({ error: 'Invalid request' });
//       }
//   } catch (error) {
//       console.error('Error during login:', error);
//       res.status(500).send({ error: 'Internal Server Error' });
//   }
// });

//   console.log(req.body)
//   if(req.body.password && req.body.email){
//     let user= await User.findOne(req.body).select("password");
//     if (user){

//       res.send(req.body)

//     }else{
//       res.send({result:'no user find'})
//     }

//   }
//   else{
//     res.send({result:'no user find'})

//   }

// });

app.post("/add-product", async (req, res) => {
  let product = new Product(req.body);
  let result = await product.save();
  res.send(result);
});


app.get("/products", async (req, res) => {
  let products = await Product.find();
  if (products.length > 0) {
    res.send(products)
  } else {
    res.send({ result: " No Products Found" });
  }
})


app.delete("/product/:id", async (req, res) => {
  try {
    const result = await Product.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 1) {
      res.status(200).send({ message: "Product deleted successfully" });
    } else {
      res.status(404).send({ error: "Product not found" });
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});


app.get("/product/:id", async (req, res) => {
  let result = await Product.findOne({ _id: req.params.id });
  if (result) {
    res.send(result)
  } else {
    res.send({ result: "no record found" })
  }
});


app.put("/product/:id", async (req, res) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    {
      $set: req.body
    }
  )
  res.send(result)
});


app.get("/search/:key", async (req, res) => {
  try {
    let result = await Product.find({
      "$or": [
        { name: { $regex: req.params.key } }
      ]
    });
    res.send(result);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});



function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(403).send({ result: "Please add a token with the header" });
  }

  const tokenParts = authHeader.split(' ');
  const authToken = tokenParts[1];

  if (!authToken) {
    return res.status(401).send({ result: "Please provide a valid token" });
  }

  console.warn("middleware called", authToken);
  Jwt.verify(authToken, JwtKey, (err, decodedToken) => {
    if (err) {
      return res.status(401).send({ result: "Invalid token" });
    }
    req.decoded = decodedToken; // Attach decoded token to the request object
    next(); // Call next middleware if token is valid
  });
}


module.exports = verifyToken;



const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
