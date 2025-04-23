// routes/userRoutes.js
const router = require("express").Router();
const userController = require("../controller/UserController");
const { validateToken } = require("../middleware");
const multer = require("multer");
const createProductController = require("../controller/ProductController");

// Wrap the router middleware in a function that returns the router
module.exports = () => {
  // Call the controller factory function with no parameters
  const {
    loginUser,
    userProfile,
    createTeamMembers,
    getTeamMembers,
    editUserDetails,
    deleteUserDetails,
  } = userController();
  const { UploadProductDetails, GetProductList, GetSingleProductDetails } =
    createProductController();

  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  //public routes
  router.post("/login", loginUser);

  //private routes
  router.post("/users/create", validateToken, createTeamMembers);
  router.get("/users/profile/:id", validateToken, userProfile);
  router.get("/users/team-list/:id", validateToken, getTeamMembers);
  router.patch("/users/edit/:id", validateToken, editUserDetails);
  router.delete("/users/delete", validateToken, deleteUserDetails);
  router.post(
    "/products/create/:id",
    upload.single("image"),
    validateToken,
    UploadProductDetails
  );
  router.get("/products/product-list/", GetProductList);
  router.get("/products/product-details/:id", GetSingleProductDetails);

  // Return the router with the middleware attached
  return router;
};
