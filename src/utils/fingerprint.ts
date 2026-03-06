/**
 * Fingerprint Utility
 * Provides browser fingerprinting for user identification and deduplication
 * across all ecosystem sites
 * 
 * Usage:
 *   import { generateFingerprint, getFingerprintData } from '@successbrian/global-assets'
 */

export interface FingerprintData {
  fingerprint: string
  userAgent: string
  platform: string
  language: string
  screenResolution: string
  timezone: string
  cookiesEnabled: boolean
  doNotTrack: boolean
}

/**
 * Generate a unique browser fingerprint
 */
export const generateFingerprint = async (): Promise<string> => {
  try {
    const components = await getFingerprintComponents()
    return hashComponents(components)
  } catch (error) {
    console.error('Error generating fingerprint:', error)
    return generateFallbackFingerprint()
  }
}

/**
 * Get browser fingerprint components
 */
const getFingerprintComponents = async (): Promise<string[]> => {
  const components: string[] = []

  // User Agent
  components.push(navigator.userAgent)

  // Platform
  components.push(navigator.platform)

  // Language
  components.push(navigator.language)

  // Screen Resolution
  components.push(`${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`)

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone)

  // Hardware Concurrency
  if (navigator.hardwareConcurrency) {
    components.push(navigator.hardwareConcurrency.toString())
  }

  // Device Memory
  if ((navigator as any).deviceMemory) {
    components.push((navigator as any).deviceMemory.toString())
  }

  // Touch Support
  components.push('ontouchstart' in window ? 'true' : 'false')

  // WebGL Vendor
  const webglVendor = getWebGLVendor()
  if (webglVendor) {
    components.push(webglVendor)
  }

  return components
}

/**
 * Get WebGL vendor information
 */
const getWebGLVendor = (): string | null => {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    
    if (gl) {
      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        return `${vendor}|${renderer}`
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

/**
 * Hash fingerprint components using SHA-256
 */
const hashComponents = async (components: string[]): Promise<string> => {
  const data = components.join('|')
  
  try {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  } catch (error) {
    // Fallback to simple hash if crypto.subtle is not available
    return simpleHash(data)
  }
}

/**
 * Simple hash function as fallback
 */
const simpleHash = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}

/**
 * Generate a fallback fingerprint when crypto is not available
 */
const generateFallbackFingerprint = (): string => {
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    window.screen.width,
    window.screen.height
  ]
  return simpleHash(components.join('|'))
}

/**
 * Get complete fingerprint data
 */
export const getFingerprintData = async (): Promise<FingerprintData> => {
  const fingerprint = await generateFingerprint()
  
  return {
    fingerprint,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === '1'
  }
}

export default {
  generateFingerprint,
  getFingerprintData,
}
