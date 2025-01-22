// tests/testMembersInit.js
import { db } from '../services/firebase';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { membersService } from '../services/membersService';
import { MEMBERS_DATA } from '../data/members';

const clearCollection = async () => {
  console.log('Nettoyage de la collection members...');
  const membersRef = collection(db, 'members');
  const snapshot = await getDocs(membersRef);

  const deletePromises = snapshot.docs.map(doc => 
    deleteDoc(doc.ref)
  );

  await Promise.all(deletePromises);
  console.log(`Collection members nettoyée (${snapshot.docs.length} documents supprimés)`);
};

const verifyFirestoreData = async () => {
  const membersRef = collection(db, 'members');
  const snapshot = await getDocs(membersRef);
  const members = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    members.push({
      id: doc.id,
      ...data
    });
  });

  console.log('Vérification détaillée des données Firestore:');
  console.log(`- Nombre total de documents: ${members.length}`);
  if (members.length > 0) {
    console.log('- Premier membre:', members[0]);
    console.log('- Dernier membre:', members[members.length - 1]);
  }

  return members;
};

const testInitialization = async () => {
  try {
    console.log('=== Test d\'initialisation avec les données réelles ===');
    console.log(`Nombre de membres dans MEMBERS_DATA: ${MEMBERS_DATA.length}`);

    // 1. Nettoyage
    await clearCollection();

    // 2. Vérification après nettoyage
    const membersAfterClear = await verifyFirestoreData();
    console.log(`Après nettoyage: ${membersAfterClear.length} membres`);

    // 3. Initialisation
    console.log('\nInitialisation de la collection members...');
    await membersService.initializeMembersCollection();

    // 4. Vérification après initialisation
    const membersAfterInit = await verifyFirestoreData();
    console.log(`Après initialisation: ${membersAfterInit.length} membres`);

    // 5. Vérification des membres visibles
    const visibleMembers = await membersService.getVisibleMembers();

    return {
      originalCount: MEMBERS_DATA.length,
      firestoreCount: membersAfterInit.length,
      visibleCount: visibleMembers.length,
      sample: membersAfterInit[0]
    };
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    throw error;
  }
};

export const runInitTest = async () => {
  try {
    const results = await testInitialization();
    console.log('\n=== Résultats des tests ===');
    console.log(`Membres originaux: ${results.originalCount}`);
    console.log(`Membres dans Firestore: ${results.firestoreCount}`);
    console.log(`Membres visibles: ${results.visibleCount}`);
    console.log('Exemple de membre:', results.sample);
    return results;
  } catch (error) {
    console.error('Test échoué:', error);
    return null;
  }
};