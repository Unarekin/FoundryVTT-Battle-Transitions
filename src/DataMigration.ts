import { SceneConfigurationMigrator } from "./migration";
import { TransitionSteps } from './migration/TransitionSteps';

export class DataMigration {
  static SceneConfiguration = new SceneConfigurationMigrator();
  static TransitionSteps = TransitionSteps;
}
