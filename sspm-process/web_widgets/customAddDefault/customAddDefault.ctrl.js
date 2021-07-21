function PbButtonCtrl($scope, $http, $location, $log, $window, localStorageService, modalService) {

  
  this.action = function action() {
    
    $scope.properties.targetArray = [...$scope.properties.itemsToAdd];
   
   const Toast = Swal.mixin({
                          toast: true,
                          position: 'top-end',
                          showConfirmButton: false,
                          timer: 3000
                        })
    
    Toast.fire({
      type: 'success',
      title: $scope.properties.textMessage
    })
    
  }

}
