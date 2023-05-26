import { InjectionToken } from '@angular/core';
import { EnvironmentApp } from '../models/environment.models'

export const ENVIRONMENT = new InjectionToken<Environment>('environment');

export class Environment {
  private readonly env: EnvironmentApp;
  private readonly window: Window;


  constructor(env: EnvironmentApp, window: Window) {
    this.env = env;
    this.window = window;
  }

  get currentEnv(): EnvironmentApp {
    return this.env;
  }

  get baseEndpoint(): string {
    return this.env.baseEndpoint
  }

  get ygoprodeckBaseEndpoint(): string {
    return this.env.ygoprodeckBaseEndpoint
  }


  get perPage(): number {
    return this.env.perPage;
  }

}
