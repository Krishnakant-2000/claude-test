// CSS Cleanup Utility - Prevents CSS conflicts and cache issues

export const cleanupPageStyles = (pageName = 'unknown') => {
  console.log(`CSS CLEANUP: Ultra-aggressive cleanup for ${pageName} page`);
  
  // Remove all body classes that might interfere
  const bodyClassesToRemove = [
    'is-loading',
    'new-landing-page-loaded',
    'landingpage3d-loaded',
    'landing-page-active',
    'no-scroll',
    'overflow-hidden',
    'modal-open',
    'fixed',
    'loading-content',
    'styles-loaded',
    'page-loading',
    'auth-page',
    'home-page',
    'profile-page',
    'messages-page'
  ];
  
  bodyClassesToRemove.forEach(className => {
    document.body.classList.remove(className);
  });
  
  // Aggressive style removal
  document.body.removeAttribute('style');
  document.body.style.cssText = '';
  document.documentElement.removeAttribute('style');
  document.documentElement.style.cssText = '';
  
  // Force remove specific problematic CSS properties
  const elementsToClean = [document.body, document.documentElement];
  elementsToClean.forEach(element => {
    element.style.transform = '';
    element.style.position = '';
    element.style.overflow = '';
    element.style.height = '';
    element.style.width = '';
    element.style.margin = '';
    element.style.padding = '';
    element.style.background = '';
    element.style.fontSize = '';
    element.style.fontFamily = '';
    element.style.color = '';
    element.style.display = '';
    element.style.visibility = '';
    element.style.opacity = '';
  });
  
  // Remove problematic data attributes (but preserve data-theme for theme persistence)
  const attributesToRemove = [
    'data-page', 'data-loading', 'data-route',
    'data-navigation', 'data-component', 'data-state'
  ];
  
  attributesToRemove.forEach(attr => {
    document.body.removeAttribute(attr);
    document.documentElement.removeAttribute(attr);
  });
  
  console.log(`CSS CLEANUP: Ultra-aggressive cleanup completed for ${pageName}`);
};

// New: Force CSS recalculation and cache busting
export const bustCSSCache = () => {
  console.log('CSS CACHE BUST: Forcing style recalculation');
  
  // Force reflow by accessing layout properties
  const bodyHeight = document.body.offsetHeight;
  const htmlHeight = document.documentElement.offsetHeight;
  console.log('Cache bust: triggered reflow', bodyHeight, htmlHeight);
  
  // Add and remove a temporary class to force recalculation
  document.body.classList.add('css-cache-bust');
  requestAnimationFrame(() => {
    document.body.classList.remove('css-cache-bust');
    
    // Double-check by forcing another reflow
    requestAnimationFrame(() => {
      const finalHeight = document.body.offsetHeight;
      console.log('CSS CACHE BUST: Style recalculation completed', finalHeight);
    });
  });
};

// New: Complete page style reset with cache busting
export const resetPageStyles = (pageName = 'unknown') => {
  console.log(`STYLE RESET: Complete style reset for ${pageName}`);
  
  // Step 1: Clean up styles
  cleanupPageStyles(pageName);
  
  // Step 2: Bust CSS cache
  bustCSSCache();
  
  // Step 3: Set page-specific class after cleanup
  setTimeout(() => {
    if (pageName !== 'unknown') {
      document.body.classList.add(`${pageName}-page`);
    }
    console.log(`STYLE RESET: Complete reset finished for ${pageName}`);
  }, 100);
};

export const setPageBodyClass = (pageClass) => {
  // First clean up
  cleanupPageStyles();
  
  // Then set the new page class
  if (pageClass) {
    document.body.classList.add(pageClass);
  }
};

export const forceStyleRefresh = () => {
  // Force a style recalculation by toggling a temporary class
  document.body.classList.add('temp-refresh');
  requestAnimationFrame(() => {
    document.body.classList.remove('temp-refresh');
  });
};