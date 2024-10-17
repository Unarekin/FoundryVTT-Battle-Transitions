export class ScreenSpaceCanvasGroup extends PIXI.Container {
  protected setInverseMatrix() {
    if (canvas?.app?.stage)
      this.transform.setFromMatrix(canvas.app.stage.localTransform.clone().invert());
  }

  constructor() {
    super();
    if (canvas?.app) {
      canvas.app.renderer.addListener("prerender", () => {
        this.setInverseMatrix();
      })
    }
  }
}