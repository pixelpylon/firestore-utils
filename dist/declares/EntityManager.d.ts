import {DbData, EntityFilters, EntityListParams, EntityListResponse, EntityOrdering} from 'common-utils'
import { firestore } from 'firebase-admin';
import { Repository } from './Repository';
import { Transaction } from './Transaction';

declare class EntityTransactionManager<Entity> {
  public readonly transaction: Transaction<DbData<Entity>>
  public readonly collectionName: string

  constructor(
    tx: firestore.Transaction,
    db: firestore.Firestore,
    collectionName: string
  )

  ref(id?: string): firestore.DocumentReference<DbData<Entity>>

  create(entity: Entity, id?: string): Promise<firestore.DocumentReference<DbData<Entity>>>

  update(id: string, entity: Partial<Entity>): Promise<firestore.DocumentReference<DbData<Entity>>>

  one(id: string): Promise<DbData<Entity>>

  item(id: string): Promise<DbData<Entity>>

  list(params: EntityListParams<Entity>): Promise<EntityListResponse<Entity>>

  first(params: {filters?: EntityFilters<Entity>, ordering?: EntityOrdering<Entity>}): Promise<DbData<Entity> | null>

  remove(id: string): Promise<void>
}

export class EntityManager<Entity> {
  private readonly repository: Repository<DbData<Entity>>
  public readonly collectionName: string

  constructor(db: firestore.Firestore, collectionName: string)

  create(entity: Entity, id?: string): Promise<DbData<Entity>>

  update(id: string, entity: Partial<Entity>): Promise<DbData<Entity>>

  remove(id: string): Promise<void>

  item(id: string): Promise<DbData<Entity>>

  first(params: {filters?: EntityFilters<Entity>, ordering?: EntityOrdering<Entity>}): Promise<DbData<Entity>>

  list(params: EntityListParams<Entity>): Promise<EntityListResponse<Entity>>

  tx(tx: firestore.Transaction): EntityTransactionManager<Entity>
}