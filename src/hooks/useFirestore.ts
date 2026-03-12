import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  query,
  QueryConstraint,
  addDoc,
  updateDoc,
  onSnapshot,
  QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../config/firebase';

interface UseDocumentResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseCollectionResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

export const useDocument = <T extends DocumentData>(
  collectionName: string,
  docId: string
): UseDocumentResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, collectionName, docId),
      (docSnap) => {
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() } as unknown as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, docId]);

  return { data, loading, error };
};

export const useCollection = <T extends DocumentData>(
  collectionName: string,
  queryConstraints?: QueryConstraint[]
): UseCollectionResult<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = queryConstraints && queryConstraints.length > 0
      ? query(collection(db, collectionName), ...queryConstraints)
      : collection(db, collectionName);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const docs: T[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
          docs.push({ id: doc.id, ...doc.data() } as unknown as T);
        });
        setData(docs);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, queryConstraints]);

  return { data, loading, error };
};

export const addDocument = async <T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> => {
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
};

export const updateDocument = async <T extends Partial<DocumentData>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> => {
  await updateDoc(doc(db, collectionName, docId), data);
};
