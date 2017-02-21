angular.module('App')
.component('homeComp', {
  templateUrl: 'app/containers/home/home.html',
  controller: HomeCompCtrl,
  controllerAs: 'homeComp'
});

function HomeCompCtrl($interval, $state, DataServices, AuthServices, Auth){
  var homeComp = this;

  homeComp.query = "";

  homeComp.search = function() {
    $state.go('searchState', {query: homeComp.query})
  }

  DataServices.getAllMachines().then(function(data) {
    homeComp.machines = data.data;
  })

  // DataServices.searchRecipes(homeComp.query).then(function(data){
  //   homeComp.results = data.data;
  //   console.log("searchComp.results: ", homeComp.results)
  //   homeComp.query = "";
  // })


}

HomeCompCtrl.$inject = ['$interval','$state', 'DataServices', 'AuthServices', 'Auth'];
