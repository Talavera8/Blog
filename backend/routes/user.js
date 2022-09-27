const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

router.post("/signup", (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(user => {
                    console.log("created user in backend: " + user);
                    res.status(201).json({
                        message: "User was successfully created",
                        user: user
                    });
                });
        });
});

router.post("/login", (req, res, next) => {
    let user;
    User.findOne({ email: req.body.email })
        .then(fetchedUser => {
            console.log("fetchedUser in backend: " + fetchedUser);
            if (!fetchedUser) {
                return res.status(404).json({
                    message: "That email was not found",
                    //token: null
                });
            }
            user = fetchedUser;
            return bcrypt.compare(req.body.password, fetchedUser.password);
        })
        .then(passwordMatched => {
            console.log("passwordMatched from backend: " + passwordMatched)
            if (!passwordMatched) {
                return res.status(404).json({
                    message: "That email was not found",
                    //: null
                });
            }
            const token = jwt.sign({
                email: user.email,
                userId: user._id,
            }, 'AVeryLongStringSecretHere', { expiresIn: "1h" });

            console.log("token generated in backend: " + token);
            res.status(201).json({
                message: "Login was successful!",
                token: token,
                expiresIn: 3600,
                userId: user._id
            });
        })
        .catch(err => {
            res.status(404).json({
                message: "Login failed!",
                token: null
            })
        });
    });

module.exports = router;