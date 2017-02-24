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

    DataServices.getMachine($state.params.id).then(function(data) {
      if (data.data.user_id === sandboxComp.user.id) { // just to ascertain authorization to edit
        sandboxComp.machine = data.data;
        if (sandboxComp.machine.assetList === undefined) {
          sandboxComp.machine.assetList = {};
        }

      /* ------------------------ TOOLBOX INTERFACE ----------------------- */
        sandboxComp.previewMode = false;
        sandboxComp.oneAtATime = true;

        // move asset options to database or "global"
        sandboxComp.assetLibrary = ASSET_LIBRARY;

        var selectedAsset = {
          name: "",
          data: {
          }
        };

        sandboxComp.buildMode = function(asset) {
          if (sandboxComp.assetLibrary[asset].active === true) {
            sandboxComp.previewMode = true;
            selectedAsset.name = asset;
            for (var key in sandboxComp.assetLibrary[asset].parameters) {
              selectedAsset.data[key] = sandboxComp.assetLibrary[asset].parameters[key].model;
            }
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
          DataServices.updateMachine($state.params.id, sandboxComp.machine).then(function(data) {
            console.log(data)
          });
        }
        sandboxComp.delete = function() {
          DataServices.deleteMachine($state.params.id).then(function(data) {
            console.log(data)
            $state.go('dashboardState');
          });
        }

      /* ------------------------ SET CANVAS SIZE ------------------------- */
        var sizing = 0.6;
        // var aspectRatio = 9 / 16;
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
          var params = {};
          var skipFactoring = ['count', 'angle'];
          for (var key in selectedAsset.data) {
            if (skipFactoring.indexOf(key) > -1) {
              params[key] = selectedAsset.data[key];
            } else {
              params[key] = selectedAsset.data[key]*stageW;
            }
          }
          sandboxComp.assetLibrary[selectedAsset.name].drawPreview(ctx,
            mousePos.x, mousePos.y, params);
        }
        sandboxComp.getRelativeXY = function() {
          var mousePos = getMousePos(previewCanvas, event);
          selectedAsset.data.x = mousePos.relX;
          selectedAsset.data.y = mousePos.relY;
        }

        sandboxComp.addAsset = function() {
          var assetData = {};
          for (var key in selectedAsset.data) {
            assetData[key] = selectedAsset.data[key];
          }
          if (sandboxComp.machine.assetList.hasOwnProperty(selectedAsset.name)) {
            sandboxComp.machine.assetList[selectedAsset.name].push(assetData);
          } else {
            sandboxComp.machine.assetList[selectedAsset.name] = [assetData];
          }
          console.log(sandboxComp.machine.assetList[selectedAsset.name])
          sandboxComp.resetSandbox();
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

      /* ----------------------- SANDBOX FUNCTIONS ------------------------ */
        sandboxComp.addGround = function() {
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
        }
        sandboxComp.clearSandbox = function() {
          World.clear(engine.world, false);
          sandboxComp.addGround();
        }
        // ideally matter.js asset creation functions will be in the assetLibrary database too
        sandboxComp.populatePlatforms = function(arr) {
          if (arr !== undefined && arr.length > 0) {
            var platforms = []
            arr.forEach(function(platform) {
              platforms.push(Bodies.rectangle(platform.x*stageW,
                platform.y*stageH,
                platform.width*stageW,
                platform.height*stageW,
                { isStatic: true, angle: platform.angle*Math.PI/180 }))
            });
            World.add(world, platforms);
          }
        }
        sandboxComp.populateBlocks = function(arr) {
          if (arr !== undefined && arr.length > 0) {
            var blocks = []
            arr.forEach(function(block) {
              blocks.push(Bodies.rectangle(block.x*stageW,
                block.y*stageH,
                block.width*stageW,
                block.height*stageW,
                { isStatic: false }));
            });
            World.add(world, blocks);
          }
        }
        sandboxComp.populatePendulums = function(arr) {
          if (arr !== undefined && arr.length > 0) {
            var cradles = [];
            arr.forEach(function(pendulum) {
              cradle = Composites.newtonsCradle(pendulum.x*stageW,
                pendulum.y*stageH, pendulum.count, pendulum.radius*stageW, pendulum.length*stageH);
              cradles.push(cradle);
            });
            World.add(world, cradles);
          }
        }
        sandboxComp.populateBalls = function(arr) {
          if (arr !== undefined && arr.length > 0) {
            var balls = []
            arr.forEach(function(ball) {
              balls.push(Bodies.circle(ball.x*stageW, ball.y*stageH, ball.radius*stageW));
            });
            World.add(world, balls);
          }
        }
        // and populateSandbox will simply iterate through each creator
        sandboxComp.populateSandbox = function() {
          console.log("populating:", sandboxComp.machine.assetList)
          sandboxComp.populateBalls(sandboxComp.machine.assetList.ball);
          sandboxComp.populateBlocks(sandboxComp.machine.assetList.block);
          sandboxComp.populatePendulums(sandboxComp.machine.assetList.pendulum);
          sandboxComp.populatePlatforms(sandboxComp.machine.assetList.platform);
        }
        sandboxComp.resetSandbox = function() {
          sandboxComp.clearSandbox();
          sandboxComp.populateSandbox();
        }
        sandboxComp.removeLastType = function(assetType) {
          sandboxComp.machine.assetList[assetType].pop();
          sandboxComp.resetSandbox();
        }

        sandboxComp.addGround();
        sandboxComp.populateSandbox();
        Engine.run(engine);
      }
    });
  }

  sandboxComp.$onDestroy = function() {}

}

SandboxCompCtrl.$inject = ['$state', '$window', 'DataServices', 'Auth'];
