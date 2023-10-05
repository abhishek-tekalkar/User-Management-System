const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
// mongoose.connect('mongodb://127.0.0.1:27017/user_management_system',
//     console.log("Mongodb connected.................")
// );
mongoose.connect('<ur-mongo-url>',
    console.log("Mongodb connected.................")
);
const express = require("express");
const app = express();
const userRoute = require('./routes/userRoute');
app.use('/', userRoute);
app.use(express.static('public'));



//for admin routes
const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute);

app.listen(5566, function () {
    console.log("server is running on 5566");
})

//first make model
// users:  tekalkarabhi123
//         123123123
//         rakesh2
        // harry3
        // nick4

        
// admin : abhite07
//         123123123
