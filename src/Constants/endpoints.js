
const ROUTE = {
    USER_ROUTER: "/api/v1/user/",
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
        CURRENT_USER: ""
    },
    PRODUCT: {
        GET_ALL_PRODUCTS: "products",
        CREATE_PRODUCT: "create-prod",
        DELETE_PRODUCT: "delete-prod",
        UPDATE_PRODUCT: "update-prod"
    },
    CATEGORY: {
        GET_ALL_CATEGORY: "categories",
        CREATE_CATEGORY: "create-category",
        DELETE_CATEGORY: "delete-category",
        UPDATE_CATEGORY: "update-category"
    },
    ORDER: {
        GET_ALL_ORDER: "orders",
        CREATE_ORDER: "create-order",
        DELETE_ORDER: "delete-order",
        UPDATE_ORDER: "update-order"
    }
};

export { API, ROUTE }