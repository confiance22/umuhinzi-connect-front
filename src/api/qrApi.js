/**
 * qrApi.js — QR label generation, scanned-code lookup and label printing.
 * The scan flow: camera decodes a QR payload → resolveScannedCode → product
 * (or null). Everything is backed by the live StockRwa API.
 */
import axiosInstance from './axiosInstance'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

export const qrApi = {
  async resolveScannedCode(payload) {
    const response = await axiosInstance.post(API_ENDPOINTS.QR.SCAN_LOOKUP, { payload })
    return response?.data?.product ?? response?.data ?? null
  },

  async getLabel(productId) {
    const response = await axiosInstance.get(API_ENDPOINTS.QR.LABEL(productId))
    return response?.data ?? null
  },

  async generateBatch(productIds) {
    const response = await axiosInstance.post(API_ENDPOINTS.QR.LABELS_BATCH, { productIds })
    return response?.data ?? null
  },
}

export default qrApi