const express = require('express');
const bodyParser = require("body-parser");

const app2 = express();

app2.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allowed-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    next();
});

app2.use(bodyParser.json());

app2.use("/api/posts", (req, res) => {

    const posts = [
        {
            id: null,
            title: "Title1",
            content: "Content1"
        },
        {
            id: null,
            title: "Title2",
            content: "Content2"
        }
    ]
    res.status(200).json({message: "Posts fetched successfully", posts: posts});
});

// app.post("/api/posts", (req,res) => {
//     const post = req.body;
//     console.log(post);
//     res.status(201).json({message: "Post added successfully!"});
// });

app2.post("/api/posts", (req, res) => {
    const post = req.body;
    // console.log(post);
    // console.log("Backend message: post added successfully");
    res.status(201).json({message: "Response sent to frontend: Post saved in database successfully"});
});

module.exports = app2;