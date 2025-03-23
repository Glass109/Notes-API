import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "secret";

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Acceso denegado" });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch {
    res.status(400).json({ message: "Token inválido" });
  }
};

export default authMiddleware;