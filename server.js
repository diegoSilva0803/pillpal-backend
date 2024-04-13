const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const router = require("./routes/router");
const uniqid = require("uniqid");

const app = express();

// everything in the body gets parsed in to json
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

//router should always be at the very end
app.use("/", router);

const port = 8080;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
