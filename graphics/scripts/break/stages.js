const stagesElem = document.getElementById('stages-grid');
const mapNameToImagePath = {
	"Ancho-V Games": "S2_Stage_Ancho-V_Games.png",
	"Arowana Mall": "S2_Stage_Arowana_Mall.png",
	"Blackbelly Skatepark": "S2_Stage_Blackbelly_Skatepark.png",
	"Camp Triggerfish": "S2_Stage_Camp_Triggerfish.png",
	"Goby Arena": "S2_Stage_Goby_Arena.png",
	"Humpback Pump Track": "S2_Stage_Humpback_Pump_Track.png",
	"Inkblot Art Academy": "S2_Stage_Inkblot_Art_Academy.png",
	"Kelp Dome": "S2_Stage_Kelp_Dome.png",
	"MakoMart": "S2_Stage_MakoMart.png",
	"Manta Maria": "S2_Stage_Manta_Maria.png",
	"Moray Towers": "S2_Stage_Moray_Towers.png",
	"Musselforge Fitness": "S2_Stage_Musselforge_Fitness.png",
	"New Albacore Hotel": "S2_Stage_New_Albacore_Hotel.png",
	"Piranha Pit": "S2_Stage_Piranha_Pit.png",
	"Port Mackerel": "S2_Stage_Port_Mackerel.png",
	"Shellendorf Institute": "S2_Stage_Shellendorf_Institute.png",
	"Shifty Station": "S2_Stage_Shifty_Station.png",
	"Snapper Canal": "S2_Stage_Snapper_Canal.png",
	"Starfish Mainstage": "S2_Stage_Starfish_Mainstage.png",
	"Sturgeon Shipyard": "S2_Stage_Sturgeon_Shipyard.png",
	"The Reef": "S2_Stage_The_Reef.png",
	"Wahoo World": "S2_Stage_Wahoo_World.png",
	"Walleye Warehouse": "S2_Stage_Walleye_Warehouse.png",
	"Skipper Pavilion": "S2_Stage_Skipper_Pavilion.png",
	"Unknown Stage": "low-ink-unknown-map.png",
	"Counterpick": "low-ink-unknown-map.png",
	"Museum d'Alfonsino": "S3_Stage_Museum_d_Alfonsino.png",
	"Scorch Gorge": "S3_Scorch_Gorge.png",
	"Eeltail Alley": "S3_Eeltail_Alley.png",
	"Hagglefish Market": "S3HagglefishMarketIcon.png",
	"Undertow Spillway": "S3UndertowSpillwayIcon.png",
	"Mincemeat Metalworks": "S3MincemeatMetalworksIcon.png",
	"Hammerhead Bridge": "S3HammerheadBridgeIcon.png",
	"Mahi-Mahi Resort": "S3MahiMahiResortIcon.png",
	"Brinewater Springs": "S3_Brinewater_Springs.png",
	"Flounder Heights": "S3_Stage_Flounder_Heights.png"
};
const winnerTls = {
	0: gsap.timeline(),
	1: gsap.timeline(),
	2: gsap.timeline(),
	3: gsap.timeline(),
	4: gsap.timeline(),
	5: gsap.timeline(),
	6: gsap.timeline(),
};
const stagesTl = gsap.timeline();
const sbTls = {
	'a': gsap.timeline(),
	'b': gsap.timeline()
};

