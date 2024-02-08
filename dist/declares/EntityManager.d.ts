import {
  EntityListResponse,
  EntityPaginatedListResponse,
  Filters,
  ListParams,
  Ordering,
  PaginatedListParams,
  Stored,
} from '@exp1/common-utils'
import {firestore} from 'firebase-admin'
import {Repository} from './Repository'
import {Transaction} from './Transaction'

export class EntityTransactionManager<Entity> {
  public readonly transaction: Transaction<Stored<Entity>>
  public readonly collectionName: string

  constructor(tx: firestore.Transaction, db: firestore.Firestore, collectionName: string)

  ref(id?: string): firestore.DocumentReference<Stored<Entity>>

  create(entity: Entity, id?: string): Promise<firestore.DocumentReference<Stored<Entity>>>

  update(id: string, entity: Partial<Entity>): Promise<firestore.DocumentReference<Stored<Entity>>>

  one(id: string): Promise<Stored<Entity> | null>

  item(id: string): Promise<Stored<Entity>>

  list(params: ListParams): Promise<EntityListResponse<Entity>>

  paginatedList(params: PaginatedListParams): Promise<EntityPaginatedListResponse<Entity>>

  first(params: {filters?: Filters; ordering?: Ordering}): Promise<Stored<Entity> | null>

  remove(id: string): Promise<void>
}

export class EntityManager<Entity> {
  private readonly repository: Repository<Stored<Entity>>
  public readonly collectionName: string

  constructor(db: firestore.Firestore, collectionName: string)

  create(entity: Entity, id?: string): Promise<Stored<Entity>>

  update(id: string, entity: Partial<Entity>): Promise<Stored<Entity>>

  remove(id: string): Promise<void>

  item(id: string): Promise<Stored<Entity>>

  one(id: string): Promise<Stored<Entity> | null>

  first(params: {filters?: Filters; ordering?: Ordering}): Promise<Stored<Entity>>

  list(params: ListParams): Promise<EntityListResponse<Entity>>

  paginatedList(params: PaginatedListParams): Promise<EntityPaginatedListResponse<Entity>>

  tx(tx: firestore.Transaction): EntityTransactionManager<Entity>
}
