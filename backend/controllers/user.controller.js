import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.json("user not found");
        }
        const user = User.findOne(userId).select("-password");
        res.json(user);
    } catch (error) {
        res.json({ error: error.message });
    }
};

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (id === req.user._id.toString()) {
            return res
                .status(400)
                .json({ error: "You can't follow/unfollow yourself" });
        }

        if (!userToModify || !currentUser)
            return res.status(400).json({ error: "User not found" });

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // Unfollow the user
            await User.findByIdAndUpdate(id, {
                $pull: { followers: req.user._id },
            });
            await User.findByIdAndUpdate(req.user._id, {
                $pull: { following: id },
            });

            res.status(200).json({ message: "User unfollowed successfully" });
        } else {
            // Follow the user
            await User.findByIdAndUpdate(id, {
                $push: { followers: req.user._id },
            });
            await User.findByIdAndUpdate(req.user._id, {
                $push: { following: id },
            });
            // Send notification to the user
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            });

            await newNotification.save();

            res.status(200).json({ message: "User followed successfully" });
        }
    } catch (error) {
        console.log("Error in followUnfollowUser: ", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const getSuggestedUsers = async (req, res) => {
    try {
        console.log("hello");
        const usersFollowedByMe = req.user.following;
        const userId = req.user._id;

        const users = User.aggregate([
            {
                $match: {
                    _id: { $ne: userId },
                    _id: { $nin: usersFollowedByMe },
                },
            },
            { $sample: { size: 10 } },
        ]);
        const suggestedUsers = users.slice(0, 4);
        suggestedUsers.forEach((user) => (user.password = null));

        res.status(200).json(suggestedUsers);

        //const usersfollowedbyme = req.user.following;
    } catch (error) {
        console.log("🚀 ~ getSuggestedUser ~ error:", error);
    }
};

export const updateUser = async (req, res) => {
    try {
        let user = await User.findById(req.user._id);
        let { profileImg, coverImg } = req.body;
        //get the user
        //get the details to update the from body
        //findoneand update in the database
        //current password and new password
        const {
            fullName,
            email,
            username,
            currentPassword,
            newPassword,
            bio,
            link,
        } = req.body;
        if (
            (!newPassword && currentPassword) ||
            (!currentPassword && newPassword)
        ) {
            return res.status(400).json({
                error: "Please provide both current password and new password",
            });
        }
        if (currentPassword && newPassword) {
            const isCorrect = await bcrypt.compare(
                currentPassword,
                user.password
            );
            if (!isCorrect) {
                return res.json({ error: "incorrect password" });
            }
            const updated = await bcrypt.hash(newPassword, 8);
            user.password = updated;
        }

        //cloudinary
        if (profileImg) {
            if (user.profileImg) {
                // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
                await cloudinary.uploader.destroy(
                    user.profileImg.split("/").pop().split(".")[0]
                );
            }

            const uploadedResponse = await cloudinary.uploader.upload(
                profileImg
            );
            profileImg = uploadedResponse.secure_url;
        }

        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(
                    user.coverImg.split("/").pop().split(".")[0]
                );
            }

            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }

        //userDetails
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();
        user.password = null;

        return res.status(200).json(user);
    } catch (error) {
        console.log("Error in updateUser: ", error.message);
        res.status(500).json({ error: error.message });
    }
};
