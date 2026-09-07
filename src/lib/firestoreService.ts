import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { ConversationStarter, Scrut, User } from '@/types';

export async function createFirestoreConversation(input: {
  userId: string;
  user: User;
  body: string;
  topic: string;
  type?: 'question' | 'statement' | 'open';
  isPlatform?: boolean;
}): Promise<ConversationStarter> {
  const convId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const now = new Date().toISOString();
  const convData = {
    id: convId,
    user_id: input.userId,
    body: input.body.trim(),
    topic: input.topic,
    type: input.type || 'question',
    is_platform: Boolean(input.isPlatform),
    scrut_count: 0,
    country_count: 1,
    circulation_score: 0,
    created_at: now,
  };

  try {
    await setDoc(doc(db, 'conversations', convId), convData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `conversations/${convId}`);
  }

  return {
    ...convData,
    user: input.user,
  };
}

export async function fetchFirestoreConversations(filterType?: string): Promise<ConversationStarter[]> {
  try {
    const collRef = collection(db, 'conversations');
    const q = filterType
      ? query(collRef, where('type', '==', filterType), orderBy('created_at', 'desc'), limit(50))
      : query(collRef, orderBy('created_at', 'desc'), limit(50));

    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as ConversationStarter;
      return {
        ...data,
        id: d.id,
      };
    });
  } catch (error) {
    console.warn('Could not query Firestore conversations:', error);
    return [];
  }
}

export async function createFirestoreScrut(input: {
  userId: string;
  user: User;
  conversationId?: string | null;
  type: 'voice' | 'text' | 'voice_text';
  text?: string;
  audioUrl?: string;
  audioDuration?: number;
  position?: 'agree' | 'unsure' | 'disagree' | null;
}): Promise<Scrut> {
  const scrutId = 'scrut_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const now = new Date().toISOString();
  const data = {
    id: scrutId,
    user_id: input.userId,
    conversation_id: input.conversationId || null,
    type: input.type,
    text: input.text?.trim() || '',
    audio_url: input.audioUrl || '',
    audio_duration: input.audioDuration || 0,
    position: input.position || null,
    resonate_count: 0,
    is_reported: false,
    created_at: now,
  };

  try {
    await setDoc(doc(db, 'scruts', scrutId), data);
    if (input.conversationId) {
      // update conversation count if exists
      const convRef = doc(db, 'conversations', input.conversationId);
      const convSnap = await getDoc(convRef);
      if (convSnap.exists()) {
        await updateDoc(convRef, {
          scrut_count: increment(1),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `scruts/${scrutId}`);
  }

  return {
    ...data,
    user: input.user,
  };
}

export async function toggleFirestoreResonate(scrutId: string, userId: string, currentlyResonated: boolean): Promise<boolean> {
  const resId = `${userId}_${scrutId}`;
  const resRef = doc(db, 'resonates', resId);
  const scrutRef = doc(db, 'scruts', scrutId);

  try {
    if (currentlyResonated) {
      await deleteDoc(resRef);
      await updateDoc(scrutRef, { resonate_count: increment(-1) });
      return false;
    } else {
      await setDoc(resRef, {
        id: resId,
        user_id: userId,
        scrut_id: scrutId,
        created_at: new Date().toISOString(),
      });
      await updateDoc(scrutRef, { resonate_count: increment(1) });
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, currentlyResonated ? OperationType.DELETE : OperationType.CREATE, `resonates/${resId}`);
  }
}

export async function submitFirestoreReport(scrutId: string, userId: string, reason: string): Promise<void> {
  const repId = 'rep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  try {
    await setDoc(doc(db, 'reports', repId), {
      id: repId,
      scrut_id: scrutId,
      user_id: userId,
      reason: reason.trim(),
      reviewed: false,
      actioned: false,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `reports/${repId}`);
  }
}
