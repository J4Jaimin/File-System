import express from "express";
import cors from 'cors';
import fileRoutes from './routes/fileroutes.js';
import cookieParser from "cookie-parser";
import dirRoutes from './routes/dirroutes.js';
import userRoutes from './routes/userroutes.js';
import authRoutes from './routes/authroutes.js';
import adminRoutes from './routes/adminroutes.js';
import isAuthorized from './middlewares/auth.js';
import { connectDB } from "./config/Dbconnection.js";

const mySecret = "my-super-secret-key@#$";

try {

  // DB connection
  connectDB();
  const app = express();

  const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'https://mydrive-umber.vercel.app', 'http://localhost', 'http://10.10.211.132:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    exposedHeaders: ['Content-Disposition']
  };

  // Enabling CORS
  // app.use((req, res, next) => {
  //   res.set("Access-Control-Allow-Origin", "*");
  //   next();
  // });
  app.use(express.json());
  app.use(cookieParser(mySecret));
  app.use(cors(corsOptions));
  app.use(express.static("storage"));

  app.use('/file', isAuthorized, fileRoutes);
  app.use('/directory', isAuthorized, dirRoutes);
  app.use('/user', userRoutes);
  app.use('/auth', authRoutes);
  app.use('/admin', adminRoutes);

  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      message: err.message || "Something went wrong",
    });
  })


  // Serving File
  // app.use((req, res, next) => {
  //   if (req.query.action === "download") {
  //     res.set("Content-Disposition", "attachment");
  //   }
  //   express.static("storage")(req, res, next);
  // });


  app.listen(4000, () => {
    console.log(`Server Started`);

  });
} catch (error) {
  console.log("Cannot connect to DB", error);
}
