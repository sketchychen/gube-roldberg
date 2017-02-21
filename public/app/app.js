angular.module('App', ['ui.router', 'ui.bootstrap'])
.config([
  '$stateProvider',
  '$urlRouterProvider',
  '$locationProvider',
  function(
    $stateProvider,
    $urlRouterProvider,
    $locationProvider
  ){
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);

    $stateProvider
    .state('homeState', {
      url: '/',
      component: 'homeComp'
    })
    .state('dashboardState', {
      url: '/dashboard',
      component: 'dashboardComp'
    })
    .state('authState', {
      url: '/auth',
      component: 'authComp'
    })
    .state('machineState', {
      url: '/machines/:id',
      component: 'machineComp'
    })
    .state('sandboxState', {
      url: '/sandbox/:id',
      component: 'sandboxComp'
    })
  }

])
.config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
}])
.run(['$transitions', '$window', function($transitions, $window){
  $window.alerts = [];
  $transitions.onStart({ to: 'dashboardState'}, function(trans){
    var Auth = trans.injector().get('Auth')
    if(!Auth.isLoggedIn()){
      $window.alerts.push({msg: 'Must be logged in to access', type: 'danger'});
      return trans.router.stateService.target('authState');
    }
  })
}]);