function createMapListElems(maplist) {
	let stagesGrid = document.querySelector('.stagesGrid');
	gsap.to(stagesGrid, {duration: 0.5, opacity: 0, onComplete: function() {
			stagesGrid.innerHTML = '';
			stagesGrid.style.gridTemplateColumns = `repeat(${maplist.length}, 1fr)`;

			let mapsHTML = '';
			let elemWidth = '260';
			let fontSize = '2.25em';
			let elemOpacity = '1';

			if (maplist.length === 3) {
				elemWidth = '380';
				stagesGrid.style.width = '1200px';
			} else if (maplist.length === 5) {
				elemWidth = '260';
				stagesGrid.style.width = '1400px';
				fontSize = '2.05em;'
			} else if (maplist.length === 7) {
				elemWidth = '200';
				stagesGrid.style.width = '1600px';
				fontSize = '2em';
			}

			if (activeBreakScene.value === 'teams') { elemOpacity = '0'; }

			for (let i = 0; i < maplist.length; i++) {
				const element = maplist[i];
				let elem = `
			<div class="stageElem" style="opacity: ${elemOpacity}" id="stage_${i}">
				<div class="stageImage" style="background-image: url('img/stages/${mapNameToImagePath[element.stage]}');">
					<div class="stageWinner" id="stageWinner_${i}" style="opacity: 0"></div>
				</div>
				<div class="stageInfo">
					<div class="stageMode">
						<fitted-text text="${element.mode}" max-width="${elemWidth}" align="center"></fitted-text>
					</div>
					<div class="stageName" style="font-size: ${fontSize}">${element.stage}</div>
				</div>
			</div>`

				mapsHTML += elem;
			}

			stagesGrid.innerHTML = mapsHTML;
			setWinners(maplist)
		}});

	gsap.to(stagesGrid, {duration: 0.5, opacity: 1, delay: 0.5});
}

NodeCG.waitForReplicants(activeRound).then(() => {
	activeRound.on('change', (newValue, oldValue) => {
		document.querySelector('#teamAName').setAttribute('text', addDots(newValue.teamA.name));
		document.querySelector('#teamBName').setAttribute('text', addDots(newValue.teamB.name));
		document.querySelector('#teamAScore').setAttribute('text', newValue.teamA.score);
		document.querySelector('#teamBScore').setAttribute('text', newValue.teamB.score);

		doOnDifference(newValue, oldValue, 'teamA.name',
			value => {
				newValue.games.forEach((game, index) => {
					if (game.winner === 'alpha') {
						setWinner(index, value, true);
					}
				});
			});
		doOnDifference(newValue, oldValue, 'teamB.name',
			value => {
				newValue.games.forEach((game, index) => {
					if (game.winner === 'bravo') {
						setWinner(index, value, true);
					}
				});
			});

		const stages = newValue.games;

		doOnDifference(newValue, oldValue, 'match.id', () => createMapListElems(stages));

		doOnNoDifference(newValue, oldValue, 'match.id', () => {
			newValue.games.forEach((game, index) => {
				doOnDifference(newValue, oldValue, `games[${index}].winner`,
					newWinner => setWinner(index, getWinnerName(newWinner), newWinner !== 'none'));

				if (oldValue) {
					doOnOneOrMoreDifference(newValue, oldValue, [`games[${index}].stage`, `games[${index}].mode`],
						() => updateSingleStage(index, game));
				}
			});
		});
	});
});

function getWinnerName(winner) {
	if (winner === 'alpha') {
		return addDots(activeRound.value.teamA.name);
	} else if (winner === 'bravo') {
		return addDots(activeRound.value.teamB.name);
	} else {
		return '';
	}
}

function updateSingleStage(index, game) {
	const stage = document.getElementById(`stage_${index}`);
	const stageImage = stage.querySelector('.stageImage');
	const modeText = stage.querySelector('.stageMode > fitted-text');
	const stageText = stage.querySelector('.stageName');

	gsap.to(stage, { duration: 0.35, opacity: 0, onComplete: async () => {
		const stageImageUrl = `img/stages/${mapNameToImagePath[game.stage]}`;
		await loadImagePromise(stageImageUrl);
		stageImage.style.backgroundImage = `url('${stageImageUrl}')`;
		modeText.text = game.mode;
		stageText.innerText = game.stage;

		gsap.to(stage, { duration: 0.35, opacity: 1 });
	} });
}

function setWinners(val) {
	for (let i = 0; i < val.length; i++) {
		const element = val[i];
		if (element.winner === 'none') {
			setWinner(i, '', false);
		} else if (element.winner === 'alpha') {
			setWinner(i, activeRound.value.teamA.name, true);
		} else {
			setWinner(i, activeRound.value.teamB.name, true);
		}
	}
}

function setWinner(index, name, shown) {
	let winnerElem = document.querySelector(`#stageWinner_${index}`);
	if (!winnerElem) return;
	let opacity;

	if (shown) { opacity = 1; }
	else { opacity = 0; }

	if (shown) {
		winnerElem.innerText = addDots(name);
	}

	gsap.to(winnerElem, {opacity: opacity, duration: 0.5});
}
