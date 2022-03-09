const mongoose = require('mongoose');

const connectDatabase = () => {   
    mongoose.connect('mongodb://127.0.0.1:27017/Ecommerce').then((data)=>{
        console.log(`Connected to mongodb ${data.connection.host}`);
    })
}

module.exports = connectDatabase