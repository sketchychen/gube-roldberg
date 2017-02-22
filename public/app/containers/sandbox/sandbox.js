angular.module('App')
    .component('sandboxComp', {
        templateUrl: 'app/containers/sandbox/sandbox.html',
        controller: SandboxCompCtrl,
        controllerAs: 'sandboxComp'
    });

function SandboxCompCtrl($state, $window, DataServices, Auth) {
    var sandboxComp = this;
    /* --------------------- GRAB USER AND MACHINE DATA --------------------- */
    sandboxComp.user = Auth.currentUser();
    sandboxComp.machine = {
        user_id: "",
        name: "",
        assetList: []
    }
    DataServices.getMachine($state.params.id).then(function(data) {
        if (data.data.user_id === sandboxComp.user.id) { // check for authorization
            sandboxComp.machine = data.data;
            console.log(sandboxComp.machine.assetList)
        }
    });

    /* -------------------------- TOOLBOX INTERFACE ------------------------- */
    sandboxComp.buildMode = false;
    sandboxComp.oneAtATime = true;
    sandboxComp.assets = {
        ball: {
            blurb: 'free-moving circle with weight, rolls around, particularly susceptible to external forces',
            diagram: '',
            parameters: { radius: 0 },
            preview: function(ctx, x, y, params) {
              // params: { r }
                ctx.beginPath();
                ctx.arc(x, y, params.r, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.stroke();
            }
        },
        block: {
            blurb: 'free-moving rectangle with weight. set the height much greater than the width to make a domino',
            diagram: '',
            parameters: { width: 0, height: 0 },
            preview: function(ctx, x, y, params) {
              // params: { w, h }
                    ctx.beginPath();
                    ctx.rect(x - (params.w / 2), y - (params.h / 2), params.w, params.h);
                    ctx.closePath();
                    ctx.stroke();
                  }
        },
        pendulum: {
            blurb: 'free-moving circular weight on a line hanging from a fixed point. increase the count to make a newton\'s cradle',
            diagram: '',
            parameters: { length: 0, radius: 0, count: 0, offset: 0 },
            preview: function(ctx, x, y, params) {
              // params: { r, l, count }
              for (var i=0; i<params.count; i++) {
                ctx.beginPath();
                ctx.moveTo(x+(2*params.r*i), y);
                ctx.lineTo(x+(2*params.r*i), y+params.l);
                ctx.arc(x+(2*params.r*i), y+params.l, params.r, -Math.PI/2, 2 * Math.PI);
                ctx.stroke();
              }
            }
        },
        platform: {
            blurb: 'static rectangle, does not move, can be angled to make a ramp',
            diagram: '',
            parameters: { width: 0, height: 0, angle: 0 },
            preview: function(ctx, x, y, params) {
              // params: { w, h, angle }
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate(params.angle * Math.PI/180);
              ctx.beginPath();
              ctx.rect(-params.w/2, -params.h/2, params.w, params.h);
              ctx.closePath();
              ctx.stroke();
              ctx.restore();
            }
        }
        // {
        //   name: 'launch ramp',
        //   blurb: '',
        //   diagram: '',
        //   parameters: ['radius']
        // }
    };

    sandboxComp.addItem = function() {
        var newItemNo = sandboxComp.items.length + 1;
        sandboxComp.items.push('Item ' + newItemNo);
    };

    sandboxComp.status = {
        isCustomHeaderOpen: false,
        isFirstOpen: true,
        isFirstDisabled: false
    };

    /* --------------------- PUT AND DELETE TO BACK-END --------------------- */
    sandboxComp.rename = function() {
        console.log(sandboxComp.machine)
        DataServices.updateMachine($state.params.id, sandboxComp.machine).then(function(data) {
            console.log(data)
        });
    }

    sandboxComp.delete = function() {
        DataServices.deleteMachine($state.params.id).then(function(data) {
            $state.go('dashboardState')
        })
    }

    /* ----------------- LOAD MATTER.JS AND PREVIEW CANVASES ---------------- */
    sandboxComp.$onInit = function() {
        var sizing = 0.6;
        var aspectRatio = 9 / 16;
        var stageW = window.innerWidth * sizing;
        var stageH = window.innerWidth * sizing * aspectRatio;
        /* --------------------- MATTER.JS WORLD SET UP --------------------- */
        var Engine = Matter.Engine,
            Render = Matter.Render,
            World = Matter.World,
            Body = Matter.Body,
            Composites = Matter.Composites,
            Bodies = Matter.Bodies,
            Constraint = Matter.Constraint,
            Mouse = Matter.Mouse,
            MouseConstraint = Matter.MouseConstraint;

        // create engine
        var engine = Engine.create(),
            world = engine.world;

        // create renderer
        var render = Render.create({
            element: document.getElementById("canvas-stage"),
            engine: engine,
            options: {
                width: stageW,
                height: stageH,
                showAngleIndicator: true,
                showVelocity: true,
                wireframes: false
            }
        });
        Render.run(render);

        // add mouse controls
        var mouse = Mouse.create(render.canvas),
            mouseConstraint = MouseConstraint.create(engine, {
                mouse: mouse,
                constraint: {
                    stiffness: 0.2,
                    render: {
                        visible: false
                    }
                }
            });
        World.add(world, mouseConstraint);


        // create static ground
        var groundW = stageW,
            groundH = 20,
            groundX = stageW / 2,
            groundY = stageH - (groundH / 2);
        var ground = Bodies.rectangle(groundX, groundY, groundW, groundH, {
            isStatic: true,
            render: {
                visible: true
            }
        });
        World.add(world, ground);


        /* --------------------- SANDBOX ASSET RENDERING -------------------- */

        // example newton's cradle
        var cradle = Composites.newtonsCradle(100, 100, 3, stageW * 0.01, stageW * 0.1);
        Body.translate(cradle.bodies[0], {
            x: -stageW * 0.1,
            y: -stageW * 0.1
        });
        World.add(world, cradle);

        // example array of balls
        var balls = []
        for (var i = 0; i < 5; i++) {
            balls.push(Bodies.circle(10 + i * 60, 10 + i * 60, 10));
        }
        World.add(world, balls);


        Engine.run(engine);

        // HIDE PREVIEW CANVAS BY DEFAULT
        // MAKE "ACTIVE" WHEN ADD-TO-SANDBOX MODE IS TOGGLED ON
        var getMousePos = function(canvas, event) {
            var rect = canvas.getBoundingClientRect();
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
        }

        var previewCanvas = document.getElementById("preview-canvas");
        console.log(previewCanvas)
        previewCanvas.width = stageW;
        previewCanvas.height = stageH;

        var ctx = previewCanvas.getContext("2d");

        var selectedAsset = { name: "platform", parameters: {w: 100, h: 20, angle: 30}};
        // var drawAsset = pendulum(mousePos.x, mousePos.y, 20, 100, 3);
        sandboxComp.drawPreview = function() {
            var mousePos = getMousePos(previewCanvas, event);
            ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            sandboxComp.assets[selectedAsset.name].preview(ctx, mousePos.x, mousePos.y, selectedAsset.parameters);
        }

      // previewCanvas.addEventListener('mousemove', function() {
      //   sandboxComp.drawPreview("pendulum");
      // });
      sandboxComp.getXY = function() {
        console.log("clicked")
        var mousePos = getMousePos(previewCanvas, event);
      }

    }

  sandboxComp.$onDestroy = function() {}

}

SandboxCompCtrl.$inject = ['$state', '$window', 'DataServices', 'Auth'];
