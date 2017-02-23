angular.module('App')
  .component('sandboxComp', {
    templateUrl: 'app/containers/sandbox/sandbox.html',
    controller: SandboxCompCtrl,
    controllerAs: 'sandboxComp'
  });

function SandboxCompCtrl($state, $window, DataServices, Auth) {
  var sandboxComp = this;
  sandboxComp.$onInit = function() {
  /* ---------------------- GRAB USER AND MACHINE DATA ---------------------- */
    sandboxComp.user = Auth.currentUser();

    var yourMachine = {
      name: "",
      assetList: {} // get asset varieties from database later
    }

    DataServices.getMachine($state.params.id).then(function(data) {
      if (data.data.user_id === sandboxComp.user.id) { // just to ascertain authorization to edit
        sandboxComp.machine = data.data;
        yourMachine.name = sandboxComp.machine.name;
        if (sandboxComp.machine.assetList !== undefined) {
          yourMachine.assetList = sandboxComp.machine.assetList;
        }

      /* ------------------------ TOOLBOX INTERFACE ----------------------- */
        sandboxComp.previewMode = false;

        sandboxComp.oneAtATime = true;
        // move asset options to database later
        sandboxComp.assetLibrary = {
          'ball': {
            blurb: 'free-moving circle with weight, rolls around, particularly susceptible to external forces',
            diagram: '',
            parameters: {
              radius: { value: 1, max: 100 }
            },
            drawPreview: function(ctx, x, y, params) {
              // params: { radius }
              ctx.beginPath();
              ctx.arc(x, y, params.radius, 0, 2 * Math.PI);
              ctx.closePath();
              ctx.stroke();
            },
            active: false
          },
          'block': {
            blurb: 'free-moving rectangle with weight. set the height much greater than the width to make a domino',
            diagram: '',
            parameters: {
              width: { value: 1, max: 100 },
              height: { value: 1, max: 100 }
            },
            drawPreview: function(ctx, x, y, params) {
              // params: { width, height }
              ctx.beginPath();
              ctx.rect(x - (params.width / 2), y - (params.height / 2), params.width, params.height);
              ctx.closePath();
              ctx.stroke();
            },
            active: false
          },
          'pendulum': {
            blurb: 'free-moving circular weight on a line hanging from a fixed point. increase the count to make a newton\'s cradle',
            diagram: '',
            parameters: {
              length: { value: 1, max: 100 },
              radius: { value: 1, max: 100 },
              count: { value: 1, max: 100 },
              offset: { value: 1, max: 360 }
            },
            drawPreview: function(ctx, x, y, params) {
              // params: { radius, length, count }
              for (var i = 0; i < params.count; i++) {
                ctx.beginPath();
                ctx.moveTo(x + (2 * params.radius * i), y);
                ctx.lineTo(x + (2 * params.radius * i), y + params.length);
                ctx.arc(x + (2 * params.radius * i), y + params.length, params.radius, -Math.PI / 2, 2 * Math.PI);
                ctx.stroke();
              }
            },
            active: false
          },
          'platform': {
            blurb: 'static rectangle, does not move, can be angled to make a ramp',
            diagram: '',
            parameters: {
              width: { value: 1, max: 100 },
              height: { value: 1, max: 100 },
              angle: { value: 1, max: 350 }
            },
            drawPreview: function(ctx, x, y, params) {
              // params: { width, height, angle }
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate(params.angle * Math.PI/180);
              ctx.beginPath();
              ctx.rect(-params.width / 2, -params.height / 2, params.width, params.height);
              ctx.closePath();
              ctx.stroke();
              ctx.restore();
            },
            active: false
          }
          // 'launch ramp': {
          //   blurb: '',
          //   diagram: '',
          //   position: {
          //     x: undefined,
          //     y: undefined
          //   },
          //   parameters: { width: 0, height: 0, arc: 0 },
          //   drawPreview: function(ctx, x, y, params)
          // }
        };

        var selectedAsset = {
          name: "platform",
          position: {
            x: undefined,
            y: undefined
          },
          parameters: {
            width: 100,
            height: 20,
            angle: 30
          }
        };

        sandboxComp.buildMode = function(asset) {
          if (sandboxComp.assetLibrary[asset].active === true) {
            console.log(sandboxComp.assetLibrary[asset]);
            sandboxComp.previewMode = true;
            selectedAsset.name = asset;
            selectedAsset.parameters = sandboxComp.assetLibrary[asset].parameters
            console.log(selectedAsset)
          } else {
            sandboxComp.previewMode = false;
          }
        }

        sandboxComp.status = {
          isCustomHeaderOpen: false,
          isFirstOpen: true,
          isFirstDisabled: false
        };

      /* ------------------- PUT AND DELETE TO BACK-END ------------------- */
        sandboxComp.save = function() {
          yourMachine = sandboxComp.machine;
          DataServices.updateMachine($state.params.id, yourMachine).then(function(data) {
            console.log(data)
          });
        }

        sandboxComp.delete = function() {
          DataServices.deleteMachine($state.params.id).then(function(data) {
            $state.go('dashboardState');
          });
        }

      /* ------------------------ SET CANVAS SIZE ------------------------- */
        var sizing = 0.6;
        var aspectRatio = 9 / 16;
        var stageW = window.innerWidth * sizing;
        var stageH = window.innerWidth * sizing;

      /* ------------------------- PREVIEW CANVAS ------------------------- */
        // HIDE PREVIEW CANVAS BY DEFAULT
        // MAKE "ACTIVE" WHEN ADD-TO-SANDBOX MODE IS TOGGLED ON
        function getMousePos(canvas, event) {
          var rect = canvas.getBoundingClientRect();
          return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            relX: (event.clientX - rect.left)/canvas.width,
            relY: (event.clientY - rect.top)/canvas.height
          };
        }

        var previewCanvas = document.getElementById("preview-canvas");
        previewCanvas.width = stageW;
        previewCanvas.height = stageH;

        var ctx = previewCanvas.getContext("2d");

        sandboxComp.drawPreview = function() {
          var mousePos = getMousePos(previewCanvas, event);
          ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
          var params = {}
          for (var key in selectedAsset.parameters) {
            params[key] = selectedAsset.parameters[key].value;
          }
          sandboxComp.assetLibrary[selectedAsset.name].drawPreview(ctx,
            mousePos.x, mousePos.y, params);
        }

        sandboxComp.getRelativeXY = function() {
          var mousePos = getMousePos(previewCanvas, event);
          selectedAsset.position.x = mousePos.relX.toFixed(3);
          selectedAsset.position.y = mousePos.relY.toFixed(3);
          console.log(selectedAsset);
        }

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
            showVelocity: false,
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

      /* -------------------- SANDBOX ASSET RENDERING --------------------- */
        var cradles = [];
        yourMachine.assetList.pendulums.forEach(function(pendulum) {
          cradle = Composites.newtonsCradle(pendulum.x*stageW,
            pendulum.y*stageH, pendulum.count, pendulum.radius*stageW, pendulum.length*stageH);
          cradles.push(cradle);
        });
        World.add(world, cradles);

        // example array of balls
        var balls = []
        yourMachine.assetList.balls.forEach(function(ball) {
          balls.push(Bodies.circle(ball.x*stageW,
            ball.y*stageH,
            ball.radius*stageW));
        });
        World.add(world, balls);

        var blocks = []
        yourMachine.assetList.blocks.forEach(function(block) {
          blocks.push(Bodies.rectangle(block.x*stageW,
            block.y*stageH,
            block.width*stageW,
            block.height*stageW,
            { isStatic: false }))
        })

        var platforms = []
        yourMachine.assetList.platforms.forEach(function(platform) {
          platforms.push(Bodies.rectangle(platform.x*stageW,
            platform.y*stageH,
            platform.width*stageW,
            platform.height*stageW,
            { isStatic: true, angle: platform.angle }))
        })

        Engine.run(engine);
      }
    });

    // dummy data
    // yourMachine.assetList = {
    //   balls: [
    //     { x: 0.1, y: 0.1, radius: 0.01 },
    //     { x: 0.2, y: 0.1, radius: 0.01 },
    //     { x: 0.3, y: 0.1, radius: 0.01 }
    //   ],
    //   blocks: [
    //     { x: 0.3, y: 0.8, width: 0.05, height: 0.05 }
    //   ],
    //   pendulums: [
    //     { x: 0.25, y: 0.25, count: 4, length: 0.1, radius: 0.01, angle: 90*Math.PI/180 },
    //     { x: 0.75, y: 0.25, count: 4, length: 0.1, radius: 0.01, angle: 45*Math.PI/180 }
    //   ],
    //   platforms: [
    //     { x: 0.44, y: 0.8, width: 0.25, height: 0.05, angle: 30*Math.PI/180 }
    //   ]
    // }

    console.log("yourMachine:", yourMachine)




  }

  sandboxComp.$onDestroy = function() {}

}

SandboxCompCtrl.$inject = ['$state', '$window', 'DataServices', 'Auth'];
