// Basic Web Vitals reporting (no analytics)
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB, getINP }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getLCP(onPerfEntry);
      getFCP(onPerfEntry);
      getTTFB(onPerfEntry);
      if (getINP) {
        getINP(onPerfEntry);
      }
    });
  }
};

export default reportWebVitals;
