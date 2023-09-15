import {firestore} from 'firebase-admin'

export declare class Transaction<T> {
  constructor (tx: firestore.Transaction, db: firestore.Firestore, collectionName: string)
  ref (id?: string): firestore.DocumentReference<T>

  set(id: string, data: T): Promise<firestore.DocumentReference<T>>
  create(id: string, data: T): Promise<firestore.DocumentReference<T>>
  update(id: string, data: Partial<T>): Promise<firestore.DocumentReference<T>>
  add(data: T): Promise<firestore.DocumentReference<T>>
  delete(id: string): Promise<void>

  get(id: string): Promise<firestore.DocumentSnapshot<T>>
  one(id: string): Promise<T | null>
  list(getQuery: (collectionRef: firestore.CollectionReference<T>) => firestore.Query<T>): Promise<T[]>
  first(getQuery: (collectionRef: firestore.CollectionReference<T>) => firestore.Query<T>): Promise<T | null>
}
