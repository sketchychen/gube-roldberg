angular.module('App')
.component('sandboxComp', {
  templateUrl: 'app/containers/sandbox/sandbox.html',
  controller: SandboxCompCtrl,
  controllerAs: 'sandboxComp'
});

function SandboxCompCtrl($state, $window, DataServices, Auth){
  var sandboxComp = this;
  sandboxComp.user = Auth.currentUser();
  // console.log(sandboxComp.user);

  sandboxComp.machine = { user_id: "", name: "", assetList: [] }

  DataServices.getMachine($state.params.id).then(function(data) {
    if (data.data.user_id === sandboxComp.user.id) {
      sandboxComp.machine = data.data;
      // console.log(sandboxComp.machine)
    }
  });

  sandboxComp.oneAtATime = true;

  sandboxComp.assets = [
    {
      name: 'ball',
      diagram: '',
      parameters: ['radius']
    },
    {
      name: 'domino',
      diagram: '',
      parameters: ['width', 'height']
    },
    {
      name: 'pendulum',
      diagram: '',
      parameters: ['arm length', 'radius', 'count', 'offset angle']
    },
    {
      name: 'platform',
      diagram: '',
      parameters: ['width', 'height', 'angle']
    },
    // {
    //   name: 'launch ramp',
    //   diagram: '',
    //   parameters: ['radius']
    // }
  ];

  sandboxComp.addItem = function() {
    var newItemNo = sandboxComp.items.length + 1;
    sandboxComp.items.push('Item ' + newItemNo);
  };

  sandboxComp.status = {
    isCustomHeaderOpen: false,
    isFirstOpen: true,
    isFirstDisabled: false
  };




  sandboxComp.$onInit = function() {
    var sizing = 0.6;
    var aspectRatio = 9/16;
    var stageW = window.innerWidth * sizing;
    var stageH = window.innerWidth * sizing * aspectRatio;

    // bring in the matter.js stuff
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
        groundX = stageW/2,
        groundY = stageH-(groundH/2);
    var ground = Bodies.rectangle(groundX, groundY, groundW, groundH, { isStatic: true, render: { visible: true } });
    World.add(world, ground);



    var cradle = Composites.newtonsCradle(100, 100, 3, stageW*0.01, stageW*0.1);
    Body.translate(cradle.bodies[0], { x: -stageW*0.1, y: -stageW*0.1 });
    World.add(world, cradle);


    var balls = []
    for (var i=0; i<5; i++) {
      balls.push(Bodies.circle(10+i*60, 10+i*60, 10));
    }
    World.add(world, balls);


    Engine.run(engine);

  }

  sandboxComp.$onDestroy = function() {
  }

}

SandboxCompCtrl.$inject = ['$state', '$window', 'DataServices', 'Auth'];
