process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

import express from "express"
import cors from "cors"
const app=express()


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin:process.env.CORS_ORIGIN ?.split(",") || "http://localhost:5173",
    credentials:true,
    methods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders:["Authorization","Content-Type"]
}))

import videoGeneratingRoute from "./src/route/generateVideo.route.js"
app.options('*', cors());
app.use("/api/generate-video-base64",videoGeneratingRoute)

const PORT=8080;

app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`)
})