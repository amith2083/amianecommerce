export const isLogout = async (req, res, next) => {
  try {
    if (req.cookies.token) {
      res.redirect("/home");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};
