const app = require('./app');

const connectDatabase = require('./config/database');
const dotenv = require('dotenv');
const port = process.env.PORT || 4000;

// Handling uncaught exception
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to uncaught exception`);
    process.exit(1);
})


// config
dotenv.config({path:'backend/config/config.env'});

connectDatabase()

const server = app.listen(port , ()=>{
    console.log(`Server has started successfully and is running at http://localhost:${port}`)
});

// console.log(boba)

// Unhandled rejection

process.on("unhandledRejection" , err=>{
    console.log(`Error : ${err.message}`);
    console.log(`Shutting down the server due to unhandled promise rejection`);
    server.close(()=>{
        process.exit(1);
    });
});


