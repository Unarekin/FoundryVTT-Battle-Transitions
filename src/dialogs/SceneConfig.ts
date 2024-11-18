import { NotImplementedError } from '../errors/NotImplementedError';
import { SceneConfiguration } from '../interfaces';

export abstract class SceneConfig {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static inject(app: SceneConfig, html: JQuery<HTMLElement>, options: any, config: SceneConfiguration): Promise<void> { throw new NotImplementedError(); }
}