angular.module('App')
.component('sandboxComp', {
  templateUrl: 'app/containers/sandbox/sandbox.html',
  controller: SandboxCompCtrl,
  controllerAs: 'sandboxComp'
});

function SandboxCompCtrl($state, $window, DataServices, Auth){
  var sandboxComp = this;
  /* --------------------- GRAB USER AND MACHINE DATA --------------------- */
  sandboxComp.user = Auth.currentUser();
  sandboxComp.machine = { user_id: "", name: "", assetList: [] }
  DataServices.getMachine($state.params.id).then(function(data) {
    if (data.data.user_id === sandboxComp.user.id) { // check for authorization
      sandboxComp.machine = data.data;
    }
  });

  /* --------------------- POPULATE TOOLBOX INTERFACE --------------------- */
  sandboxComp.oneAtATime = true;
  sandboxComp.assets = [
    {
      name: 'ball',
      blurb: 'free-moving circle with weight, rolls around, particularly susceptible to external forces',
      diagram: '',
      parameters: ['radius']
    },
    {
      name: 'block',
      blurb: 'free-moving rectangle with weight. set the height much greater than the width to make a domino',
      diagram: '',
      parameters: ['width', 'height']
    },
    {
      name: 'pendulum',
      blurb: 'free-moving circular weight on a line hanging from a fixed point. increase the count to make a newton\'s cradle',
      diagram: '',
      parameters: ['length', 'radius', 'count', 'offset']
    },
    {
      name: 'platform',
      blurb: 'static rectangle, does not move, can be angled to make a ramp',
      diagram: '',
      parameters: ['width', 'height', 'angle']
    },
    // {
    //   name: 'launch ramp',
    //   blurb: '',
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


    // example newton's cradle
    var cradle = Composites.newtonsCradle(100, 100, 3, stageW*0.01, stageW*0.1);
    Body.translate(cradle.bodies[0], { x: -stageW*0.1, y: -stageW*0.1 });
    World.add(world, cradle);

    // example array of balls
    var balls = []
    for (var i=0; i<5; i++) {
      balls.push(Bodies.circle(10+i*60, 10+i*60, 10));
    }
    World.add(world, balls);


    Engine.run(engine);


    function getMousePos(canvas, event) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }


    var previewCanvas = document.createElement("canvas");
    var ctx = render.canvas.getContext("2d");

    // DRAW BASIC RECTANGLES
    function rect(x, y, w, h) {
      ctx.beginPath();
      ctx.rect(x,y,w,h);
      ctx.closePath();
      ctx.fill();
    }

    render.canvas.addEventListener('mousemove', function(event) {
        var mousePos = getMousePos(render.canvas, event);
        var message = 'Mouse absolute position: ' + mousePos.x + ', ' + mousePos.y
            + '\nMouse relative position: ' + (mousePos.x/stageW).toFixed(2) + ', ' + (mousePos.y/stageH).toFixed(2);
        var display = document.getElementById("mouse-coordinates");
        display.innerText = message;
        rect(mousePos.x, mousePos.y, 10, 10);
      }, false);

  }

  sandboxComp.$onDestroy = function() {
  }

}

SandboxCompCtrl.$inject = ['$state', '$window', 'DataServices', 'Auth'];
