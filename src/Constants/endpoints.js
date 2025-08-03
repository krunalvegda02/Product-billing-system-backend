const ROUTE = {
    USER_ROUTER: "/api/v1/users",
    PRODUCT_ROUTER: "/api/v1/products",
    CATEGORY_ROUTER: "/api/v1/category",
    ORDER_ROUTER: "/api/v1/orders",
}

// TODO: FORGOT PASS API ENDPOINT CREATE
const API = {
    USER: {
        REGISTER: "/register",
        CREATE_USER: "/create-user",
        LOGIN: "/login",
        LOGOUT: '/logout',
        CHANGE_PASSWORD: "/change-password",
        UPDATE_PROFILE: "/update-profile",
        UPDATE_AVATAR: "/update-avatar",
        REFRESH_TOKEN: "/refresh-token",
        GET_STAFF_MEMBERS: "/get-staff",
        CURRENT_USER: "/me"
    },
    PRODUCT: {
        GET_ALL_PRODUCTS: "/all",
        CREATE_PRODUCT: "/create",
        DELETE_PRODUCT: "/delete/:id",
        UPDATE_PRODUCT: "/update/:id",
        GET_PRODUCTBY_ID: "/:id",
        GET_PRODUCTBY_CATEGORY: "/category/:categoryId",

        TOGGLE_LIKE_PRODUCT: "/toggle-like/:id",
        GET_LIKED_PRODUCTS: "/liked-products"
    },
    CATEGORY: {
        GET_ALL_CATEGORY: "/",
        CREATE_CATEGORY: "/create",
        DELETE_CATEGORY: "/delete/:id",
        UPDATE_CATEGORY: "/update/:id",
        GET_CATEGORYBY_ID: "/:id"
    },
    ORDER: {
        GET_ALL_ORDER: "/",
        CREATE_ORDER: "/create",
        DELETE_ORDER: "/delete/:id",
        UPDATE_ORDER: "/update/:id",
        GET_ORDERBY_ID: "/:id"
    }
};

export { API, ROUTE }