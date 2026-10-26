import axiosInstance from './axiosInstance'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

const unwrapApiResult = (response) => {
  if (response?.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data
  }
  return response.data
}

const getApiErrorMessage = (error, fallbackMessage) => {
  const body = error?.response?.data
  if (body?.message) return body.message
  if (body?.error) return body.error
  if (body?.errors && typeof body.errors === 'object') {
    const first = Object.values(body.errors)[0]
    if (typeof first === 'string' && first.trim()) return first
  }
  if (!error?.response) return 'You appear to be offline. Check your connection and try again.'
  return error?.message || fallbackMessage
}

const run = async (request, fallback) => {
  try {
    return unwrapApiResult(await request())
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallback))
  }
}

export const harvestApi = {
  list: (params = {}) =>
    run(() => axiosInstance.get(API_ENDPOINTS.HARVESTS.BASE, { params }), 'Could not load harvests'),

  get: (id) =>
    run(() => axiosInstance.get(API_ENDPOINTS.HARVESTS.DETAIL(id)), 'Could not load this harvest'),

  overview: () =>
    run(() => axiosInstance.get(API_ENDPOINTS.HARVESTS.OVERVIEW), 'Could not load your overview'),

  report: (params = {}) =>
    run(
      () => axiosInstance.get(API_ENDPOINTS.HARVESTS.REPORT, { params }),
      'Could not load your report'
    ),

  create: (payload) =>
    run(() => axiosInstance.post(API_ENDPOINTS.HARVESTS.BASE, payload), 'Could not save harvest'),

  update: (id, payload) =>
    run(
      () => axiosInstance.put(API_ENDPOINTS.HARVESTS.DETAIL(id), payload),
      'Could not update harvest'
    ),

  remove: (id) =>
    run(() => axiosInstance.delete(API_ENDPOINTS.HARVESTS.DETAIL(id)), 'Could not delete harvest')
}

export default harvestApi
