import {
    Firestore,
    Transaction as FTransaction,
    CollectionReference,
    DocumentReference,
    Query
} from '@google-cloud/firestore'
import {Transaction} from './Transaction'

export declare class Repository<T> {
    protected db: Firestore
    protected collectionName: string

    constructor (db: Firestore, collectionName: string)
    ref (id?: string): DocumentReference<T>
    set(id: string, data: T): Promise<DocumentReference<T>>
    create(id: string, data: T): Promise<DocumentReference<T>>
    update(id: string, data: Partial<T>): Promise<DocumentReference<T>>
    add(data: Partial<T>): Promise<DocumentReference<T>>

    one(id: string): Promise<T | null>
    list(getQuery: (collectionRef: CollectionReference<T>) => Query<T>): Promise<T[]>
    first(getQuery: (collectionRef: CollectionReference<T>) => Query<T>): Promise<T | null>

    tx(tx: FTransaction): Transaction<T>
}
