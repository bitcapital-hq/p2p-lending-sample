import { Controller, Get, BaseRequest, BaseResponse } from 'ts-framework';
import { getBitcapitalAPIClient } from '../services/BitcapitalService' ;

@Controller("/users")
export default class UserController {
    /**
     * GET /users
     * @description List users
     */
    @Get('/')
    static async getUsers(req: BaseRequest, res: BaseResponse ) {
        console.log(req)
        let data: object = await getBitcapitalAPIClient();
        return res.success(data);
    }
};
