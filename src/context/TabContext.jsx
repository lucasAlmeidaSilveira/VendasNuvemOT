import React, { createContext, useState, useContext } from 'react';

export const TabContext = createContext();

export const useTab = () => useContext(TabContext);

export const TabProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <TabContext.Provider value={{ activeTab, handleTabChange }}>
      {children}
    </TabContext.Provider>
  );
};
