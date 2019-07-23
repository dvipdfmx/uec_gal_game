# Denmachi Engine
Make Gal Game with JSON definition file.
## Construction
### Scene
ID must be set uniquely, and branch based on this ID. The audio set in the properties here will start playing when the scene is played back. You can also set the background, the effect on the background. 
### Script
`characters` defines the characters to move on the screen. You can also specify simple objects here. The characters specified here need to be declared in another JSON file.
### Choice

### Audio


## How to write JSON
You need to write these json files.
* `game.json`  
Flag system and other constant values
* `scene.json`  
Scene definition
* `characters.json`  
Character or object definition
* `audios.json`  
Audio definition

Look at the JSON schema. Available options are also written there.


## What is flag system
Depending on the player's choice, the flag will be set or broken and will be involved in the subsequent branching of the route. This engine can be defined with `choice`.
## TODO
* Master Volume
