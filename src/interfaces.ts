export interface TransitionConfigHandler<t extends object> {
  key: string;
  name: string;

  defaultSettings: t;
  renderTemplate(flag?: t): Promise<string>;
  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): t;
  generateSummary(flag?: t): string;
}