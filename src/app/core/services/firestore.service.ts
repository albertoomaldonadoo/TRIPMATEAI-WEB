import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint
} from 'firebase/firestore';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private app: FirebaseApp;
  private firestore: Firestore;

  constructor() {
    // Inicializar Firebase (reutiliza la instancia si ya existe)
    this.app = initializeApp(environment.firebase);
    this.firestore = getFirestore(this.app);
  }

  /**
   * Crear o actualizar un documento
   * @param collectionName Nombre de la colección (ej: 'users', 'trips')
   * @param docId ID del documento
   * @param data Datos a guardar
   */
  async setDocument(collectionName: string, docId: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date()
    }, { merge: true });
  }

  /**
   * Obtener un documento por ID
   * @param collectionName Nombre de la colección
   * @param docId ID del documento
   * @returns Datos del documento o null
   */
  async getDocument(collectionName: string, docId: string): Promise<any | null> {
    const docRef = doc(this.firestore, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  /**
   * Obtener todos los documentos de una colección
   * @param collectionName Nombre de la colección
   * @returns Array de documentos
   */
  async getCollection(collectionName: string): Promise<any[]> {
    const colRef = collection(this.firestore, collectionName);
    const querySnapshot = await getDocs(colRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Obtener documentos con filtros
   * @param collectionName Nombre de la colección
   * @param filters Array de filtros [campo, operador, valor]
   * @param orderByField Campo para ordenar (opcional)
   * @param limitCount Límite de resultados (opcional)
   * @returns Array de documentos filtrados
   */
  async getFilteredCollection(
    collectionName: string,
    filters: Array<[string, any, any]> = [],
    orderByField?: string,
    limitCount?: number
  ): Promise<any[]> {
    const colRef = collection(this.firestore, collectionName);
    
    const constraints: QueryConstraint[] = [];
    
    // Aplicar filtros
    filters.forEach(([field, operator, value]) => {
      constraints.push(where(field, operator, value));
    });
    
    // Aplicar ordenamiento
    if (orderByField) {
      constraints.push(orderBy(orderByField));
    }
    
    // Aplicar límite
    if (limitCount) {
      constraints.push(limit(limitCount));
    }
    
    const q = query(colRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Actualizar un documento existente
   * @param collectionName Nombre de la colección
   * @param docId ID del documento
   * @param data Datos a actualizar
   */
  async updateDocument(collectionName: string, docId: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
  }

  /**
   * Eliminar un documento
   * @param collectionName Nombre de la colección
   * @param docId ID del documento
   */
  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    const docRef = doc(this.firestore, collectionName, docId);
    await deleteDoc(docRef);
  }

  /**
   * Crear un perfil de usuario en Firestore
   * (Llamar esto después del registro)
   */
  async createUserProfile(userId: string, userData: any): Promise<void> {
    await this.setDocument('users', userId, {
      ...userData,
      createdAt: new Date()
    });
  }

  /**
   * Obtener perfil de usuario
   */
  async getUserProfile(userId: string): Promise<any | null> {
    return await this.getDocument('users', userId);
  }
}

/* EJEMPLOS DE USO:

// 1. Guardar datos de usuario después del registro
await firestoreService.createUserProfile(user.id, {
  name: user.name,
  surname: user.surname,
  email: user.email
});

// 2. Crear un viaje
await firestoreService.setDocument('trips', 'trip123', {
  userId: user.id,
  destination: 'París',
  startDate: new Date('2025-06-01'),
  endDate: new Date('2025-06-10'),
  status: 'planned'
});

// 3. Obtener todos los viajes de un usuario
const userTrips = await firestoreService.getFilteredCollection(
  'trips',
  [['userId', '==', user.id]],
  'startDate',
  10
);

// 4. Actualizar un viaje
await firestoreService.updateDocument('trips', 'trip123', {
  status: 'completed'
});

// 5. Eliminar un viaje
await firestoreService.deleteDocument('trips', 'trip123');

*/