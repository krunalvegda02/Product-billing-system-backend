const ROUTE = {
    USER_ROUTER: "/api/v1/users/",
    PRODUCT_ROUTER: "/api/v1/products/",
    CATEGORY_ROUTER: "/api/v1/category/"
}


const API = {
    USER: {
        REGISTER: "register",
        LOGIN: "login",
        LOGOUT: 'logout',
        CHANGE_PASSWORD: "change-password",
        UPDATE_PROFILE: "update-profile",
        UPDATE_AVATAR: "update-avatar",
        REFRESH_TOKEN: "refresh-token",
        CURRENT_USER: "me"
    },
    PRODUCT: {
        GET_ALL_PRODUCTS: "",
        CREATE_PRODUCT: "create-prod",
        DELETE_PRODUCT: "delete-prod/:id",
        UPDATE_PRODUCT: "update-prod/:id",
        GET_PRODUCTBY_ID: ":id"
    },
    CATEGORY: {
        GET_ALL_CATEGORY: "",
        CREATE_CATEGORY: "create-category",
        DELETE_CATEGORY: "delete-category/:id",
        UPDATE_CATEGORY: "update-category/:id",
        GET_CATEGORYBY_ID: ":id"

    },
    ORDER: {
        GET_ALL_ORDER: "",
        CREATE_ORDER: "create-order",
        DELETE_ORDER: "delete-order/:id",
        UPDATE_ORDER: "update-order/:id"
    }
};

export { API, ROUTE }