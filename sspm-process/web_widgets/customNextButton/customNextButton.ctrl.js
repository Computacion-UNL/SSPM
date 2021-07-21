function PbButtonCtrl($scope, $http, $location, $log, $window, localStorageService, modalService) {

  this.action = function action() {
    $scope.properties.buttonAction = true;
  };
}
