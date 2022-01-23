import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import colors from "colors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";
import connectDB from "./config/db";
import errorMiddleware from "./middlewares/errorHandler";
import { authRouter } from "./routes/authRoute";
import { cloudinaryRouter } from "./routes/cloudinaryRoute";

import cloudinaryConfig from "./utils/cloudinary";

const app = express();
import { userRouter } from "./routes/userRoute";
import { serviceRouter } from "./routes/serviceRoute";
// configure colors

dotenv.config();

colors.enable();

// connect to DB
connectDB();

// Add a list of allowed origins.

const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:3000",
];

const options: cors.CorsOptions = {
  credentials: true,
  origin: allowedOrigins,
};

app.set("trust proxy", 1);

// MIDDLEWARES


app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());
// Then pass these options to cors:
app.use(cors(options));



// configure swagger
const swaggerJSDocs = YAML.load("./api.yaml");



// configure cloudinary
cloudinaryConfig();

//app.use(urlencoded({extended: true}))

// configure swagger
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJSDocs));

const PORT = process.env.PORT || 8000;

// Mount Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/cloudinary", cloudinaryRouter);
app.use("/api/v1/service", serviceRouter)


//global Error Handler
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`App running on PORT ${PORT}`.underline.cyan.bold);
});
