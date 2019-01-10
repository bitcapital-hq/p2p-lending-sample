import { User } from '../models';
import { getRepository } from 'typeorm';
import { repository } from 'pjson';

export default class UserService {
    //private repository = getRepository(User);

    public static async list(query: object) {
        return await User.find({where: query});
    }
}