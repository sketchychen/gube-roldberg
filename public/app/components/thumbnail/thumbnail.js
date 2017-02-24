angular.module('App')
  .component('thumbnailComp', {
    templateUrl: 'app/components/thumbnail/thumbnail.html',
    controller: ThumbnailCompCtrl,
    controllerAs: 'thumbnailComp',
    bindings: {
      machine: '<'
    }
  });


function ThumbnailCompCtrl() {
  // machine should be passed into this as an object
  // e.g. {
  //   __v: 0,
  //   _id: "58af5fbd3e13e737c7b69800",
  //   assetList: Object,
  //   name: "hello world!",
  //   user: Object,
  //   user_id: "58ab5299632f220d2bb80ea3
  // }

  var thumbnailComp = this;

  thumbnailComp.$onInit = function() {
    /* ------------------------ SET CANVAS SIZE ------------------------- */
    var sizing = 0.25;
    // var aspectRatio = 9 / 16;
    var thumbnailW = window.innerWidth * sizing;
    var thumbnailH = window.innerWidth * sizing;

    // console.log(thumbnailW, thumbnailH)
    // console.log(thumbnailComp.machine._id)
    var canvas = $("#thumbnail-" + thumbnailComp.machine._id + " canvas:first-child")[0];
    canvas.width = thumbnailW;
    canvas.height = thumbnailH;

    thumbnailComp.assetLibrary = ASSET_LIBRARY;
    // console.log(thumbnailComp.assetLibrary)
    // console.log(thumbnailComp.machine.assetList)


    thumbnailComp.drawThumbnail = function(canvas, assetList) {
      var ctx = canvas.getContext("2d");

      

      for (var type in assetList) { // for each type of asset
        assetList[type].forEach(function(data) { // for each asset of a specified type
          var asset = {
            x: data.x*thumbnailW,
            y: data.y*thumbnailH,
            params: {}
          }
          var skipFactoring = ['count', 'angle'];
          for (var key in data) { // filter out x and y from the other params
            if (key !== 'x' && key !== 'y') {
              if (skipFactoring.indexOf(key) > -1) {
                asset.params[key] = data[key];
              } else {
                asset.params[key] = data[key]*thumbnailW;
              }
            }
          }
          // draw each asset using its type's ASSET_LIBRARY's drawPreview function
          thumbnailComp.assetLibrary[type].drawPreview(ctx, asset.x, asset.y, asset.params);
        })
      }
    }

    thumbnailComp.drawThumbnail(canvas, thumbnailComp.machine.assetList);

  }



}

ThumbnailCompCtrl.$inject = [];
