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

  const getKeyCacheByTabIdx = (tabIdx: number) => {
    return `cache-${tabIdx}`;
  };

  const removeItem = (key: string) => {
    localStorage.removeItem(key);
  };

  return {
    setItem,
    getItem,
    removeItem,
    getKeyCacheByTabIdx,
  };
};

export default useStorage;
