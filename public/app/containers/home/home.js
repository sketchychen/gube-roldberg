angular.module('App')
.component('homeComp', {
  templateUrl: 'app/containers/home/home.html',
  controller: HomeCompCtrl,
  controllerAs: 'homeComp'
});

function HomeCompCtrl($interval, $state, DataServices, AuthServices, Auth){
  var homeComp = this;

  homeComp.query;

  homeComp.$onInit = function() {
    DataServices.getAllMachines().then(function(data) {
      homeComp.machines = data.data;
      // console.log("machines", homeComp.machines)

      homeComp.machines.forEach(function(machine, index) {
        DataServices.getUser(machine.user_id).then(function(data) {
          homeComp.machines[index].user = data.data
        });

      });

    });

  }


  homeComp.$onDestroy = function() {
    homeComp = null;
  }

}

HomeCompCtrl.$inject = ['$interval','$state', 'DataServices', 'AuthServices', 'Auth'];
