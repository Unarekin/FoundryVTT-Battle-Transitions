export class DummyTransitionFilter extends foundry.canvas.rendering.filters.TextureTransitionFilter {
  get type() {
    return "battleTransition" as foundry.canvas.rendering.filters.TextureTransitionFilter.TYPES;
  }

  set type(val) {
    this.uniforms.type = val;

  }
}