// MembersContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { membersService } from "../../services/membersService";

const MembersContext = createContext();

export const MembersProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await membersService.getAllMembers();
      setMembers(data);
    } catch (err) {
      console.error('Error loading members:', err);
      setError('Failed to load members. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Optimisation : mise à jour locale du state sans rechargement
  const updateMember = async (numericId, memberData) => {
    try {
      setError(null);
      const updatedMember = await membersService.updateMember(numericId, memberData);

      // Mise à jour locale du state
      setMembers(prevMembers => 
        prevMembers.map(member => 
          member.id === numericId 
            ? { ...member, ...updatedMember }
            : member
        )
      );

      return updatedMember;
    } catch (err) {
      console.error('Error updating member:', err);
      setError('Failed to update member. Please try again.');
      throw err;
    }
  };

  // Optimisation : mise à jour groupée
  const updateMembers = async (updates) => {
    try {
      setError(null);

      // Traiter toutes les mises à jour en parallèle
      const updatePromises = updates.map(({ id, data }) => 
        membersService.updateMember(id, data)
      );

      const updatedMembers = await Promise.all(updatePromises);

      // Une seule mise à jour du state pour toutes les modifications
      setMembers(prevMembers => {
        const updatedMembersMap = new Map(
          updatedMembers.map(member => [member.id, member])
        );

        return prevMembers.map(member => 
          updatedMembersMap.has(member.id)
            ? { ...member, ...updatedMembersMap.get(member.id) }
            : member
        );
      });

      return updatedMembers;
    } catch (err) {
      console.error('Error updating members:', err);
      setError('Failed to update members. Please try again.');
      throw err;
    }
  };

  return (
    <MembersContext.Provider 
      value={{ 
        members, 
        updateMember,
        updateMembers, // Nouvelle méthode pour les mises à jour groupées
        reloadMembers: loadMembers,
        isLoading, 
        error 
      }}
    >
      {children}
    </MembersContext.Provider>
  );
};

export const useMembers = () => {
  const context = useContext(MembersContext);
  if (!context) {
    throw new Error("useMembers must be used within MembersProvider");
  }
  return context;
};

export default MembersContext;