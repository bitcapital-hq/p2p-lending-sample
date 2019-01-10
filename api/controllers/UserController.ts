import { Controller, Get, BaseRequest, BaseResponse } from 'ts-framework';

@Controller("/users")
export default class UserController {
    /**
     * GET /users
     * @description List users
     */
    @Get('/')
    static async getUsers(req: BaseRequest, res: BaseResponse ) {
        return res.success('OK');
    }
};