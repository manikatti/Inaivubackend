import jwt from "jsonwebtoken";

export const createContext = async ({ req }) => {
  const authHeader = req.headers.authorization || "";

  

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return {
      user: null,
    };
  }
 
  try {
    const decoded = jwt.verify(
      token,
      "9fca6655b26a57a6e4ac9f9f23c38cd7e0ccc6733606b67f14f903d3680d6c987ef9ffc3db5eef259e4773b6759a291e254fdf72aa8748fd574f8b6201208ef4",
    );

    return {
      user: decoded,
    };
  } catch (error) {
      console.log("context", error);
    return {
      user: null,
    };
  }
};
