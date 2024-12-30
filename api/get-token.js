module.exports = async (req, res) => {
  try {
    const token = await getStoredToken();  // Assume this is a function to get your stored token
    if (!token) {
      return res.status(400).json({
        error: "No token found."
      });
    }
    return res.status(200).json({
      token: token,
    });
  } catch (error) {
    console.error("Error retrieving token:", error.message);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
