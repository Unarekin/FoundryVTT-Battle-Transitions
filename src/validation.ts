/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BackgroundTypes, BilinearDirections, ClockDirections, Easings, RadialDirections, SizingModes, WipeDirections } from "./types";


export function isValidEasing(input: string): boolean { return Easings.includes(input as any); }
export function isValidWipeDirection(input: string): boolean { return WipeDirections.includes(input as any); }
export function isValidClockDirection(input: string): boolean { return ClockDirections.includes(input as any); }
export function isValidBilinearDirection(input: string): boolean { return BilinearDirections.includes(input as any); }
export function isValidRadialDirection(input: string): boolean { return RadialDirections.includes(input as any); }
export function isValidBackgroundType(input: string): boolean { return BackgroundTypes.includes(input as any); }
export function isValidSizingMode(input: string): boolean { return SizingModes.includes(input as any); }