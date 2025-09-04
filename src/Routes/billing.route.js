import express from 'express';
import { getBills, getInvoiceDetails, getBillingSummary } from '../Controllers/billing.controller.js';
import { API } from '../Constants/endpoints.js';

const router = express.Router();

router.get(API.BILLING.GET_BILLING_DATA, getBills);
router.get(API.BILLING.GET_INVOICE_DETAILS, getInvoiceDetails);
router.get(API.BILLING.GET_BILLING_SUMMARY, getBillingSummary);

export default router;

