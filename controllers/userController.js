// controller connects model and view 
// controller handles all methods. 
const User = require("../models/userModel");
// creating methods which takes data from model and sent it to the mongodb 
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { db, diffIndexes } = require("../models/userModel");
const SMTPConnection = require("nodemailer/lib/smtp-connection");
const { use } = require("../routes/userRoute");
const randomstring = require("randomstring");
const config = require("../config/config");
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

// method for sending mail
const sendVerifyMail = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            },
            host: 'smtp.gmail.com',
            port: 465,
            // secure: false,
            // requireTLS: true,

        });
        const mailOptions = {
            from: 'abhitekalar21@gmail.com',
            to: email,
            subject: 'for verification mail',
            html: '<p>Hii ' + name + ', please click here to <a href="http://localhost:5566/verify?id=' + user_id + '"> verify </a> your mail.</p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {

                console.log(error.message);
            }
            else {
                console.log("Email has been sent :- ", info.response);
            }
        })

    } catch (error) {
        console.log(error.message);
    }

}
// method for verify mail 
const sendResetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            },
            host: 'smtp.gmail.com',
            port: 465,
            // secure: false,
            // requireTLS: true,

        });
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'for Reset password',
            html: '<p>Hii ' + name + ', please click here to <a href="http://localhost:5566/forget-password?token=' + token + '"> reset </a> your password.</p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {

                console.log(error.message);
            }
            else {
                console.log("Email has been sent :- ", info.response);
            }
        })

    } catch (error) {
        console.log(error.message);
    }

}
const verifyMail = async (req, res) => {
    try {
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_varified: 1 } });

        console.log();
        res.render("email-verified");

    } catch (error) {
        console.log(error.message);
    }
}
//for reset password send ma
const loadregister = async (req, res) => {
    try {
        res.render('register');
    } catch (error) {
        console.log(error.message);
    }
}
const insertUser = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
            image: req.file.filename, //for file name use multer
            password: spassword,
            is_admin: 0
        });

        const userData = await user.save();//promise
        if (userData) {
            sendVerifyMail(req.body.name, req.body.email, userData._id);
            res.render('register', { message: "your form registeration has been done successfully. please verify your mail" });

        }
        else {
            res.render('register', { message: "your form registeration has been done failed." });
        }

    } catch (error) {
        console.log(error.message);
    }
}
// login user method started 
const loginLoad = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.messsage);
    }
}
// for verify login 
// check cases for verifying email 
// 1.pass is diff
// 2.user and pass are ryt but mail is not verified
// 3. email doesnt exist 
const verifyLogin = async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        
        const userData = await User.findOne({ email: email });
        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_varified === 0) {
                    res.render('login', { message: "Please verify your email." });
                } else {
                    req.session.user_id = userData._id;
                    res.redirect('/home');
                }

            }
            else {
                res.render('login', { message: "Password is incorrect !!" });
            }

        }
        else {
            res.render('login', { message: "Email and password is incorrect !!" });
        }



    } catch (error) {
        console.log(error.message);
    }
}
const loadHome = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id });
        res.render('home', { user: userData });
    } catch (error) {
        console.log(error.message);
    }
}
const userLogout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}
//forget password code
const forgetLoad = async (req, res) => {
    try {
        res.render('forget');
    } catch (error) {
        console.log(error.message);
    }
}

const forgetVerify = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        if (userData) {

            if (userData.is_varified === 0) {
                res.render('forget',{message: "please verify your mail" });


            }
            else {
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({ email: email }, { $set: { token: randomString } });
                sendResetPasswordMail(userData.name, userData.email, randomString);

                res.render('forget',{message: "Please check your mail to reset your password" });

            }
        }
        else {
            res.render('forget',{message: "e-Mail is incorrect" });

        }
    } catch (error) {
        console.log(error.message);
    }
}
const forgetPasswordLoad = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({ token: token });
        if (tokenData) {
            res.render('forget-password', { user_id: tokenData._id });
        }
        else {
            res.render('404', { message: "token is invalid" });

            // res.json({ message: "Register the user" });
        }


    } catch (error) {
        console.log(error.message);
    }
}
const resetPassword = async (req, res) => {
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;
        const secure_password = await securePassword(password);
        const updatedData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_password, token: '' } });
        res.redirect("/");


    } catch (error) {
        console.log(error.message);
    }
}
//for verification of mail on login page
const verificationLoad = async (req, res) => {
    try {
        res.render('verification');
    } catch (error) {
        console.log(error.message);
    }
}
const sentVerificationLink = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        if (userData) {
            sendVerifyMail(userData.name, userData.email, userData._id);
            res.render('verification', { message: "Verification mail sent to your mail" })
        }
        else {
            res.render('verification', { message: "email doe3snt exist" });
        }
    } catch (error) {
        console.log(error.message);
    }
}
//for user profile edit & update

const editLoad = async (req, res) => {
    try {
        const id = req.query.id;
        //we are using query to fetch data from url
        const userData = await User.findById({ _id: id });

        if (userData) {
            res.render('edit', { user: userData });

        } else {
            res.redirect('/home');
        }
    } catch (error) {
        console.log(error.message);
    }
}
const updateProfile = async (req, res) => {
    try {
        if (req.file) {
            const userData = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { name: req.body.name, email: req.body.email, mobile: req.body.mno, image: req.file.filename } });

        } else {
            const userData = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { name: req.body.name, email: req.body.email, mobile: req.body.mno } });


        }
        res.redirect('/home');
    } catch (error) {
        console.log(error.message);
    }

}
module.exports = {
    loadregister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    verificationLoad,
    sentVerificationLink,
    editLoad,
    updateProfile
}

