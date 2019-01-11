import { Controller, Get, BaseRequest, BaseResponse } from 'ts-framework';
import BitcapitalService from '../services/BitcapitalService' ;

@Controller("/users")
export default class UserController {
    /**
     * GET /users
     * @description List users
     */
    @Get('/')
    static async getUsers(req: BaseRequest, res: BaseResponse ) {
        let data: object = await BitcapitalService.getAPIClient();
        console.log('AFTERAFTERAFTERAFTERAFTERAFTERAFTERAFTERAFTERAFTERAFTERAFTERAFTER')
        return res.success(data);
    }
};
