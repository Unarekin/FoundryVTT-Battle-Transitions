export abstract class ChainableStep {
  public abstract execute(container: PIXI.DisplayObject): Promise<void>
}