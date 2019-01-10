// Keep config as first import
import Config from '../config';
import Server, { ServerOptions } from 'ts-framework';
import StatusController from './controllers/StatusController';
import UserController from './controllers/UserController';
import UptimeService from './services/UptimeService';
import MainDatabase from './database';

export default class MainServer extends Server {
  constructor(options?: ServerOptions) {
    super({
      ...Config.server,
      router: {
        controllers: { StatusController, UserController }
      },
      children: [
        MainDatabase.getInstance(),
        UptimeService.getInstance()
      ],
      ...options,
    });
  }
}
