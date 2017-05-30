import {Model} from '../../../src-server/index'

export default class User extends Model<{
    name: string,
    age: number,
}> {
    getAge(): number { return this.get('age') }
}


(await User.find(1)).getAge()
