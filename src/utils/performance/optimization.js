// Performance optimization utilities
import { useCallback, useMemo, useRef, useEffect } from 'react';

// Debounce hook for performance optimization
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for performance optimization
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

// Virtual scrolling hook
export const useVirtualScrolling = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = useMemo(() => 
    Math.floor(scrollTop / itemHeight), [scrollTop, itemHeight]
  );
  
  const visibleEnd = useMemo(() => 
    Math.min(visibleStart + Math.ceil(containerHeight / itemHeight) + 1, items.length),
    [visibleStart, containerHeight, itemHeight, items.length]
  );

  const visibleItems = useMemo(() => 
    items.slice(visibleStart, visibleEnd).map((item, index) => ({
      ...item,
      index: visibleStart + index,
      top: (visibleStart + index) * itemHeight,
    })),
    [items, visibleStart, visibleEnd, itemHeight]
  );

  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    scrollTop,
    setScrollTop,
  };
};

// Image lazy loading with IntersectionObserver
export const useLazyImage = (src, placeholder) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    let observer;

    if (imgRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              setIsLoaded(true);
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '50px' }
      );

      observer.observe(imgRef.current);
    }

    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  return { imageSrc, isLoaded, imgRef };
};

// Memoized component helper
export const memo = (Component, propsAreEqual) => React.memo(Component, propsAreEqual);

// Performance monitoring
export const measurePerformance = (name, fn) => {
  return (...args) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    console.log(`${name} took ${end - start} milliseconds`);
    
    return result;
  };
};

// Bundle size optimization helper
export const dynamicImport = (moduleName) => {
  return import(/* webpackChunkName: "[request]" */ moduleName);
};