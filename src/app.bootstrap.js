
import express from "express";
import connectionDB from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import cors from "cors"
const app = express();
const port = 3000;


const bootstrap = async () => {

    app.use(cors({
        origin: "*"
    }))
    app.use(express.json());
    await connectionDB();
    app.get("/", (req, res, next) => {
        res.status(200).json({ message: "welome on sarahaaa app..........😉😍" });
    });

    app.use("/users", userRouter);


    app.use("{/*demo}", (req, res, next) => {
        // // res.status(404).json({
        // //     message: `URL:${req.originalUrl} with METHOD:${req.method} not found`,
        // //     statusCode: 404
        // // }
        // )
        throw new Error(`URL:${req.originalUrl} with METHOD:${req.method} not found`, { cause: 404 });
    });


    app.use((err, req, res, next) => {
        console.log(err);
        res.status(err.casue || 500).json({ error: err.message, stack: err.stack });
    });


    app.listen(port, () => {
        console.log(`SARAHA APP running on server ${port}`);
    })
}


export default bootstrap