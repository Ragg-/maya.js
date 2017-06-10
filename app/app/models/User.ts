import {Entity} from 'rektia'
import Item from '@models/Item'

export {User as default}

class User extends Entity<app.Entity.User> {
    @Entity.hasMany(Item)
    items: Entity.hasMany<app.Entity.Item>
}
