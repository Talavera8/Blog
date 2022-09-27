const express = require('express');
const Post = require('../models/post');
const router = express.Router();
const multer = require('multer');
const { FILE } = require('dns');
const checkAuth = require('../middleware/check-auth');

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        const isValid = MIME_TYPE_MAP[file.mimetype];
        if (isValid) {
            error = null;
        }
        cb(error, './backend/images');
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name + '-' + Date.now() + '.' + ext);
    }
});

router.post("", checkAuth, multer({ storage: storage }).single('image'), (req, res) => {
    const url = req.protocol + '://' + req.get("host");
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + '/images/' + req.file.filename,
        creator: req.userData.userId
    });
    console.log(post);
    post.save().then((createdPost) => {
        res.status(201).json({
            message: "Post added successfully!",
            post: {
                // ...createdPost.toObject(),
                id: createdPost._id,
                title: createdPost.title,
                content: createdPost.title,
                imagePath: createdPost.imagePath
            }
        });
    });
});

router.get("", (req, res) => {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const postQuery = Post.find();
    let fetchedDocuments;

    if(pageSize && currentPage) {
        postQuery
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);
    }
    postQuery.then((documents) => {
        fetchedDocuments = documents;
        return Post.count();
        // res.status(200).json({
        //     message: "Posts fetched successfully",
        //     posts: documents
        })
        .then(count => {
            res.status(200).json({
                posts: fetchedDocuments,
                message: "Posts fetched successfully",
                maxPosts: count
            });
        });
    });

router.delete("/:id", checkAuth, (req, res) => {
    Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(result => {
        console.log("user id: " + req.userData.userId);
        console.log("post id: " + req.params.id);
        console.log(result);
        if(result.deletedCount > 0) {
            res.status(201).json({ message: "Post successfully deleted!" });
        } else {
            res.status(401).json({ message: "User not authorized to delete post" });
        }
    });
});

router.get("/:id", (req, res) => {
    Post.findById(req.params.id).then(post => {
        res.status(201).json(post);
    });
});

router.put("/:id", checkAuth, multer({storage: storage}).single("image"), (req, res) => {
    let imagePath = req.body.imagePath; // if a postData.imagePath (string) was sent instead of postData.image (file)
    if (req.file) {
        const url = req.protocol + '://' + req.get("host");
        imagePath = url + '/images/' + req.file.filename
    }
    const post = new Post({
        _id: req.params.id, // or request body.id
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        creator: req.userData.userId
    });
    Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then(result => {
        console.log(result);
        if(result.modifiedCount > 0) {
            res.status(201).json({ message: "Post successfully updated!" });
        } else {
            res.status(401).json({ message: "User not authorized to update post" });
        }  
    });
});

module.exports = router;