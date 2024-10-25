[![GitHub License](https://img.shields.io/github/license/Unarekin/FoundryVTT-Battle-Transitions)](https://raw.githubusercontent.com/Unarekin/FoundryVTT-Battle-Transitions/refs/heads/master/LICENSE?token=GHSAT0AAAAAACYQQTQK6ODLNX6QMRS6G7GWZY22EZQ)
![GitHub package.json version](https://img.shields.io/github/package-json/v/Unarekin/FoundryVTT-Battle-Transitions)
![Supported Foundry Version](https://img.shields.io/endpoint?url=https%3A%2F%2Ffoundryshields.com%2Fversion%3Fstyle%3Dflat%26url%3Dhttps%3A%2F%2Fraw.githubusercontent.com%2FUnarekin%2FFoundryVTT-Battle-Transitions%2Frefs%2Fheads%2Fmaster%2Fmodule.json)
![Supported Game Systems](https://img.shields.io/endpoint?url=https%3A%2F%2Ffoundryshields.com%2Fsystem%3FnameType%3Dfull%26showVersion%3D1%26style%3Dflat%26url%3Dhttps%3A%2F%2Fraw.githubusercontent.com%2FUnarekin%2FFoundryVTT-Battle-Transitions%2Frefs%2Fheads%2Fmaster%2Fmodule.json)

![BattleTransitionsLogo](https://github.com/user-attachments/assets/19ca5766-566c-42e2-9b1d-da9b662cdc27)


- [Battle Transitions](#battle-transitions)
  - [Installation](#installation)
  - [Examples](#examples)
  - [How does this Work?](#how-does-this-work)
  - [What About \[Some Effect Here\]?](#what-about-some-effect-here)
  - [Contributing](#contributing)
      - [On Automated Testing](#on-automated-testing)
  - [Known Issues / Compatibility With Other Modules](#known-issues--compatibility-with-other-modules)
- [Support](#support)


# Battle Transitions
Battle Transitions seeks to empower GMs with the ability to configure interesting, dynamic transitions from one scene to another, geared towards reproducing some of the effects that you might see when starting a random battle in your favorite JRPG-style games.

The current list of transition types is somewhat basic, but with the framework in place, this list ease easy to expand as time goes on and I plan to introduce ever more interesting options.

## Installation
1. In Foundry, open the 'Add-on Modules' tab
2. Click 'Install Module'
3. Enter the following URL into the 'Manifest URL' field at the bottom
```
https://github.com/Unarekin/FoundryVTT-Battle-Transitions/releases/latest/download/module.json
```

## Examples
For a list of provided effects, please see the [examples wiki page](https://github.com/Unarekin/FoundryVTT-Battle-Transitions/wiki/Examples)

## How does this Work?
Short version: Smoke and Mirrors.

Longer version that actually explains anything:  When triggering a transition, either via command line / macro, the scene navigation context menu, or automatically on scene activation, Battle Transitions first renders a copy of the current scene and creates an overlay placed on top of Foundry's normal canvas.  THe module then activates the next scene, and applies a series of PIXI filters on the overlay image to allow for effects that reveal the new scene in some interesting way.  These effects generally use GLSL shaders, which allows for a great deal of freedom when designing them.

## What About [Some Effect Here]?
I do have a short list of effects from some classic JRPG titles (mostly Final Fantasy, honestly) that I'm looking at incorporating, but am very open to implementing requests from the module's users.

If you'd like to request some particular effect, please [open a github issue](https://github.com/Unarekin/FoundryVTT-Battle-Transitions/issues/new) and describe the effect you would like to see.  If you're looking to reproduce an effect from an existing game, please provide a sample video of the effect in action to better illustrate just how it ought to look.

## Contributing
If you'd like to contribute fixes or new effects to the project, feel free to [open a pull request](https://github.com/Unarekin/FoundryVTT-Battle-Transitions/compare).

#### On Automated Testing
There *is* a framework in place to allow for automated E2E and component testing via [Cypress](https://www.cypress.io/), but there are some issues in integrating with Foundry that need to be addressed before automated testing can be fully embraced.


## Known Issues / Compatibility With Other Modules
- This is an early release, and uses some unorthodox methods to accomplish its goals.  As such, there is a non-zero chance that things will break, leaving things in an unusable state.  In general, running the Cleanup macro should resolve many of these, but if all else fails, reloading the browser window will reset things back to normal.
- Compatibility with [Scene Transitions](https://foundryvtt.com/packages/scene-transitions/) - Currently, no specific measures are taken to ensure compatibility with Scene Transitions or any other modules that affect Foundry's behavior when changing scenes, but preliminary testing shows that the two modules can be used side-by-side if you take some care with how you configure the timing of your Battle Transition sequence.
- [Theatre of the Mind Manager](https://foundryvtt.com/packages/totm-manager#:~:text=TotM%20Manager%20is%20designed%20to,between%20images%20on%20a%20tile) - Currently, Battle Transitions does not affect how Theatre of the Mind Manager handles it's faked scene transitions.  This is planned for the future.
- [Token Magic FX](https://foundryvtt.com/packages/tokenmagic/) - TMFX uses effects similar to how Battle Transitions does, but they are customized and very dependent on TMFX's implementation, which does not vibe with BT's.  Support for TMFX effect configurations is planned for the future, but not currently implemented.

For a list of known bugs and feature requests, please see the project's [issues page](https://github.com/Unarekin/FoundryVTT-Battle-Transitions/issues)

# Support
Do please consider throwing me a few bucks over on [Ko-Fi](https://ko-fi.com/unarekin) if you like what you see and are feeling generous.
