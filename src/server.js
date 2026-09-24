const dotenv = require("dotenv").config();
const connectionDB = require("./config/database"); // Connect to the database
const app = require("./app")// Start the Express app
const http = require("http");
const setupSocket = require("./realtime/socket");


const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await connectionDB(); // Ensure the database is connected before starting the server
    
    
    const httpServer = http.createServer(app);
    await setupSocket(httpServer);
    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer();