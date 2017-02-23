angular.module('App')
.component('thumbnailComp', {
  templateUrl: 'app/component/thumbnail/thumbnail.html',
  controller: ThumbnailCompCtrl,
  controllerAs: 'thumbnailComp',
  bindings: {
    machine: '<',
    width: '<',
    height: '<'
  }
});


function ThumbnailCompCtrl(){
  // width and height are numbers (floats, presumably)
  // machine is passed into this as an object
  // e.g. {
  //   __v: 0,
  //   _id: "58af5fbd3e13e737c7b69800",
  //   assetList: Object,
  //   name: "hello world!",
  //   user: Object,
  //   user_id: "58ab5299632f220d2bb80ea3
  // }

  var thumbnailComp = this;

  thumbnailComp.assetLibrary = ASSET_LIBRARY;
  console.log(thumbnailComp.assetLibrary)

  thumbnailComp.drawThumbnail = function(canvas, assetList) {
    var ctx = canvas.getContext("2d");
    for (var type in assetList) { // for each type of asset
      assetList[type].forEach(function(data){ // for each asset of a specified type
        var asset = {
          x: assetList[type].x,
          y: assetList[type].y,
          params: {}
        }
        for (var key in assetList[type]) { // filter out x and y from the other params
          if (key !== 'x' || key !== 'y') {
            asset.params[key] = assetList[type][key];
          }
        }
        // draw each asset using its type's ASSET_LIBRARY's drawPreview function
        thumbnailComp.assetLibrary[type].drawPreview(ctx, asset.x, asset.y, asset.params);
      })
    }
  }

}

ThumbnailCompCtrl.$inject = [];
