import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils/generateToken.js";
export const register = async (req, res) => {
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
            return res.json("user already exists");
            //redirect to login
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
            generateToken(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
            });
        }
    } catch (error) {
        console.log(error);
    }
};
