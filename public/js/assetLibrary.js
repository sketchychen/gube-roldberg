var ASSET_LIBRARY = {
  'ball': {
    blurb: 'free-moving circle with weight, rolls around, particularly susceptible to external forces',
    diagram: '',
    parameters: {
      radius: { model: 0.01, min: 0.01, max: 0.25, step: 0.01, factor: 100 }
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
      width: { model: 0.01, min: 0.01, max: 0.5, step: 0.01, factor: 100 },
      height: { model: 0.01, min: 0.01, max: 0.5, step: 0.01, factor: 100 }
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
      length: { model: 0.1, min: 0.01, max: 0.5, step: 0.01, factor: 100 },
      radius: { model: 0.01, min: 0.01, max: 0.25, step: 0.01, factor: 100 },
      count: { model: 1, min: 1, max: 10, step: 1, factor: 1 },
      offset: { model: 0.01, min: 0, max: 3.60, step: 0.01, factor: 100 }
    },
    drawPreview: function(ctx, x, y, params) {
      // params: { radius, length, count }
      for (var i = 0; i < params.count; i++) {
        ctx.beginPath();
        ctx.moveTo(x + (2 * params.radius * i), y);
        ctx.lineTo(x + (2 * params.radius * i), y + params.length);
        ctx.arc(x + (2 * params.radius * i), y + params.length, params.radius, -Math.PI / 2, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
      }
    },
    active: false
  },
  'platform': {
    blurb: 'static rectangle, does not move, can be angled to make a ramp. set height much greater than width to make a wall',
    diagram: '',
    parameters: {
      width: { model: 0.25, min: 0.01, max: 0.5, step: 0.01, factor: 100 },
      height: { model: 0.01, min: 0.01, max: 0.5, step: 0.01, factor: 100 },
      angle: { model: 0, min: 0, max: 180, step: 1, factor: 1 }
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
  //   parameters: {
  //     width: { model: 0.01, min: 0.01, max: 0.5, step: 0.01, factor: 100 },
  //     height: { model: 0.01, min: 0.01, max: 0.5, step: 0.01, factor: 100 },
  //     arc: { model: 1, min: 1, max: 360, step: 1, factor: 1 }
  //   },
  //   drawPreview: function(ctx, x, y, params) {},
  //   active: false
  // }
};
