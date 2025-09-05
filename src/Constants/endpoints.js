const ROUTE = {
    USER_ROUTER: "/api/v1/users",
    PRODUCT_ROUTER: "/api/v1/products",
    CATEGORY_ROUTER: "/api/v1/category",
    ORDER_ROUTER: "/api/v1/order",
    DASHBOARD_ROUTER: "/api/v1/dashboard",
    FEEDBACK_ROUTER: "/api/v1/feedback",
    BILLING_ROUTER: "/api/v1/billing",  
};

const API = {
    USER: {
        REGISTER: "/register",
        LOGIN: "/login",
        LOGOUT: '/logout',
        CHANGE_PASSWORD: "/change-password",
        UPDATE_PROFILE: "/update-profile",
        UPDATE_AVATAR: "/update-avatar",
        REFRESH_TOKEN: "/refresh-token",
        CURRENT_USER: "/me",

        GET_SERVANT_STAFF: "/get-servant-staff",
        GET_STAFF_MEMBERS: "/get-staff",
        CREATE_STAFF: "/create-staff",
        DELETE_STAFF: "/delete-staff/:id",
        UPDATE_STAFF: "/update-staff/:id",
    },

    PRODUCT: {
        GET_ALL_PRODUCTS: "/all",
        CREATE_PRODUCT: "/create",
        DELETE_PRODUCT: "/delete/:id",
        UPDATE_PRODUCT: "/update/:id",
        GET_PRODUCTBY_CATEGORY: "/category/:categoryId",

        TOGGLE_LIKE_PRODUCT: "/toggle-like/:id",
        GET_LIKED_PRODUCTS: "/liked-products",

        GET_PRODUCTBY_ID: "/:id",
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
        GET_ORDERBY_ID: "/:id",

        CANCEL_ORDER: "/cancel/:id",
        UPDATE_ORDER_STATUS_BY_STAFF: "/update-status/:id",
        UPDATE_ORDER_STATUS_BY_CUSTOMER: "/update-status-customer/:id"
    },


    FEEDBACK: {
        ADD_FEEDBACK: "/",
        GET_ALL_FEEDBACK: "/all-feedback",
        DELETE_FEEDBACK: "/delete/:id",
        GET_FEEDBACK_ID: "/:id",
    },


    DASHBOARD: {
        GET_DASHBOARD_DATA: "/",
        GET_DASHBOARD_ORDERS: "/orders"
    },

    BILLING: {
        GET_BILLING_DATA: "/bills",
        GET_INVOICE_DETAILS: "/invoice/:orderId",
        GET_BILLING_SUMMARY: "/summary"
    }
};


export { API, ROUTE };
