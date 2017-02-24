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

  homeComp.$onInit = function() {
    DataServices.getAllMachines().then(function(data) {
      homeComp.machines = data.data;
      console.log("machines", homeComp.machines)

      homeComp.machines.forEach(function(machine, index) {
        DataServices.getUser(machine.user_id).then(function(data) {
          homeComp.machines[index].user = data.data
        });

      });

    });


    // DataServices.searchRecipes(homeComp.query).then(function(data){
    //   homeComp.results = data.data;
    //   console.log("searchComp.results: ", homeComp.results)
    //   homeComp.query = "";
    // })
  }


  homeComp.$onDestroy = function() {}

}

HomeCompCtrl.$inject = ['$interval','$state', 'DataServices', 'AuthServices', 'Auth'];
