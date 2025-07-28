import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { getSummary, getTags, getEmbedding } from './ai';

const NOTES_COLLECTION = 'notes';

/**
 * Get all notes for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of notes
 */
export async function getUserNotes(userId) {
  try {
    const notesQuery = query(
      collection(db, NOTES_COLLECTION),
      where('ownerId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(notesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    // Fallback to localStorage
    return getNotesFromLocalStorage(userId);
  }
}

/**
 * Get a single note by ID
 * @param {string} noteId - Note ID
 * @param {string} userId - User ID (for security)
 * @returns {Promise<Object|null>} - Note object or null
 */
export async function getNote(noteId, userId) {
  try {
    const noteDoc = await getDoc(doc(db, NOTES_COLLECTION, noteId));
    
    if (!noteDoc.exists()) {
      return null;
    }
    
    const noteData = noteDoc.data();
    
    // Check if user owns the note or has access
    if (noteData.ownerId !== userId && !noteData.sharedWith?.includes(userId)) {
      throw new Error('Access denied');
    }
    
    return {
      id: noteDoc.id,
      ...noteData
    };
  } catch (error) {
    console.error('Failed to fetch note:', error);
    return null;
  }
}

/**
 * Create a new note
 * @param {Object} noteData - Note data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Created note
 */
export async function createNote(noteData, userId) {
  try {
    // Generate AI enhancements
    const [summary, tags, embedding] = await Promise.all([
      noteData.content ? getSummary(noteData.content) : '',
      noteData.content ? getTags(noteData.content) : [],
      noteData.content ? getEmbedding(noteData.content) : null
    ]);

    const newNote = {
      ...noteData,
      ownerId: userId,
      summary,
      tags: [...(noteData.tags || []), ...tags].filter((tag, index, arr) => arr.indexOf(tag) === index), // Remove duplicates
      embedding,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      versions: [{
        title: noteData.title,
        content: noteData.content,
        timestamp: new Date().toISOString()
      }]
    };

    const docRef = await addDoc(collection(db, NOTES_COLLECTION), newNote);
    
    return {
      id: docRef.id,
      ...newNote,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to create note:', error);
    // Fallback to localStorage
    return createNoteInLocalStorage(noteData, userId);
  }
}

/**
 * Update an existing note
 * @param {string} noteId - Note ID
 * @param {Object} updates - Updates to apply
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Updated note
 */
export async function updateNote(noteId, updates, userId) {
  try {
    // Get current note for versioning
    const currentNote = await getNote(noteId, userId);
    if (!currentNote) {
      throw new Error('Note not found');
    }

    // Generate AI enhancements if content changed
    let aiUpdates = {};
    if (updates.content && updates.content !== currentNote.content) {
      const [summary, tags, embedding] = await Promise.all([
        getSummary(updates.content),
        getTags(updates.content),
        getEmbedding(updates.content)
      ]);

      aiUpdates = {
        summary,
        tags: [...(updates.tags || currentNote.tags || []), ...tags].filter((tag, index, arr) => arr.indexOf(tag) === index),
        embedding
      };
    }

    // Add version to history
    const newVersion = {
      title: updates.title || currentNote.title,
      content: updates.content || currentNote.content,
      timestamp: new Date().toISOString()
    };

    const updatedNote = {
      ...updates,
      ...aiUpdates,
      updatedAt: serverTimestamp(),
      versions: [...(currentNote.versions || []), newVersion]
    };

    await updateDoc(doc(db, NOTES_COLLECTION, noteId), updatedNote);

    return {
      id: noteId,
      ...currentNote,
      ...updatedNote,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to update note:', error);
    // Fallback to localStorage
    return updateNoteInLocalStorage(noteId, updates, userId);
  }
}

/**
 * Delete a note
 * @param {string} noteId - Note ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteNote(noteId, userId) {
  try {
    // Verify ownership
    const note = await getNote(noteId, userId);
    if (!note) {
      throw new Error('Note not found or access denied');
    }

    await deleteDoc(doc(db, NOTES_COLLECTION, noteId));
    return true;
  } catch (error) {
    console.error('Failed to delete note:', error);
    // Fallback to localStorage
    return deleteNoteFromLocalStorage(noteId, userId);
  }
}

/**
 * Share a note with other users
 * @param {string} noteId - Note ID
 * @param {string[]} userEmails - Array of user emails to share with
 * @param {string} userId - Owner user ID
 * @returns {Promise<boolean>} - Success status
 */
export async function shareNote(noteId, userEmails, userId) {
  try {
    const note = await getNote(noteId, userId);
    if (!note || note.ownerId !== userId) {
      throw new Error('Note not found or access denied');
    }

    await updateDoc(doc(db, NOTES_COLLECTION, noteId), {
      sharedWith: userEmails,
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Failed to share note:', error);
    return false;
  }
}

// LocalStorage fallback functions
function getNotesFromLocalStorage(userId) {
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  return notes.filter(note => note.ownerId === userId);
}

function createNoteInLocalStorage(noteData, userId) {
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  const newNote = {
    id: Date.now().toString(),
    ...noteData,
    ownerId: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    versions: [{
      title: noteData.title,
      content: noteData.content,
      timestamp: new Date().toISOString()
    }]
  };
  
  notes.push(newNote);
  localStorage.setItem('notes', JSON.stringify(notes));
  return newNote;
}

function updateNoteInLocalStorage(noteId, updates, userId) {
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  const noteIndex = notes.findIndex(note => note.id === noteId && note.ownerId === userId);
  
  if (noteIndex === -1) {
    throw new Error('Note not found');
  }

  const currentNote = notes[noteIndex];
  const newVersion = {
    title: updates.title || currentNote.title,
    content: updates.content || currentNote.content,
    timestamp: new Date().toISOString()
  };

  notes[noteIndex] = {
    ...currentNote,
    ...updates,
    updatedAt: new Date().toISOString(),
    versions: [...(currentNote.versions || []), newVersion]
  };

  localStorage.setItem('notes', JSON.stringify(notes));
  return notes[noteIndex];
}

function deleteNoteFromLocalStorage(noteId, userId) {
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  const filteredNotes = notes.filter(note => !(note.id === noteId && note.ownerId === userId));
  
  if (filteredNotes.length === notes.length) {
    return false; // Note not found
  }

  localStorage.setItem('notes', JSON.stringify(filteredNotes));
  return true;
}
