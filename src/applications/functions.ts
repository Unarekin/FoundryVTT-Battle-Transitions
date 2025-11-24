import { coerceScene, coerceUser } from '../coercion';
import { LOG_ICON } from '../constants.js';
import { TransitionConfiguration, TransitionStep } from '../steps';
import { getSortedSteps, getStepClassByKey, mimeType } from '../utils';
import { StepContext } from './types';




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



export function getStepsForCategory(category: string, sequence?: TransitionConfiguration[], hidden?: boolean): StepContext[] {
  return getSortedSteps()
    .reduce((prev, curr) => {

      if (curr.category !== category) return prev;
      // If hidden is false, then do not return hidden steps (like SceneChangeStep)
      if (!hidden && curr.hidden) return prev;

      let enabled = true;

      if (Array.isArray(sequence)) {
        const stepClass = getStepClassByKey(curr.key)
        if (stepClass && !stepClass.canBeAddedToSequence(sequence)) enabled = false;
      }

      return [
        ...prev,
        {
          key: curr.key,
          name: `BATTLETRANSITIONS.${curr.name}.NAME`,
          icon: curr.icon,
          hasIcon: !!curr.icon,
          preview: curr.preview,
          tooltip: generatePreviewTooltip(curr),
          enabled
        }
      ]
    }, [] as StepContext[]);
}

function generatePreviewTooltip(step: typeof TransitionStep): string {
  const tooltip = document.createElement("div");
  tooltip.classList.add("toolclip", "themed", "theme-dark");

  if (step.preview) {
    const mime = mimeType(step.preview).split("/");
    if (mime[0] === "video") {
      const vid = document.createElement("video");
      vid.style.height = "auto";
      vid.autoplay = true;
      vid.loop = true;
      vid.muted = true;
      const src = document.createElement("source");
      src.src = step.preview;
      vid.appendChild(src);

      tooltip.appendChild(vid);
    } else if (mime[0] === "image") {
      const img = document.createElement("img");
      img.src = step.preview;

      tooltip.appendChild(img);
    }

  }

  const title = document.createElement("h4");
  title.innerText = game.i18n?.localize(`BATTLETRANSITIONS.${step.name}.NAME`) ?? "";
  tooltip.appendChild(title);

  const desc = document.createElement("p");
  desc.innerText = game.i18n?.localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`) ?? "";
  tooltip.appendChild(desc);

  if (step.reversible) {
    const reversible = document.createElement("p");

    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-rotate-left", "fa-fw");
    reversible.appendChild(icon);

    const strong = document.createElement("strong");
    reversible.appendChild(strong);

    strong.innerHTML = game.i18n?.localize(`BATTLETRANSITIONS.DIALOGS.REVERSIBLE`) ?? "";
    desc.appendChild(reversible);
  }

  return tooltip.outerHTML;
}
