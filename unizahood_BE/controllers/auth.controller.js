const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ error: "Táto emailová adresa sa už používa." });
    existingUser = await User.findOne({ username });
    if (existingUser)
      return res
        .status(400)
        .json({ error: "Toto používateľské meno sa už používa." });

    const hashedPw = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPw });
    await user.save();
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      token,
      id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ error: "Registrácia zlyhala" + err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Nesprávny email alebo heslo" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Nesprávny email alebo heslo" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      token,
      id: user._id,
      email: user.email,
      username: user.username,
    });
  } catch (err) {
    res.status(500).json({ error: "Prihlásenie zlyhalo" });
  }
};

module.exports = { register, login };
