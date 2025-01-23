import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp,
  writeBatch,
  getDoc,
  limit
} from 'firebase/firestore';


// =============== MEMBERS MANAGEMENT SERVICE ===============
export const membersService = {
  // Cache pour les IDs
  _idCache: new Map(),

  // Méthode privée pour mettre à jour le cache
  _updateCache(members) {
    members.forEach(member => {
      if (member.id) {
        this._idCache.set(member.id, member.firestoreId);
      }
    });
  },

  // Méthode privée pour trouver un FirestoreId
  async _findFirestoreId(numericId) {
    // Vérifier d'abord le cache
    const cachedId = this._idCache.get(numericId);
    if (cachedId) {
      return cachedId;
    }

    // Sinon faire une requête unique
    const q = query(
      collection(db, 'members'),
      where('id', '==', parseInt(numericId)),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const firestoreId = snapshot.docs[0].id;
      this._idCache.set(numericId, firestoreId);
      return firestoreId;
    }

    return null;
  },

  // Initialiser la collection avec les données par défaut
  async initializeMembersCollection() {
    try {
      console.log('Checking if members collection needs initialization...');
      const membersRef = collection(db, 'members');
      const snapshot = await getDocs(membersRef);

      if (snapshot.empty) {
        console.log('Initializing members collection with default data');
        const batch = writeBatch(db);

        for (const member of MEMBERS_DATA) {
          const memberRef = doc(membersRef);
          batch.set(memberRef, {
            ...member,
            id: member.id,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        await batch.commit();
        console.log('Members collection initialized successfully');
      } else {
        console.log('Members collection already contains data');
      }
    } catch (error) {
      console.error('Error initializing members collection:', error);
      throw new Error(`Failed to initialize members: ${error.message}`);
    }
  },

  // Récupérer tous les membres
  async getAllMembers() {
    try {
      const snapshot = await getDocs(collection(db, 'members'));
      const members = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: data.id,
          firestoreId: doc.id
        };
      });

      // Mettre à jour le cache avec les nouvelles données
      this._updateCache(members);
      return members;
    } catch (error) {
      throw new Error(`Failed to get members: ${error.message}`);
    }
  },

  // Récupérer les membres visibles
  async getVisibleMembers() {
    try {
      console.log('Fetching visible members');
      const membersRef = collection(db, 'members');
      const q = query(membersRef, where('isVisible', '==', true));
      const snapshot = await getDocs(q);
      const members = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const member = {
          ...data,
          id: data.id,
          firestoreId: doc.id,
          createdAt: data.createdAt ?? null,
          updatedAt: data.updatedAt ?? null
        };
        members.push(member);
        this._idCache.set(member.id, doc.id); // Mise à jour du cache
      });

      console.log(`Found ${members.length} visible members`);
      return members;
    } catch (error) {
      console.error('Error getting visible members:', error);
      throw new Error(`Failed to get visible members: ${error.message}`);
    }
  },

  // Ajouter un nouveau membre
  async addMember(memberData) {
    if (!memberData.name || !memberData.category) {
      throw new Error('Invalid member data: name and category are required');
    }

    try {
      console.log('Adding new member to Firestore:', memberData);
      const membersRef = collection(db, 'members');

      // Générer un nouvel ID numérique si nécessaire
      const snapshot = await getDocs(membersRef);
      const maxId = Math.max(0, ...snapshot.docs.map(doc => doc.data().id || 0));
      const nextId = maxId + 1;

      const newMember = {
        ...memberData,
        id: nextId,
        isVisible: memberData.isVisible ?? true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(membersRef, newMember);

      // Mettre à jour le cache
      this._idCache.set(nextId, docRef.id);

      console.log('Member added successfully with ID:', docRef.id);
      return {
        ...newMember,
        id: nextId,
        firestoreId: docRef.id
      };
    } catch (error) {
      console.error('Error adding member:', error);
      throw new Error(`Failed to add member: ${error.message}`);
    }
  },

  // Mettre à jour un membre
  async updateMember(numericId, memberData) {
    try {
      console.log('Attempting to update member with ID:', numericId);

      // Utiliser le cache ou faire une requête unique
      const firestoreId = await this._findFirestoreId(numericId);
      if (!firestoreId) {
        throw new Error(`Member with ID ${numericId} not found`);
      }

      const updateData = {
        ...memberData,
        id: numericId,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'members', firestoreId), updateData);
      return { 
        ...updateData,
        firestoreId
      };
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  },

  // Récupérer les membres par catégorie
  async getMembersByCategory(category) {
    if (!category) {
      throw new Error('Category is required');
    }

    try {
      console.log('Fetching members by category:', category);
      const membersRef = collection(db, 'members');
      const q = query(membersRef, where('category', '==', category));
      const snapshot = await getDocs(q);
      const members = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const member = {
          ...data,
          id: data.id,
          firestoreId: doc.id,
          createdAt: data.createdAt ?? null,
          updatedAt: data.updatedAt ?? null
        };
        members.push(member);
        this._idCache.set(member.id, doc.id); // Mise à jour du cache
      });

      console.log(`Found ${members.length} members in category ${category}`);
      return members;
    } catch (error) {
      console.error('Error getting members by category:', error);
      throw new Error(`Failed to get members by category: ${error.message}`);
    }
  }
};