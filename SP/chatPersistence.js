import { 
  auth, 
  db, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp
} from './firebase.js';

// Collection references
const CHAT_SESSIONS_COLLECTION = 'chatSessions';
const CHAT_MESSAGES_COLLECTION = 'chatMessages';

/**
 * Saves a chat session to Firestore
 * @param {string} sessionId - The local session ID
 * @param {string} sessionName - The display name of the session
 * @param {Date} createdAt - When the session was created
 * @returns {Promise<string>} - The Firestore document ID
 */
export async function saveChatSession(sessionId, sessionName) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return null;
    }
    
    // Check if a session with this ID already exists for this user
    const sessionsRef = collection(db, CHAT_SESSIONS_COLLECTION);
    const q = query(
      sessionsRef, 
      where('userId', '==', user.uid),
      where('localSessionId', '==', sessionId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Session already exists, return the existing ID
      return querySnapshot.docs[0].id;
    }
    
    // Create a new session
    const docRef = await addDoc(collection(db, CHAT_SESSIONS_COLLECTION), {
      userId: user.uid,
      localSessionId: sessionId,
      name: sessionName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving chat session:', error);
    return null;
  }
}

/**
 * Saves a chat message to Firestore
 * @param {string} firestoreSessionId - The Firestore session ID
 * @param {string} from - Who sent the message ('user' or 'bot')
 * @param {string} text - The message text
 * @returns {Promise<string>} - The Firestore document ID
 */
export async function saveChatMessage(firestoreSessionId, from, text) {
  try {
    if (!firestoreSessionId) {
      console.error('No session ID provided');
      return null;
    }
    
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return null;
    }
    
    // Add the message
    const docRef = await addDoc(collection(db, CHAT_MESSAGES_COLLECTION), {
      sessionId: firestoreSessionId,
      userId: user.uid,
      from: from,
      text: text,
      createdAt: serverTimestamp()
    });
    
    // Update the session's updatedAt timestamp
    const sessionRef = doc(db, CHAT_SESSIONS_COLLECTION, firestoreSessionId);
    await updateDoc(sessionRef, {
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving chat message:', error);
    return null;
  }
}

/**
 * Loads all chat sessions for the current user
 * @returns {Promise<Array>} - Array of chat sessions
 */
export async function loadChatSessions() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return [];
    }
    
    const sessionsRef = collection(db, CHAT_SESSIONS_COLLECTION);
    const q = query(
      sessionsRef, 
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );
    
    try {
      const querySnapshot = await getDocs(q);
      const sessions = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          localId: data.localSessionId,
          name: data.name,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      return sessions;
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      // If there's a permissions error, return an empty array
      if (error.code === 'permission-denied') {
        console.log('Permission denied. User may need to verify their email first.');
        return [];
      }
      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error('Error in loadChatSessions:', error);
    return [];
  }
}

/**
 * Loads all messages for a specific chat session
 * @param {string} firestoreSessionId - The Firestore session ID
 * @returns {Promise<Array>} - Array of chat messages
 */
export async function loadChatMessages(firestoreSessionId) {
  try {
    if (!firestoreSessionId) {
      console.error('No session ID provided');
      return [];
    }
    
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return [];
    }
    
    // Use a simpler query without complex ordering that may require a composite index
    const messagesRef = collection(db, CHAT_MESSAGES_COLLECTION);
    const q = query(
      messagesRef, 
      where('sessionId', '==', firestoreSessionId),
      where('userId', '==', user.uid)
      // Removed the orderBy to avoid needing a composite index
    );
    
    const querySnapshot = await getDocs(q);
    const messages = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        from: data.from,
        text: data.text,
        createdAt: data.createdAt?.toDate() || new Date()
      });
    });
    
    // Sort messages by createdAt in JavaScript instead of Firestore query
    messages.sort((a, b) => a.createdAt - b.createdAt);
    
    return messages;
  } catch (error) {
    console.error('Error loading chat messages:', error);
    return [];
  }
}

/**
 * Deletes a chat session and all its messages
 * @param {string} firestoreSessionId - The Firestore session ID
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteChatSession(firestoreSessionId) {
  try {
    if (!firestoreSessionId) {
      console.error('No session ID provided');
      return false;
    }
    
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return false;
    }
    
    // Delete all messages in the session
    const messagesRef = collection(db, CHAT_MESSAGES_COLLECTION);
    const q = query(
      messagesRef, 
      where('sessionId', '==', firestoreSessionId),
      where('userId', '==', user.uid)
    );
    
    const querySnapshot = await getDocs(q);
    
    const deletePromises = [];
    querySnapshot.forEach((document) => {
      deletePromises.push(deleteDoc(doc(db, CHAT_MESSAGES_COLLECTION, document.id)));
    });
    
    await Promise.all(deletePromises);
    
    // Delete the session itself
    await deleteDoc(doc(db, CHAT_SESSIONS_COLLECTION, firestoreSessionId));
    
    return true;
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return false;
  }
}

/**
 * Renames a chat session
 * @param {string} firestoreSessionId - The Firestore session ID
 * @param {string} newName - The new session name
 * @returns {Promise<boolean>} - Success status
 */
export async function renameChatSession(firestoreSessionId, newName) {
  try {
    if (!firestoreSessionId) {
      console.error('No session ID provided');
      return false;
    }
    
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return false;
    }
    
    // Update the session name
    const sessionRef = doc(db, CHAT_SESSIONS_COLLECTION, firestoreSessionId);
    await updateDoc(sessionRef, {
      name: newName,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error renaming chat session:', error);
    return false;
  }
} 