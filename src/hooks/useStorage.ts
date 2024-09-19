const useStorage = () => {
  const setItem = (key: string, value: Object) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const getItem = <T>(key: string) => {
    try {
      return JSON.parse(localStorage.getItem(key)) as T;
    } catch (error) {
      return null;
    }
  };

  const getKeyCacheByTabId = (tabId: string) => {
    return `cache-${tabId}`;
  };

  const removeItem = (key: string) => {
    localStorage.removeItem(key);
  };

  return {
    setItem,
    getItem,
    removeItem,
    getKeyCacheByTabId,
  };
};

export default useStorage;
