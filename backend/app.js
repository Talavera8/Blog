const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');
const path = require('path');

// Connect from shell: mongosh "mongodb+srv://cluster0.5pqne.mongodb.net/meanBlogtDatabase" --username Maribel

// Connect from application: mongodb+srv://Maribel:FamiliaEspecial8*@cluster0.5pqne.mongodb.net/meanBlogtDatabase?retryWrites=true&w=majority
mongoose.connect("mongodb+srv://Maribel:FamiliaEspecial8*@cluster0.5pqne.mongodb.net/meanBlogtDatabase?retryWrites=true&w=majority")
    .then(() => {
        console.log("Connection to database was successful!");
    });

const app = express();

app.use(bodyParser.json());
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    next();
});

app.use("/api/posts", postsRoutes);
app.use("/api/user", userRoutes);

module.exports = app;