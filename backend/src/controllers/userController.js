const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { registerSchema, loginSchema } = require("../validators/authValidator");
const jwt = require("jsonwebtoken");

const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES;
const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES;

module.exports.login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        msg: error.details[0].message,
      });
    }

    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ msg: "Invalid credentials", status: false });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ msg: "Invalid credentials", status: false });
    }
    const userData = { ...user._doc };
    delete userData.password;

    const accessToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES },
    );

    const refreshToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES },
    );

    user.refreshToken = refreshToken;
    await user.save();

    // set httpOnly cookie for refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ status: true, user: userData, accessToken });
  } catch (ex) {
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        msg: error.details[0].message,
      });
    }

    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck) {
      return res
        .status(409)
        .json({ msg: "Username already used", status: false });
    }
    const emailCheck = await User.findOne({ email });
    if (emailCheck) {
      return res.status(409).json({ msg: "Email already used", status: false });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    const userData = { ...user._doc };
    delete userData.password;

    const accessToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES },
    );

    const refreshToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES },
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({ status: true, user: userData, accessToken });
  } catch (ex) {
    next(ex);
  }
};

module.exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ msg: "Refresh token missing" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ msg: "Invalid refresh token" });
    }

    const user = await User.findById(payload.id);
    if (!user || !user.refreshToken || user.refreshToken !== token) {
      return res.status(401).json({ msg: "Refresh token revoked" });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES },
    );

    const userData = { ...user._doc };
    delete userData.password;

    return res
      .status(200)
      .json({ accessToken: newAccessToken, user: userData });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.params.id } },
      { password: 0, email: 0, __v: 0 },
    );
    return res.status(200).json(users);
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true },
    );
    if (!userData) {
      return res.status(404).json({ msg: "User not found" });
    }
    return res.status(200).json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.logOut = async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (!userId) return res.status(400).json({ msg: "User id is required " });

    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.clearCookie("refreshToken");
    return res.status(200).json({ msg: "Logged out" });
  } catch (ex) {
    next(ex);
  }
};
