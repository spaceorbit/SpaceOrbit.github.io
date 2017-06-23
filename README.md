# Orbit

* [What is orbit?](#what-is-orbit)
* [Technical datasheet](#technical-datasheet)
* [Description](#description)
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
	  * [Q.state](#Q.state)
	  * [Debris](#debris)
	  * [Planet](#planet)
	  * [Wormhole](#wormhole)
	  * [Station](#station)
  * [Components](#components)
	  * [Player](#player)
	  * [Debris](#debris)
	  * [Planet](#planet)
	  * [Wormhole](#wormhole)
	  * [Station](#station)
* [References](#references)
* [Risks](#risks)
* [About us](#about-us)

 ## What is orbit?

This is our game for the subject "Videogames development with web technologies". This game has been made with **_Quintus Engine_**, you can
see more info about this engine at these links:

* [HTML5Quintus.com](http://html5quintus.com/)
* [Github](https://github.com/cykod/Quintus/edit/master/README.md)

## Technical datasheet

* **Title:** Orbit
* **Genre:** Runner
* **Platforms:** PC and Mobile
* **Modes:** Arcade
* **Age rating:** +5
* **Developers:** 
	* Carlos López Martínez
	* Enrique Ituarte Martínez-Millán
	* Javier López de Lerma

## Description

* Orbit is a runner type game set up in space. The player must travel horizontally with an initial velocity, and will have to use his propulsors to avoid nearby planets and use their gravitational pull to reach the Space Station.

* There will be various screens, spaced by wormholes, where in an incremental fashion, the astronaut will have to overcome danger.

## Ambient

* Year 2157. Humanity is doing exploration missions with the objective of finding new inhabitable planets. To instantaneously communicate through space, a new Interstellar Communication Satellite type has been created. You and your crew were in one of these interstellar trips, on some maintenance mission, when suddenly, there was an issue in the pressurization system, which led to a chain combustion that wrecked the entire satellite. You must rapidly travel to the closest space station before your oxygen goes out.

* The game will have orthogonal graphics, where the player will go horizontally from left to right, unless he enters the event horizon, where space and time will be bent.

# Design

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
* Their purpose is to provide a cohesive story.

## Sources and References
Assets
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


* [Diseño del juego](#diseño-del-juego)
  * [Objetivo del juego](#objetivo-del-juego)
  * [Principales mecánicas](#principales-mecanicas)
* [Diseño de la implementacion](#diseño-de-la-implementacion)
* [Equipo de trabajo y reparto de tareas](#equipo-de-trabajo-y-reparto-de-tareas)
* [Fuentes y referencias](#fuentes-y-referencias)

 ## Diseño del juego 
 
 ### Objetivo del juego
 
 ### Principales mecánicas
 
 ## Diseño de la implementación
 
 ## Equipo de trabajo y reparto de tareas
 
 ## Fuentes y referencias
