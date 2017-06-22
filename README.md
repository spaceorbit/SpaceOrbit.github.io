# Orbit

* [What is orbit?](#what-is-orbit)
* [Technical datasheet](#technical-datasheet)
* [Description](#description)
* [Ambient](#ambient)
* [Mechanics](#mechanics)
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

* Year 2157. Humanity is doing exploration missions with the objective of finding new inhabitable planets. You and your crew were in one of these interstellar trips, where whilst you were in the exterior of the ship Onyxia trying to repair one of the propulsors, there was an issue in the pressurization system, which led to a chain combustion that wrecked the entire ship. You must rapidly travel to the closest space station before your oxygen goes out.

* The game will have orthogonal graphics, where the player will go horizontally from left to right, unless he enters the event horizon, where space and time will be bent.


## Mechanics

### Player
* The player can propel himself to escape gravitational pull from the closest planet. Clicking anywhere on the screen will calculate the direction of propulsion.
* The astronaut will have an oxygen timer, reaching zero, will end the game, having lost.
* The space suit will deteriorate with physical impacts. If utterly damaged, the player will lose the game.

### Debris
* Some space debris will appear as we go through the screens.
* Some of it will give enhancements like extra propulsion or oxygen, although most will damage the suit.

### Planet
* The planets will vary in size, as will their gravitational pull.
* If the astronaut gets close enough to the planet, he will get stuck and will not be able to reach the Station.

### Wormhole
* Wormholes will help the astronaut.
* Whilst in the event horizon, the player will be able to obtain rewards (enhancements to the suit, extra points…), before starting the next screen.

### Station
* The Space Station will mean the end of the game.
* The astronaut will have made it alive, having obtained the maximum of points possible.


## References

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
