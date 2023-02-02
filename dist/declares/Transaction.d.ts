import {
  Transaction as FTransaction,
  Firestore,
  DocumentReference,
  CollectionReference,
  Query
} from '@google-cloud/firestore'

export declare class Transaction<T> {
  constructor (tx: FTransaction, db: Firestore, collectionName: string)
  ref (id?: string): DocumentReference<T>

  set(id: string, data: T): Promise<DocumentReference<T>>
  create(id: string, data: T): Promise<DocumentReference<T>>
  update(id: string, data: Partial<T>): Promise<DocumentReference<T>>
  add(data: T): Promise<DocumentReference<T>>
  delete(id: string): Promise<void>

  one(id: string): Promise<T | null>
  list(getQuery: (collectionRef: CollectionReference<T>) => Query<T>): Promise<T[]>
  first(getQuery: (collectionRef: CollectionReference<T>) => Query<T>): Promise<T | null>
}
