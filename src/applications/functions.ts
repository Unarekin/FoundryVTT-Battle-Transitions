import { coerceScene, coerceUser } from '../coercion';
import { LOG_ICON } from '../constants';
import { TransitionConfiguration } from '../steps';


export async function confirm(title: string, content: string): Promise<boolean> {
  return foundry.applications.api.DialogV2.confirm({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    window: ({ title } as any),
    content
  });
}

export function generateMacro(sequence: TransitionConfiguration[], users: string[] = [], scene: unknown = undefined): string {
  const generated = new Intl.DateTimeFormat("default", Object.fromEntries(["year", "month", "day", "hour", "minute", "second"].map(elem => [elem, "numeric"]))).format(new Date());



  const macro = [
    "/**",
    ` * ${LOG_ICON} ${__MODULE_TITLE__} Auto-Generated Macro`,
    ` * Generated: ${generated}`,
    ` * Version: ${__MODULE_VERSION__}`,
    ` * User: ${game?.user?.name ?? typeof undefined}`,
    ' */',
    ``,
    `try {`
  ];

  const actualScene = scene ? coerceScene(scene) : undefined;
  if (!(actualScene instanceof Scene)) {
    macro.push(
      `  const scene = await BattleTransition.SelectScene();`,
      `  if (!(scene instanceof Scene)) return;`
    )
  } else {
    macro.push(`  const scene = "${actualScene.id}";`);
  }

  macro.push("");

  if (Array.isArray(users) && users.length) {
    const actualUsers = users.reduce((prev, curr) => {
      const user = coerceUser(curr);
      if (!(user instanceof User)) return prev;
      return [...prev, user.id ?? ""];
    }, [] as string[]);
    macro.push(`  await new BattleTransition(scene).addSequence(${JSON.stringify(sequence, null, 2)}).execute(${JSON.stringify(actualUsers)})`);
  } else {
    macro.push(`  await new BattleTransition(scene).addSequence(${JSON.stringify(sequence, null, 2)}).execute();`);
  }

  macro.push(
    `} catch (err) {`,
    `  console.error(err);`,
    `  if (err instanceof Error) ui.notifications.error(err.message, { console: false, localize: true });`,
    `}`
  )

  return macro.join("\n");
}
