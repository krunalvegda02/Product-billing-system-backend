const MESSAGE = {
    // User Messages
    USER_REGISTER_SUCCESS: "User registered successfully.",
    USER_REGISTER_FAILED: "Failed to register user.",
    USER_LOGIN_SUCCESS: "User logged in successfully.",
    USER_LOGIN_FAILED: "Invalid credentials. Login failed.",
    USER_NOT_FOUND: "User not found.",
    USER_UPDATE_SUCCESS: "User updated successfully.",
    USER_DELETE_SUCCESS: "User deleted successfully.",
    USER_ALREADY_EXISTS: "User already exists with given details.",
    UNAUTHORIZED_REQUEST: "Unauthorized request.",
    INVALID_TOKEN: "Invalid or expired token.",
    ACCESS_DENIED: "Access denied.",

    ADMIN_REGISTER_SUCCESS: "Admin Registered succesfully",
    ADMIN_REGISTER_FAILED: "Admin Registerd Failed",

    STAFFMEMBERS_FETCH_FAILED: "Failed to Fetch Staff members",
    STAFFMEMBERS_FETCH_SUCCESS: "Staff members Fetched Successfully",

    // Order Messages
    ORDER_CREATE_SUCCESS: "Order placed successfully.",
    ORDER_CREATE_FAILED: "Failed to create order.",
    ORDER_UPDATE_SUCCESS: "Order updated successfully.",
    ORDER_DELETE_SUCCESS: "Order deleted successfully.",
    ORDER_DELETE_FAILED: "Order deletion failed",
    ORDER_FOUND_SUCCESS: "Order Fetched successfully",
    ORDER_NOT_FOUND: "Order not found.",
    ORDER_STATUS_UPDATED: "Order status updated successfully.",
    COMPLETED_ORDER_UPDATE_ERROR: "Your Order was Completed, Changes can't be applied on Completed Order",


    // Product Messages
    PRODUCT_CREATE_SUCCESS: "Product created successfully.",
    PRODUCT_CREATE_FAILED: "Failed to create product.",
    PRODUCT_UPDATE_SUCCESS: "Product updated successfully.",
    PRODUCT_DELETE_SUCCESS: "Product deleted successfully.",
    PRODUCT_NOT_FOUND: "Product not found.",
    PRODUCT_ALREADY_EXISTS: "Product already exists.",
    PRODUCT_FOUND_SUCCESS: "Product Feteched Successfully",
    PRODUCTS_BY_CATEGORY_SUCCESS: "Products fetched by category successfully.",

    PRODUCT_UNLIKED_SUCCESS: "Product Liked successfully.",
    PRODUCT_LIKED_SUCCESS: "Productunliked successfully.",

    // Category Messages
    CATEGORY_CREATE_SUCCESS: "Category created successfully.",
    CATEGORY_CREATE_FAILED: "Failed to create category.",
    CATEGORY_UPDATE_SUCCESS: "Category updated successfully.",
    CATEGORY_DELETE_SUCCESS: "Category deleted successfully.",
    CATEGORY_NOT_FOUND: "Category not found.",
    CATEGORY_ALREADY_EXISTS: "Category already exists.",

    // Cloudinary Messages
    UPLOAD_CLOUDINARY_SUCCESSFULLY: "File uploaded successfully.",
    DELETE_CLOUDINARY_SUCCESSFULLY: "File deleted successfully.",
    UPLOAD_CLOUDINARY_ERROR: "Error uploading file.",
    DELETE_CLOUDINARY_ERROR: "Error deleting file.",

    // General Error Messages
    ALL_FIELDS_MUST_REQUIRED: "All fields are required.",
    INVALID_INPUT: "Invalid input provided.",
    SOMETHING_WENT_WRONG: "Something went wrong. Please try again later.",
    RESOURCE_NOT_FOUND: "Requested resource not found.",
    INTERNAL_SERVER_ERROR: "Internal server error.",
    BAD_REQUEST: "Bad request.",

    // General Success Messages
    OPERATION_SUCCESS: "Operation completed successfully.",
    DATA_FETCHED_SUCCESS: "Data fetched successfully.",
    DATA_UPDATED_SUCCESS: "Data updated successfully.",
    DATA_DELETED_SUCCESS: "Data deleted successfully.",

    // Error message for User Model
    ENTER_VALID_CONTACT: "Please enter valid contact no.",
    ENTER_VALID_USERNAME: "Please enter username between 2-100 characters",
    ENTER_VALID_PASSWORD: "Please enter password between 4-10 characters",

    // Error message for Orers Model
    ENTER_VALID_DISCOUNT: "Please enter discount between 0-100 percent",

};

export default MESSAGE;
