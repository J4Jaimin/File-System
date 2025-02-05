import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import fileRoutes from './routes/fileroutes.js';
import dirRoutes from './routes/dirroutes.js';
import userRoutes from './routes/userroutes.js';
import isAuthorized from './middlewares/auth.js';

const app = express();

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://mydrive-umber.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
  exposedHeaders: ['Content-Disposition'],
};

// Enabling CORS
// app.use((req, res, next) => {
//   res.set("Access-Control-Allow-Origin", "*");
//   next();
// });

app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.static("storage"));

app.use('/file', isAuthorized, fileRoutes);
app.use('/directory', isAuthorized, dirRoutes);
app.use('/user', userRoutes);

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
