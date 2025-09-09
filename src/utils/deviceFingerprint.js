// Device Fingerprinting Utility - Generate unique device identifiers
// This replaces MAC address tracking which is not available in browsers

export class DeviceFingerprint {
  
  // Generate a unique device fingerprint
  static generateFingerprint() {
    const fingerprint = {
      // Screen characteristics
      screen: `${window.screen.width}x${window.screen.height}`,
      availScreen: `${window.screen.availWidth}x${window.screen.availHeight}`,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
      
      // Browser/OS info
      userAgent: navigator.userAgent.substring(0, 150), // Truncate for storage
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages ? navigator.languages.slice(0, 3).join(',') : '',
      
      // Timezone and locale
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      
      // Hardware capabilities
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      deviceMemory: navigator.deviceMemory || 'unknown',
      
      // Additional browser features
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || 'unknown',
      
      // Canvas fingerprint (more unique)
      canvas: this.getCanvasFingerprint(),
      
      // WebGL fingerprint
      webgl: this.getWebGLFingerprint()
    };
    
    // Create hash of fingerprint
    const fingerprintString = JSON.stringify(fingerprint);
    return this.simpleHash(fingerprintString);
  }
  
  // Generate canvas fingerprint for uniqueness
  static getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Draw unique pattern
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('AmaPlayer Device ID 🏆', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Device Fingerprint', 4, 45);
      
      // Get canvas data
      return canvas.toDataURL().substring(0, 100); // Truncate for storage
    } catch (e) {
      return 'canvas_unavailable';
    }
  }
  
  // Generate WebGL fingerprint
  static getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return 'webgl_unavailable';
      
      return [
        gl.getParameter(gl.RENDERER) || '',
        gl.getParameter(gl.VENDOR) || '',
        gl.getParameter(gl.VERSION) || ''
      ].join('|').substring(0, 100);
    } catch (e) {
      return 'webgl_error';
    }
  }
  
  // Simple hash function for fingerprint
  static simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36); // Base 36 for shorter string
  }
  
  // Get or create persistent device ID
  static getDeviceId() {
    const STORAGE_KEY = 'amaplayer-device-id';
    const STORAGE_VERSION_KEY = 'amaplayer-device-version';
    const CURRENT_VERSION = '1.0';
    
    try {
      // Check if we have existing device ID with correct version
      const existingId = localStorage.getItem(STORAGE_KEY);
      const existingVersion = localStorage.getItem(STORAGE_VERSION_KEY);
      
      if (existingId && existingVersion === CURRENT_VERSION) {
        console.log('🔍 Using existing device ID:', existingId.substring(0, 8) + '...');
        return existingId;
      }
      
      // Generate new device ID combining fingerprint + random
      const fingerprint = this.generateFingerprint();
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      
      const deviceId = `device_${fingerprint}_${timestamp}_${random}`;
      
      // Store device ID and version
      localStorage.setItem(STORAGE_KEY, deviceId);
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
      
      console.log('🆕 Generated new device ID:', deviceId.substring(0, 8) + '...');
      return deviceId;
      
    } catch (e) {
      // Fallback if localStorage fails
      console.warn('localStorage unavailable, using session-only device ID');
      
      if (!window.tempDeviceId) {
        const fallbackFingerprint = this.generateFingerprint();
        window.tempDeviceId = `temp_${fallbackFingerprint}_${Date.now()}`;
      }
      
      return window.tempDeviceId;
    }
  }
  
  // Get device info for display/debugging
  static getDeviceInfo() {
    return {
      deviceId: this.getDeviceId(),
      fingerprint: this.generateFingerprint(),
      browser: this.getBrowserInfo(),
      system: this.getSystemInfo(),
      capabilities: this.getCapabilities()
    };
  }
  
  static getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    
    return {
      name: browser,
      userAgent: ua.substring(0, 100),
      language: navigator.language,
      platform: navigator.platform
    };
  }
  
  static getSystemInfo() {
    return {
      screen: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth
    };
  }
  
  static getCapabilities() {
    return {
      cookieEnabled: navigator.cookieEnabled,
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      canvas: !!document.createElement('canvas').getContext,
      webgl: !!(document.createElement('canvas').getContext('webgl') || 
                document.createElement('canvas').getContext('experimental-webgl'))
    };
  }
  
  // Reset device ID (for testing purposes)
  static resetDeviceId() {
    try {
      localStorage.removeItem('amaplayer-device-id');
      localStorage.removeItem('amaplayer-device-version');
      delete window.tempDeviceId;
      console.log('🔄 Device ID reset - new ID will be generated on next call');
    } catch (e) {
      console.warn('Failed to reset device ID:', e);
    }
  }
}

export default DeviceFingerprint;