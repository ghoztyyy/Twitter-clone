import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils/generateToken.js";
export const signup = async (req, res) => {
    //take info from user - userName, fullName ,email,password,
    //validate the data
    //check email using regex
    //if all the data is correct - create the user from model and save

    try {
        const { userName, fullName, password, email } = req.body;
        //email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        if (!userName && !fullName && !password && !email) {
            res.status(400).json("pls enter all the data");
        }
        const existedEmail = await User.findOne({ email });

        if (existedEmail) {
            return res.status(400).json({ error: "Email is already taken" });
            //redirect to login
        }
        if (password.length < 6) {
            return res
                .status(400)
                .json({ error: "Password must be at least 6 characters long" });
        }
        //password hashing
        const hashedPassword = await bcrypt.hash(password, 8);

        const newUser = new User({
            userName,
            email,
            password: hashedPassword,
            fullName,
        });

        //jwt authentication
        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
            });
        } else {
            res.status(400).json({ error: "Invalid user data" });
        }
    } catch (error) {
        console.log(error);
    }
};

export const login = async (req, res) => {
    //get the usrname/email and password from body
    //validate and then authenticate
    //if success then generate and verify cookie
    try {
        const { userName, password } = req.body;
        if (!userName || !password) {
            return res.status(404).json("pls enter all details");
        }
        const user = await User.findOne({ userName });
        if (!user) {
            return res.json("user not found");
        }
        if (bcrypt.compare(password, user.password)) {
            generateToken(user._id, res);
            res.json("login successfull");
        }
    } catch (error) {
        console.log("error in login");
    }
};

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getMe controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
