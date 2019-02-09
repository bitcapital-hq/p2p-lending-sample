// Keep config as first import

import Config from '../config';
import Server, { ServerOptions } from 'ts-framework';
import * as controllers from './controllers';
import UptimeService from './services/UptimeService';
import MainDatabase from './database';

export default class MainServer extends Server {
  constructor(options?: ServerOptions) {
    console.log(options, 'OPTIONS!!!!!!!!!!!', "options.port", options.port, "ENV", process.env.PORT)
    super({
      router: { controllers },
      children: [
        MainDatabase.getInstance(),
        UptimeService.getInstance()
      ],
      ...options,
      ...Config.server
    });
  }
}

