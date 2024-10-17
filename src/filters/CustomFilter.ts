export class CustomFilter extends PIXI.Filter {
  constructor(vertex?: string, fragment?: string, uniforms?: { [x: string]: unknown }) {
    super(vertex, fragment, uniforms);
  }
}