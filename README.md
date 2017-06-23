# Orbit

* [What is orbit?](#what-is-orbit)
* [Technical datasheet](#technical-datasheet)
* [Ambient](#ambient)
* [Design](#design)
  * [Mechanics](#mechanics)
	  * [Player](#player)
	  * [Debris](#debris)
	  * [Planet](#planet)
	  * [Wormhole](#wormhole)
	  * [Station](#station)
* [Implementation](#implementation)
  * [Architecture](#architecture)
	  * [Quintus](#Quintus)
  * [Components](#components)
* [Teamwork](#teamwork)
  * [Work distribution](#work-distribution)
* [References](#references)
* [Risks](#risks)
* [About us](#about-us)

 ## What is orbit?

This is our game for the subject "Videogames development with web technologies". 

* Orbit is a runner type game set up in space.
* There will be various screens, spaced by wormholes, where in an incremental fashion, the astronaut will have to overcome danger.

This game has been made with **_Quintus Engine_**, you can
see more info about this engine at these links:

* [HTML5Quintus.com](http://html5quintus.com/)
* [Github](https://github.com/cykod/Quintus/edit/master/README.md)

## Technical datasheet

* **Title:** Orbit
* **Genre:** Runner
* **Platforms:** PC
* **Modes:** Arcade
* **Age rating:** +5
* **Developers:** 
	* Carlos López Martínez
	* Enrique Ituarte Martínez-Millán
	* Javier López de Lerma


## Ambient

* Year 2157. Humanity is doing exploration missions with the objective of finding new inhabitable planets. To instantaneously communicate through space, a new Interstellar Communication Satellite type has been created. You and your crew were in one of these interstellar trips, on some maintenance mission, when suddenly, there was an issue in the pressurization system, which led to a chain combustion that wrecked the entire satellite. You must rapidly travel to the closest space station before your oxygen goes out.

* The game will have orthogonal graphics, where the player will go horizontally from left to right, unless he enters the event horizon, where space and time will be bent.

# Design

## Objective

The player must travel horizontally with an initial velocity, and will have to use his propulsors to avoid nearby planets and use their gravitational pull to reach the Space Station. Reflexes and paying attention to the HUD will come in handy.

If the player fails to do so, wrecking up the ship against hostile objects, running out of oxygen or fuel and getting stuck in a planet, will lose the game.

## Mechanics

### Player
* The player can propel himself to escape gravitational pull from the closest planet. Use right, left, up and down keyboard arrows to propel the ship in each direction. Each propulsion stacks up to four times. 
* The ship will have an oxygen timer, reaching zero, will end the game, having lost.
* The ship will deteriorate with physical impacts. If utterly damaged, the player will lose the game.
* The ship will use its propulsors, spending fuel. The player must be careful not to press and maintain on one of the arrow keys as it will use up all the fuel.
* Use the spacebar to fire the blaster. Its energy will regenerate over time if playing in low difficulty mode.

### Debris
* Some space debris will appear as we go through the screens.
* Some of it will give enhancements like repairs, fuel or oxygen.
* Meteorites of big or medioum size will split up in two. Causing half as damage.
* Satellites will prompt OxygenCharges if destroyed.

### Planet
* The planets will vary in size, as will their gravitational pull.
* If the astronaut gets close enough to the planet, he will get stuck and will have to use extra fuel to propel out of its gravitational pull. This should be an expensive task.
* All planets can have random space debris orbiting around.

### Wormhole
* Wormholes will help the spaceship, transporting it through space and time.
* Whilst in the event horizon, the player will be able to obtain rewards, before starting the next screen.

### Station
* The Space Station will mean the end of the game.
* The crew will have made it alive, having earned the respect of all humanity.

### Dialogue
* Dialogues will prompt on the screen from time to time, given specific triggered events.
* Their purpose is to provide a cohesive story for the game.

# Implementation

## Architecture

### Quintus

We have used Quintus.JS, and one paramount advantage has been the utilization of Q.state for developing a fictional physics model. Its approach has been one the closest to the real world we have been able to think of. Q.state represents positions, starting points, planet details, etcetera.

We have edited this framework several times, even developing the Q.Dialogue.js

We have also taken advantage of Components and Sprites for complimenting these behaviours.

## Components

There are several components to the sprite:
* Hostile. It indicates the object will cause damage (Meteorite/Satellite)in case of hitting the ship.
* Reward. It will either provide health (Screw), fuel (Fuel) or oxygen (OxygenCharge).
* 2D. It provides 2D movement across space.
* 3D. It provides 3D movement when spawned in a black hole Event Horizon.
* Orbit. It provides orbital movement around a given planet.
 
Mixing up Hostile and Reward with the three types of movement has given us the opportunity to play with all kinds of possibilities

We have also created different components for the behaviour of the Debris Spawner:

* AsteroidField. Depending on the level (passed through the first black hole or second) it will either prompt 2D slow moving meteorites or 2D fast downward moving ones (asteroid rain). Our robot will detect both, prompting a dialogue.
* OrbitSpawner. It creates random debris around a given planet.
* Spawner2D. It spawns 2D space debris, with 2D movement component and hostile or reward component.
* Spawner3D. It spanws 3D space debris, with 3D movement component, and hostile or reward component.

# Teamwork

We set out very early. Javier started out with the implementation of Q.Dialogue.js, while Enrique and Carlos put into practice all the considerations had in discussions. Enrique started with the physics model whilst Carlos implemented the first iteration of the space debris and its spawner. In the end, all of the team worked together to deliver the best version of Orbit they could think of.

## Work distribution

* Javier López: 28%
* Carlos López: 34%
* Enrique Ituarte: 38%


## Sources and References
Assets
* All main graphics have been designed or edited by Enrique Ituarte.
* [Justin Nichols] (https://opengameart.org/users/justin-nichol)
* [angryfly3d] (https://sketchfab.com/angryfly3d)
* [Help icon](http://www.freeiconspng.com/uploads/help-icon-12.png)
* [Credits icon](https://cdn2.iconfinder.com/data/icons/app-types-in-grey/512/info_512pxGREY.png)

Games
* [Orbit](https://play.google.com/store/apps/details?id=com.ChetanSurpur.Orbit&hl=es)
* [Gravity Guy](https://play.google.com/store/apps/details?id=com.miniclip.gravityguy&hl=es)
* [Satalaunch](https://appadvice.com/app/satalaunch/420814059 )
* [Angry Birds: Star Wars](https://play.google.com/store/apps/details?id=com.rovio.angrybirdsstarwars.ads.iap&hl=es)

## Risks

* There will be a random factor when creating space debris.
* The physics model must be well implemented in order to avoid weird behaviour.
* There must be a vast amount of high quality graphics. This will mean extra work.
* Difficulty must befit the game. Not easy or extra hard, so as to prevent the player from getting bored.

## About us:

* [Carlos López Martínez](https://github.com/CharlieGnomo)
* [Enrique Ituarte Martínez-Millán](https://github.com/eituarte)
* [Javier López de Lerma](https://github.com/javlop05)
