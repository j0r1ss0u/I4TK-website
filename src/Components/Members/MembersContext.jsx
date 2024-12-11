import React, { createContext, useState, useContext, useEffect } from 'react';
import { MEMBERS_DATA } from "../../data/members";

const MembersContext = createContext();

export const MembersProvider = ({ children }) => {
  const [members, setMembers] = useState(MEMBERS_DATA); // Initialisation directe avec MEMBERS_DATA

  useEffect(() => {
    console.log("Nombre total de membres chargés:", members.length);

    // Sauvegarder dans localStorage si nécessaire
    try {
      const savedMembers = localStorage.getItem('members');
      if (!savedMembers) {
        localStorage.setItem('members', JSON.stringify(MEMBERS_DATA));
      }
    } catch (error) {
      console.error('Erreur avec localStorage:', error);
    }
  }, []);

  const updateMembers = (newMembers) => {
    console.log('Mise à jour des membres:', newMembers.length);
    setMembers(newMembers);
    try {
      localStorage.setItem('members', JSON.stringify(newMembers));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // Log de debug
  console.log('Rendu du Provider avec', members.length, 'membres');

  return (
    <MembersContext.Provider value={{ members, updateMembers }}>
      {children}
    </MembersContext.Provider>
  );
};

export const useMembers = () => {
  const context = useContext(MembersContext);
  if (!context) {
    throw new Error("useMembers doit être utilisé à l'intérieur du MembersProvider");
  }

  // Log de debug
  console.log('useMembers appelé, nombre de membres:', context.members.length);

  return context;
};

export default MembersContext;