/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { BattleTransition } from "./BattleTransition";
import semver from "semver";

import "./HTMLDocumentPickerElement";
import "./hooks";

(window as any).semver = semver;
(window as any).BattleTransition = BattleTransition;



