include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const YELLOW_SCAV_RES = [
	"R-Wpn-MG-Damage01", "R-Wpn-Rocket-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage01",
];
const CYAN_SCAV_RES = [
	"R-Wpn-MG-Damage01", "R-Wpn-Rocket-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage01", "R-Wpn-Rocket-ROF01",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01", "R-Wpn-Cannon-ROF01",
];

// Player values
const CIVILIANS = 1; // Civilian Team
const CYAN_SCAVS = 2; // Cyan Scavengers
const YELLOW_SCAVS = 3; // Yellow Scavengers

// Keep track of which civilian groups have been freed
var civGroup1Free = false;
var civGroup2Free = false;
var civGroup3Free = false;

// This function is called after a video is played, a delay is required for the 'alert' sound to play properly in all cases
function messageAlert()
{
	playSound("beep7.ogg"); // Play a little noise to notify the player that they have a new message
}

//Remove rescued civilians
camAreaEvent("civilianRemoveZone", function(droid)
{
	if (droid.player === CIVILIANS)
	{
		camSafeRemoveObject(droid, false);
	}

	resetLabel("civilianRemoveZone", CIVILIANS);
});

// Triggered when approaching the yellow scavs
camAreaEvent("yScavAttack", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camEnableFactory("yScavFactory");

		// Message about scavengers being dug in
		camPlayVideos(["pcv455.ogg", {video: "L2_SCAVMSG", type: MISS_MSG}]);
		queue("messageAlert", camSecondsToMilliseconds(3.4));
	}
	else
	{
		resetLabel("yScavAttack", CAM_HUMAN_PLAYER);
	}
});

// Triggered when approaching the cyan scavs
camAreaEvent("cScavAttack", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camEnableFactory("cScavFactory1");
		camEnableFactory("cScavFactory2");

		// Release the monster bus
		camManageGroup(camMakeGroup("monsterBusGroup"), CAM_ORDER_COMPROMISE, {
			pos: getObject("LZ"),
			radius: 6,
			removable: false,
		});

		// Message about scavengers being cool
		camPlayVideos(["pcv455.ogg", {video: "L2_SCAV2MSG", type: MISS_MSG}]);
		queue("messageAlert", camSecondsToMilliseconds(3.4));
	}
	else
	{
		resetLabel("cScavAttack", CAM_HUMAN_PLAYER);
	}
});

// Check if a civilian guard structure has been destroyed
// If so, free that civilian group
function checkCivilianGuards()
{
	var  civExit = getObject("civilianExit");

	// Ruins group
	if (getObject("civGuard1") === null && !civGroup1Free)
	{
		var area = getObject("civGroup1");
		var civs = enumArea(area.x, area.y, area.x2, area.y2, CIVILIANS, false);
		for (var i = 0; i < civs.length; ++i)
		{
			if (civs[i].type === DROID)
			{
				orderDroidLoc(civs[i], DORDER_MOVE, civExit.x, civExit.y);
			}
		}
		civGroup1Free = true;
		playSound("pcv612.ogg");	//"Civilian Rescued".
	}
	// Yellow scav group
	if (getObject("civGuard2") === null && !civGroup2Free)
	{
		var area = getObject("civGroup2");
		var civs = enumArea(area.x, area.y, area.x2, area.y2, CIVILIANS, false);
		for (var i = 0; i < civs.length; ++i)
		{
			if (civs[i].type === DROID)
			{
				orderDroidLoc(civs[i], DORDER_MOVE, civExit.x, civExit.y);
			}
		}
		civGroup2Free = true;
		playSound("pcv612.ogg");	//"Civilian Rescued".
	}
	// Cyan scav group
	if (getObject("civGuard3") === null && !civGroup3Free)
	{
		var area = getObject("civGroup3");
		var civs = enumArea(area.x, area.y, area.x2, area.y2, CIVILIANS, false);
		for (var i = 0; i < civs.length; ++i)
		{
			if (civs[i].type === DROID)
			{
				orderDroidLoc(civs[i], DORDER_MOVE, civExit.x, civExit.y);
			}
		}
		civGroup3Free = true;
		playSound("pcv612.ogg");	//"Civilian Rescued".
	}
}

