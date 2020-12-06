// require("dotenv").config();

// console.log(process.env.API_KEY);
const express = require("express");
const path = require("path");

// Init an Express App.
const app = express();
const PORT = 4000;
app.listen(PORT, () => {});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "/public/index.html"));
});

// error 404
app.use((req, res) => {
	res.status(404).send('<center></br><h1>Error 404: Page not found!</br><a href=" / ">Click here to go to homepage</a></h1></center>');
});
// load all things in below function then do anything else
(async function () {
	// await Promise.resolve(console.log("🎉"));
})();
