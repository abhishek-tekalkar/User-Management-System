const express = require("express");
const user_route = express();
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
user_route.use(bodyParser.json());
const userController = require("../controllers/userController");
const session = require('express-session');
const config = require("../config/config");
user_route.use(session({
   secret: config.sessionSecret, resave: true,
   saveUninitialized: true
}));
const auth = require('../middlewares/auth');



// for rendering views on frontend 
user_route.use(bodyParser.urlencoded({ extended: true }));
//for saving file into our location usin multer
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../public/userImages'));
   },
   filename: function (req, file, cb) {
      const name = Date.now() + '-' + file.originalname;
      cb(null, name);
   }
})
const upload = multer({ storage: storage });

user_route.set('views', './views/users');
user_route.set('view engine', 'ejs');

user_route.get("/register", auth.isLogout, userController.loadregister);

user_route.post('/register', upload.single('image'), userController.insertUser);

user_route.get('/verify', userController.verifyMail);

user_route.get('/', auth.isLogout, userController.loginLoad);
user_route.get('/login', auth.isLogout, userController.loginLoad);

user_route.post('/login', userController.verifyLogin);


user_route.get('/home', auth.isLogin, userController.loadHome);
// user_route.post('/home', userController.verifyLogin);

user_route.get('/logout', auth.isLogin, userController.userLogout);
user_route.get('/forget',auth.isLogout,userController.forgetLoad)
user_route.post('/forget',userController.forgetVerify);
user_route.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad);
user_route.post('/forget-password',userController.resetPassword);

module.exports = user_route;