// Spawn civilians in random positions inside of their group areas
function populateCivilians()
{
	var area = getObject("civGroup1");
	for (var i = 0; i < 5; ++i) // Spawn 5 civilians in area 1
	{
		var posX = area.x + (camRand(2)); // 2 tiles wide area
		var posY = area.y + (camRand(3)); // 3 tiles tall area
		addDroid(CIVILIANS, posX, posY, "Civilian",
		"CivilianBody", "BaBaLegs", "", "", "BabaMG");
	}

	var area = getObject("civGroup2");
	for (var i = 0; i < 6; ++i) // Spawn 7 civilians in area 2
	{
		var posX = area.x + (camRand(2)); // 2 tiles wide area
		var posY = area.y + (camRand(3)); // 3 tiles tall area
		addDroid(CIVILIANS, posX, posY, "Civilian",
		"CivilianBody", "BaBaLegs", "", "", "BabaMG");
	}

	var area = getObject("civGroup3");
	for (var i = 0; i < 6; ++i) // Spawn 6 civilians in area 3
	{
		var posX = area.x + (camRand(4)); // 4 tiles wide area
		var posY = area.y + (camRand(2)); // 2 tiles tall area
		addDroid(CIVILIANS, posX, posY, "Civilian",
		"CivilianBody", "BaBaLegs", "", "", "BabaMG");
	}
}

function eventStartLevel()
{
	var startpos = getObject("startPosition");
	var lz = getObject("LZ");
	var tent = getObject("transporterEntry");
	var text = getObject("transporterExit");
	var busPos = getObject("monsterBusGroup");

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "L3", {
		area: "compromiseZone",
		reinforcements: camMinutesToSeconds(1.5),
		annihilate: true
	});
	camSetExtraObjectiveMessage("Rescue the civilian hostages");

	// ally scavengers with civilians
	setAlliance(CIVILIANS, CAM_HUMAN_PLAYER, true);
	setAlliance(CIVILIANS, CYAN_SCAVS, true);
	setAlliance(CIVILIANS, YELLOW_SCAVS, true);

	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	// Give scavengers weapon upgrades
	// Cyan scavengers get ROF upgrades too
	camCompleteRequiredResearch(CYAN_SCAV_RES, CYAN_SCAVS);
	camCompleteRequiredResearch(YELLOW_SCAV_RES, YELLOW_SCAVS);

	changePlayerColour(CIVILIANS, 10); // Civilians to white (The scavengers keep their colours from last mission)

	camSetArtifacts({
		"mortarPit": { tech: "R-Wpn-Mortar01Lt" }, // Mortar
		"cScavFactory2": { tech: "R-Wpn-MG2Mk1" }, // Twin Machinegun
	});

	// Set up bases
	camSetEnemyBases({
		"YellowBase": {
			cleanup: "yScavBase1",
			detectMsg: "YSCAV_BASE1",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"MortarRidge": {
			cleanup: "yScavBase2",
			detectMsg: "YSCAV_BASE2",
			detectSnd: "pcv375.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"Roadblock": {
			cleanup: "yScavBase3",
			detectMsg: "YSCAV_BASE3",
			detectSnd: "pcv375.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"CyanDepot": {
			cleanup: "cScavBase1",
			detectMsg: "CSCAV_BASE1",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"BridgeDefences": {
			cleanup: "cScavBase2",
			detectMsg: "CSCAV_BASE2",
			detectSnd: "pcv375.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"CyanBase": {
			cleanup: "cScavBase3",
			detectMsg: "CSCAV_BASE3",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
	});

	camSetFactories({
		"yScavFactory": {
			assembly: "yScavAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				morale: 50,
				fallback: camMakePos("yScavAssembly"),
				regroup: true,
				count: -1,
			},
			templates: [cTempl.bloke, cTempl.buggy, cTempl.lance, cTempl.bloke, cTempl.rbuggy, cTempl.trike] // Variety
		},
		"cScavFactory1": {
			assembly: "cScavAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				morale: 60,
				fallback: camMakePos("cScavAssembly1"),
				regroup: true,
				count: -1,
			},
			templates: [cTempl.bloke, cTempl.lance, cTempl.bloke, cTempl.bjeep] // Mostly infantry
		},
		"cScavFactory2": {
			assembly: "cScavAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				morale: 50,
				fallback: camMakePos("cScavAssembly2"),
				regroup: true,
				count: -1,
			},
			templates: [cTempl.buscan, cTempl.bloke, cTempl.bjeep, cTempl.rbjeep, cTempl.firetruck] // Mostly vehicles
		},
	});

	// Set up patrol groups
	camManageGroup(camMakeGroup("yScavPatrol"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("yPatrolPos1"),
			camMakePos("yPatrolPos2"),
		],
		interval: camSecondsToMilliseconds(16)
	});
	camManageGroup(camMakeGroup("cScavPatrol"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("cPatrolPos1"),
			camMakePos("cPatrolPos2"),
		],
		interval: camSecondsToMilliseconds(16)
	});

	// Spawn the scav Monster Bus tank
	addDroid(CYAN_SCAVS, busPos.x, busPos.y, "The Battle Bus",
		"MonsterBus", "tracked01", "", "", "RustCannon1Mk1");

	// Spawn civilians in their zones
	populateCivilians();

	// Check the civilian groups on loop
	setTimer("checkCivilianGuards", camSecondsToMilliseconds(2));

	// Set the fog to it's default colours
	camSetFog(182, 225, 236);
}
