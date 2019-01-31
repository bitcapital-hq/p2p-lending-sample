// Keep config as first import

import Config from '../config';
import Server, { ServerOptions } from 'ts-framework';
import AssetController from './controllers/AssetController';
import BoletoController from './controllers/BoletoController';
import ConsumerController from './controllers/ConsumerController';
import ProposalController from './controllers/ProposalController';
import StatusController from './controllers/StatusController';
import UserController from './controllers/UserController';
import UptimeService from './services/UptimeService';
import MainDatabase from './database';

export default class MainServer extends Server {
  constructor(options?: ServerOptions) {
    super({
      ...Config.server,
      router: {
        controllers: {
          AssetController,
          BoletoController,
          ConsumerController,
          ProposalController,
          StatusController,
          UserController
        }
      },
      children: [
        MainDatabase.getInstance(),
        UptimeService.getInstance()
      ],
      ...options,
    });
  }
}
