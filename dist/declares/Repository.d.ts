import {firestore} from 'firebase-admin'
import {Transaction} from './Transaction'

export declare class Repository<T> {
    protected db: firestore.Firestore
    protected collectionName: string

    constructor (db: firestore.Firestore, collectionName: string)
    ref (id?: string): firestore.DocumentReference<T>
    set(id: string, data: T): Promise<firestore.DocumentReference<T>>
    create(id: string, data: T): Promise<firestore.DocumentReference<T>>
    update(id: string, data: Partial<T>): Promise<firestore.DocumentReference<T>>
    add(data: Partial<T>): Promise<firestore.DocumentReference<T>>
    delete(id: string): Promise<void>

    one(id: string): Promise<T | null>
    list(getQuery: (collectionRef: firestore.CollectionReference<T>) => firestore.Query<T>): Promise<T[]>
    first(getQuery: (collectionRef: firestore.CollectionReference<T>) => firestore.Query<T>): Promise<T | null>

    tx(tx: firestore.Transaction): Transaction<T>
}
