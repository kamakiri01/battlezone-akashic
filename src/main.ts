import * as wf from "./WireFrame";
import * as p from "./params";

function main(param: g.GameMainParameterObject): void {
	const scene = new g.Scene({game: g.game});
	scene.loaded.handle(() => {
        const DEG2RAD = 3.14159/180;
        const RAD2DEG = 180/3.14159;

        const minZ = 1,maxZ=10;
        const S = 1/Math.tan(45*3.14159/180);
        const Sz = maxZ/(maxZ-minZ);
		const random = function() {
			return g.game.random[0].get(0, 99999) / 100000;
		}

		const bg = new g.FilledRect({
			scene: scene,
			cssColor: "black",
			width: g.game.width,
			height: g.game.height
		});
		scene.append(bg);

		const rader = new wf.Rader({ scene: scene });
		rader.x = g.game.width / 2 - 48;
		rader.y = 24;
		scene.append(rader);

        const c = new wf.Camera(scene, 0, 0, 0);
        c.sphereR = 15;

        const projMat = new wf.Matrix([
			                        [  S, 0, 0, 0],
                                    [  0, S, 0, 0],
                                    [  0, 0, Sz, 1],
                                    [  0, 0,-Sz*minZ, 0] ]);
                                    
        const screenMat = new wf.Matrix([
			                          [160,   0,0,160],
                                      [  0,-160,0,160],
                                      [  0,   0,1,  0],
                                      [  0,   0,0,  1] ]);

        const convMat = screenMat.composition(projMat);

		const bullet = new wf.Bullet(scene, 0, 0, 0);
		bullet.setVT(p.bulletVT);
		bullet.color = "#ff0000";
		scene.append(bullet);

		const horizon = new wf.Shape(scene, 0, 0, 0);
		horizon.setVT(p.horizonVT);
		horizon.color = "#b8860b";
		scene.append(horizon);

		const trees: wf.Shape[] = [];
		for (var i = 0; i < 60; i ++) {
			var x = random() * 700 - 350;
			var z = random() * 700 - 350;
			var t = new wf.Shape(scene, x, -10, z);
			var rgb_r = parseInt(String(random() * 64 + 16)).toString(16);
			var rgb_g = parseInt(String(random() * 64 + 128)).toString(16);
			var rgb_b = parseInt(String(random() * 64 + 16)).toString(16);
			t.color = "#" + rgb_r + rgb_g + rgb_b;
			t.setVT(p.treeVT);
			trees.push(t);
		}

        //speed, turnRad, maxframe, escapeDist, shotDist, shotRad
        var AITable = [ [ 2, 2*DEG2RAD, 100, 300, 200, 16*DEG2RAD ],
                        [ 2, 3*DEG2RAD,  80, 400, 300, 20*DEG2RAD ],
                        [ 3, 2*DEG2RAD, 100, 400, 200, 18*DEG2RAD ],
                        [ 1, 1*DEG2RAD, 140, 500, 400, 16*DEG2RAD ],
                        [ 4, 3*DEG2RAD,  60, 350, 300, 18*DEG2RAD ] ];

        var enemy1 = new wf.Tank(scene, p.bulletVT);
        enemy1.setVT(p.tankVT);
        enemy1.spawn(c);
        enemy1.sphereR = 15;
        var enemy2 = new wf.Tank(scene, p.bulletVT);
        enemy2.setVT(p.tankVT);
        enemy2.spawn(c);
        enemy2.sphereR = 15;

		var enemies: wf.Tank[] = [enemy1, enemy2];
		scene.append(enemy1);
		scene.append(enemy2);

		
		scene.update.handle(scene, function() {
			// 操作系入力処理
			const gp = window.navigator.getGamepads()[0]; // 決め打ちです
			if (gp && gp.axes[9]) {
				const pov = gp.axes[9];
				switch (pov) {
					case 1.2857143878936768:
						// 無操作
						break;
					case -1:
						// 上
		                c.moveF(3);
        		        horizon.moveF(3);
						break;
					case -0.4285714030265808:
						// 右
		                c.rotateY(3*DEG2RAD);
        		        horizon.rotateY(3*DEG2RAD);
						break;
					case 0.14285719394683838:
						// 下
		                c.moveF(-3);
        		        horizon.moveF(-3);
						break;
					case 0.7142857313156128:
						// 左
		                c.rotateY(-3*DEG2RAD);
        		        horizon.rotateY(-3*DEG2RAD);
						break;
					// 斜め
					case -0.7142857313156128:
						// 右上
		                c.moveF(3);
        		        horizon.moveF(3);
		                c.rotateY(3*DEG2RAD);
        		        horizon.rotateY(3*DEG2RAD);
						break;
					case -0.14285719394683838:
						// 右下
		                c.rotateY(3*DEG2RAD);
        		        horizon.rotateY(3*DEG2RAD);
		                c.moveF(-3);
        		        horizon.moveF(-3);
						break;
					case 0.4285714626312256:
						// 左下
		                c.rotateY(-3*DEG2RAD);
        		        horizon.rotateY(-3*DEG2RAD);
		                c.moveF(-3);
        		        horizon.moveF(-3);
						break;
					case 1:
						// 左上
		                c.rotateY(-3*DEG2RAD);
        		        horizon.rotateY(-3*DEG2RAD);
		                c.moveF(3);
        		        horizon.moveF(3);
						break;
					default: 
				}
			}
			if (gp && gp.buttons[0] && gp.buttons[0].pressed) {
				if (bullet.appear) return;
				bullet.onShotStart(c);
				const handler = function() {
					bullet.onShotFrame(enemies);
					if (!bullet.appear) {
						bullet.update.remove(bullet, handler);
					}
				}
				bullet.update.handle(bullet, handler);
			} 

			rader.onFrame(c, enemies);
			c.updateMat();
			horizon.draw(c.rotMat, convMat);

            for (var i = 0, l = enemies.length; i < l; i++) {
                if (enemies[i].appear) {
                    if (enemies[i].shapeSphereHit(c)) {
                        enemies[i].onHit();
                    }
                    enemies[i].onFrame(c);
                    enemies[i].draw(c.rotMat, convMat);
					/*
                    if (enemies[i].bullet.appear) {
                        enemies[i].bullet.draw(c.rotMat, convMat);
                    }
					*/
                } else {
                    wf.Tank.prototype.setAIProps.apply(enemies[i], AITable[(random() * AITable.length) | 0]);
                    enemies[i].spawn(c);
					enemies[i].sphereR = 15;
                }
            }

            for(var i=0;i<trees.length;i++) {
                trees[i].draw(c.rotMat, convMat);
            }

            if (bullet.appear) bullet.draw(c.rotMat, convMat);

			scene.modified();
		});		
	});
	g.game.pushScene(scene);
}

export = main;
