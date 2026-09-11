const {
  login,
  register,
  getAllUsers,
  setAvatar,
  logOut,
  refreshToken,
} = require("../controllers/userController");

const router = require("express").Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refresh", refreshToken);
router.get("/allusers/:id", getAllUsers);
router.post("/setavatar/:id", setAvatar);
router.get("/logout/:id", logOut);

module.exports = router;
