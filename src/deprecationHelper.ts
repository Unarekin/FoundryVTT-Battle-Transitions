import { LOG_ICON } from "./constants"

const AlreadyWarned = new Set();


export function logDeprecation(key: string, message: string, version: string, removeVersion = "", url = "") {
  if (AlreadyWarned.has(key)) return;

  AlreadyWarned.add(key);

  const warnMessage: string[] = [
    `${LOG_ICON} ${__MODULE_TITLE__} | ${message}`,
    `Deprecated since: ${version}`
  ];

  if (removeVersion)
    warnMessage.push(`Will be removed in: ${removeVersion}`);
  if (url)
    warnMessage.push(`For more information: ${url}`);


  console.warn(warnMessage.filterJoin("\n"));
}