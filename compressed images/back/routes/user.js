const express = require("express")
const router = express.Router()

const{getUserById, getUser, getAllUsers, updateUser, userPurchaseList} = require("../controllers/user")
const{isSignedIn, isAuthenticated, isAdmin} = require("../controllers/auth")

router.param("userId", getUserById)

router.get("/user/:userId", isSignedIn, isAuthenticated ,getUser)    //to directly retrieve data from DB use 'get' method

router.put("/user/:userId", isSignedIn, isAuthenticated, updateUser )

router.get("/orders/user/:userId", isSignedIn, isAuthenticated, userPurchaseList )

//Assignment
//router.get("/users", getAllUsers)

module.exports = router;