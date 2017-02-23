angular.module('App')
.component('dashboardComp', {
  templateUrl: 'app/containers/dashboard/dashboard.html',
  controller: DashboardCompCtrl,
  controllerAs: 'dashboardComp'
});

function DashboardCompCtrl($state, $window, DataServices, Auth){
  var dashboardComp = this;
  dashboardComp.user = Auth.currentUser();
  console.log(dashboardComp.user);


  DataServices.getUser(dashboardComp.user.id).then(function(data) {
    console.log(data.data)
  });

  dashboardComp.toggleUserGallery = false;
  DataServices.getUserMachines(dashboardComp.user.id).then(function(data) {
    dashboardComp.machines = data.data;
    console.log(dashboardComp.machines)
    if (dashboardComp.machines !== undefined) {
      dashboardComp.toggleUserGallery = true;
    }
  });

  dashboardComp.newMachine = function() {
    DataServices.createNewMachine({
      user_id: dashboardComp.user.id,
      name: "untitled",
      assetList: {}
    }).then(function(data) {
      console.log(data.data);
      $state.go('sandboxState', {id: data.data._id})
    });
  }

}

DashboardCompCtrl.$inject = ['$state', '$window', 'DataServices', 'Auth'];
