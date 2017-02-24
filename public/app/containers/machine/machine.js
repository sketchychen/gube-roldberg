angular.module('App')
  .component('machineComp', {
    templateUrl: 'app/containers/machine/machine.html',
    controller: MachineCompCtrl,
    controllerAs: 'machineComp'
  });

function MachineCompCtrl($state, $window, DataServices, Auth) {
  var machineComp = this;
  /* -------------------------- SET CANVAS SIZE --------------------------- */
  var sizing = 0.6;
  var aspectRatio = 9 / 16;
  var stageW = window.innerWidth * sizing;
  var stageH = window.innerWidth * sizing;

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

  machineComp.$onInit = function() {
    /* ---------------------- GRAB USER AND MACHINE DATA ---------------------- */
    machineComp.user = Auth.currentUser();
    machineComp.userMatch = false;

    DataServices.getMachine($state.params.id).then(function(data) {
      machineComp.machine = data.data;
      if (machineComp.machine.assetList === undefined) {
        machineComp.machine.assetList = {};
      }

      DataServices.getUser(machineComp.machine.user_id).then(function(data) {
        machineComp.machine.user = data.data;
        machineComp.userMatch = (machineComp.user.id === machineComp.machine.user.id);
        // console.log(machineComp.userMatch)
      })


      /* -------------------------- TOOLBOX INTERFACE ------------------------- */
      machineComp.status = {
        isCustomHeaderOpen: false,
        isFirstOpen: true,
        isFirstDisabled: false
      };

      /* --------------------- PUT AND DELETE TO BACK-END --------------------- */
      // machineComp.copy = function() {
      //   DataServices.updateMachine($state.params.id, machineComp.machine).then(function(data) {
      //     console.log(data)
      //   });
      // }


      /* ----------------------- MATTER.JS WORLD SET UP ----------------------- */
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

      /* ------------------------- MACHINE FUNCTIONS -------------------------- */
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
      machineComp.clearMachine = function() {
          World.clear(engine.world, false);
          machineComp.addGround();
        }
        // ideally matter.js asset creation functions will be in the assetLibrary database too
      machineComp.populatePlatforms = function(arr) {
        if (arr !== undefined && arr.length > 0) {
          var platforms = []
          arr.forEach(function(platform) {
            platforms.push(Bodies.rectangle(platform.x * stageW,
              platform.y * stageH,
              platform.width * stageW,
              platform.height * stageW, {
                isStatic: true,
                angle: platform.angle * Math.PI / 180
              }))
          });
          World.add(world, platforms);
        }
      }
      machineComp.populateBlocks = function(arr) {
        if (arr !== undefined && arr.length > 0) {
          var blocks = []
          arr.forEach(function(block) {
            blocks.push(Bodies.rectangle(block.x * stageW,
              block.y * stageH,
              block.width * stageW,
              block.height * stageW, {
                isStatic: false
              }));
          });
          World.add(world, blocks);
        }
      }
      machineComp.populatePendulums = function(arr) {
        if (arr !== undefined && arr.length > 0) {
          var cradles = [];
          arr.forEach(function(pendulum) {
            cradle = Composites.newtonsCradle(pendulum.x * stageW,
              pendulum.y * stageH, pendulum.count, pendulum.radius * stageW, pendulum.length * stageH);
            cradles.push(cradle);
          });
          World.add(world, cradles);
        }
      }
      machineComp.populateBalls = function(arr) {
          if (arr !== undefined && arr.length > 0) {
            var balls = []
            arr.forEach(function(ball) {
              balls.push(Bodies.circle(ball.x * stageW, ball.y * stageH, ball.radius * stageW));
            });
            World.add(world, balls);
          }
        }
        // and populateMachine will simply iterate through each creator
      machineComp.populateMachine = function() {
        machineComp.populateBalls(machineComp.machine.assetList.ball);
        machineComp.populateBlocks(machineComp.machine.assetList.block);
        machineComp.populatePendulums(machineComp.machine.assetList.pendulum);
        machineComp.populatePlatforms(machineComp.machine.assetList.platform);
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

  machineComp.$onDestroy = function() {
    World.clear(engine.world, true);
    Render.stop(render);
    var element = document.getElementById("machine-stage");
    element.parentNode.removeChild(element);
  }

}

MachineCompCtrl.$inject = ['$state', '$window', 'DataServices', 'Auth'];
