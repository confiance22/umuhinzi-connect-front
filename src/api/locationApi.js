import axiosInstance from './axiosInstance'
import { API_ENDPOINTS } from '../constants/apiEndpoints'

const unwrapApiResult = (response) => {
  if (response?.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data
  }
  return response.data
}

const LOCATIONS_CACHE_VERSION = '20261031'

const getOptions = async (endpoint, params) => {
  try {
    const response = await axiosInstance.get(endpoint, {
      params: { ...params, _v: LOCATIONS_CACHE_VERSION }
    })
    return unwrapApiResult(response) || []
  } catch (error) {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      'Could not load locations. Check your connection and try again.'
    throw new Error(message)
  }
}

export const locationApi = {
  getProvinces: () => getOptions(API_ENDPOINTS.LOCATIONS.PROVINCES),
  getDistricts: (province) => getOptions(API_ENDPOINTS.LOCATIONS.DISTRICTS, { province }),
  getSectors: (district) => getOptions(API_ENDPOINTS.LOCATIONS.SECTORS, { district }),
  getCells: (sector) => getOptions(API_ENDPOINTS.LOCATIONS.CELLS, { sector }),
  getVillages: (cell) => getOptions(API_ENDPOINTS.LOCATIONS.VILLAGES, { cell })
}

export default locationApi
