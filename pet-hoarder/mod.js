(function() {
	const init = function() {
		const path = require('path');
		const fs = require('fs');
		const baseDirectory = simplify.getMod("Pet Hoarder",).baseDirectory;
		let configData = fs.readFileSync(path.join(baseDirectory,'config.json'), 'utf8');
		let PET_COUNT = 1;
		if (configData) {
		    PET_COUNT = JSON.parse(configData).PET_COUNT;
		}
		ig.ENTITY.Player = ig.ENTITY.Player.extend({
			skin: {
				appearanceFx: null,
				appearance: null,
				stepFx: null,
				auraFx: null,
				auraFxHandle: null,
				pets: [],
				pet: null
			},
			update: function() {
				// already did pet action, choose new one
				if (!this.skin.pet) {
					let petsInRange = this.getCloseRangePets();
					if (petsInRange) {
						this.skin.pet = petsInRange.random();		
					}
				}
				this.parent();
				// timer was reset, pick new pet
				if (this.idle.timer >= 5) {
					this.skin.pet = null;
				}
			},
			updateSkinPet: function(showEffects) {
				if(this.skin.pets.length){
					this.skin.pets.forEach((pet) => pet.remove());
				}
				const petSkin = sc.playerSkins.getCurrentSkin("Pet");
				if(petSkin && petSkin.loaded) {
					this.skin.pets = Array(PET_COUNT).fill(0).map((value, index) => {
						return ig.game.spawnEntity(sc.PlayerPetEntity, 0, 0, 0, {
							petSkin,
							petId: index
						}, showEffects || false);
					});
				}
			},
			getCloseRangePets: function() {
				const petArr = this.skin.pets.filter((pet) => {
					return ig.CollTools.getGroundDistance(pet.coll, this.coll) < 32 &&
					       Vec2.dot(pet.face, this.face) <= 0 &&
						   pet.coll.pos.z == this.coll.pos.z
				});
				return petArr.length ? petArr : null;
			},
			onPlayerPlaced: function() {
				this.parent();
				this.skin.pets.forEach((pet) => pet.resetStartPos());
			},
			doPetAction: function() {
				this.parent();
			}
		});
		sc.PlayerPetEntity = sc.PlayerPetEntity.extend({
			petId: 0,
			init: function(a, d, f , g) {
				this.petId = g.petId + 1;
				this.parent.apply(this, arguments);
				const xDist = 40,
				      yDist = 30;
				const angle = this.getAngle();
				const x = Math.floor(xDist * Math.cos(angle)), 
				      y = Math.floor(-yDist * Math.sin(angle));
				this.posOffset = Vec2.createC(x,y);
			},
			resetStartPos: function() {
				this.parent();
				const angle = this.getAngle();
				const x = this.coll.pos.x + PET_COUNT * Math.sin(angle);
				const y = this.coll.pos.y + PET_COUNT * Math.cos(angle);
				const z = this.coll.pos.z;
				this.coll.setPos(x,y, z);
			},
			getAngle: function() {
				return (this.petId * Math.PI * (180/(PET_COUNT + 1)))/ 180;
			}
		});
	};

	document.body.addEventListener("modsLoaded", init);
})()
