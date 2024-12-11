
import { collection, getDocs, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import fs from 'fs';

export const createBackup = async (description = '') => {
  try {
    const backupData = {
      projects: [],
      members: [],
      documents: [],
      timestamp: new Date().toISOString(),
      description
    };

    // Backup projects
    const projectsSnapshot = await getDocs(collection(db, 'projects'));
    projectsSnapshot.forEach(doc => {
      backupData.projects.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Backup members
    const membersSnapshot = await getDocs(collection(db, 'members'));
    membersSnapshot.forEach(doc => {
      backupData.members.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Backup documents
    const documentsSnapshot = await getDocs(collection(db, 'documents'));
    documentsSnapshot.forEach(doc => {
      backupData.documents.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Create backup directory if it doesn't exist
    if (!fs.existsSync('./backups')) {
      fs.mkdirSync('./backups');
    }

    // Create backup file
    const backupFileName = `backups/backup_${Date.now()}.json`;
    fs.writeFileSync(backupFileName, JSON.stringify(backupData, null, 2));

    // Save restore point in Firebase
    await addDoc(collection(db, 'restorePoints'), {
      timestamp: new Date(),
      description,
      filename: backupFileName,
      data: backupData
    });

    return backupFileName;
  } catch (error) {
    console.error('Backup error:', error);
    throw error;
  }
};

export const restoreFromPoint = async (restorePointId) => {
  try {
    const batch = writeBatch(db);

    // Get restore point data
    const restorePointRef = doc(db, 'restorePoints', restorePointId);
    const restorePoint = await getDocs(restorePointRef);

    if (!restorePoint.exists()) {
      throw new Error('Restore point not found');
    }

    const backupData = restorePoint.data();

    // Restore projects
    backupData.projects.forEach(project => {
      const ref = doc(db, 'projects', project.id);
      batch.set(ref, project);
    });

    // Restore members
    backupData.members.forEach(member => {
      const ref = doc(db, 'members', member.id);
      batch.set(ref, member);
    });

    // Restore documents
    backupData.documents.forEach(document => {
      const ref = doc(db, 'documents', document.id);
      batch.set(ref, document);
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Restore error:', error);
    throw error;
  }
};
