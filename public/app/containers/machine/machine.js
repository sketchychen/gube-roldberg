angular.module('App')
  .component('machineComp', {
    templateUrl: 'app/containers/machine/machine.html',
    controller: MachineCompCtrl,
    controllerAs: 'machineComp'
  });

function MachineCompCtrl($state, $window, DataServices, Auth) {
  var machineComp = this;
  machineComp.$onInit = function() {
  /* ---------------------- GRAB USER AND MACHINE DATA ---------------------- */
    machineComp.user = Auth.currentUser();

    DataServices.getMachine($state.params.id).then(function(data) {
        machineComp.machine = data.data;
        if (machineComp.machine.assetList === undefined) {
          machineComp.machine.assetList = {};
        }

      /* ------------------------ TOOLBOX INTERFACE ----------------------- */
      machineComp.status = {
        isCustomHeaderOpen: false,
        isFirstOpen: true,
        isFirstDisabled: false
      };

      /* ------------------- PUT AND DELETE TO BACK-END ------------------- */
        machineComp.copy = function() {
          DataServices.updateMachine($state.params.id, machineComp.machine).then(function(data) {
            console.log(data)
          });
        }

      /* ------------------------ SET CANVAS SIZE ------------------------- */
        var sizing = 0.6;
        var aspectRatio = 9 / 16;
        var stageW = window.innerWidth * sizing;
        var stageH = window.innerWidth * sizing;

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
          element: document.getElementById("machine-stage"),
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
        machineComp.addGround = function() {
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

        // ideally matter.js asset creation functions will be in the assetLibrary database too
        machineComp.populatePlatforms = function(list) {
          if (list.length > 0) {
            var platforms = []
            list.forEach(function(platform) {
              platforms.push(Bodies.rectangle(platform.x*stageW,
                platform.y*stageH,
                platform.width*stageW,
                platform.height*stageW,
                { isStatic: true, angle: platform.angle*Math.PI/180 }))
            });
            World.add(world, platforms);
          }
        }
        machineComp.populateBlocks = function(list) {
          if (list.length > 0) {
            var blocks = []
            list.forEach(function(block) {
              blocks.push(Bodies.rectangle(block.x*stageW,
                block.y*stageH,
                block.width*stageW,
                block.height*stageW,
                { isStatic: false }));
            });
            World.add(world, blocks);
          }
        }
        machineComp.populatePendulums = function(list) {
          if (list.length > 0) {
            var cradles = [];
            list.forEach(function(pendulum) {
              cradle = Composites.newtonsCradle(pendulum.x*stageW,
                pendulum.y*stageH, pendulum.count, pendulum.radius*stageW, pendulum.length*stageH);
              cradles.push(cradle);
            });
              World.add(world, cradles);
          }
        }
        machineComp.populateBalls = function(list) {
          if (list.length > 0) {
            var balls = []
            list.forEach(function(ball) {
              balls.push(Bodies.circle(ball.x*stageW, ball.y*stageH, ball.radius*stageW));
            });
            World.add(world, balls);
          }
        }
        // and populateMachine will simply iterate through each creator
        machineComp.populateMachine = function() {
          machineComp.populateBalls(machineComp.machine.assetList.balls);
          machineComp.populateBlocks(machineComp.machine.assetList.blocks);
          machineComp.populatePendulums(machineComp.machine.assetList.pendulums);
          machineComp.populatePlatforms(machineComp.machine.assetList.platforms);
        }
        machineComp.clearMachine = function() {
          World.clear(engine.world, false);
          machineComp.addGround();
        }
        machineComp.resetMachine = function() {
          machineComp.clearMachine();
          machineComp.populateMachine();
        }

        machineComp.addGround();
        machineComp.populateMachine();
        Engine.run(engine);

    });
  }

  machineComp.$onDestroy = function() {}

}

MachineCompCtrl.$inject = ['$state', '$window', 'DataServices', 'Auth'];
