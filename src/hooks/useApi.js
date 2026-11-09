import { useState, useCallback } from 'react'
import { API_CONFIG } from '../config/constants'
import { useApp } from '../contexts/AppContext'

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { addNotification } = useApp()

  const request = useCallback(async (endpoint, options = {}) => {
    setLoading(true)
    setError(null)

    try {
      const url = `${API_CONFIG.baseURL}${endpoint}`
      const config = {
        ...API_CONFIG.headers,
        ...options.headers
      }

      const response = await fetch(url, {
        ...options,
        headers: config,
        timeout: API_CONFIG.timeout
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      addNotification({
        type: 'error',
        title: 'API Error',
        message: err.message
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addNotification])

  const get = useCallback((endpoint) => request(endpoint), [request])
  
  const post = useCallback((endpoint, data) => 
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    }), [request])
  
  const put = useCallback((endpoint, data) => 
    request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    }), [request])
  
  const del = useCallback((endpoint) => 
    request(endpoint, { method: 'DELETE' }), [request])

  return { loading, error, get, post, put, delete: del }
}
