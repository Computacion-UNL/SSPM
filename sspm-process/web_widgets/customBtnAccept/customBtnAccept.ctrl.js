function PbButtonCtrl($scope, $http, $location, $log, $window, localStorageService, modalService) {

     $scope.action = async function(){
      
        if($scope.properties.showNextTabs){
            const { value } = await Swal.fire({
                                  title: '¿Está seguro de aplicar el proceso a la carrera seleccionada?',
                                  text: "Es una acción que no se puede revertir",
                                  type: 'question',
                                  showCancelButton: true,
                                  customClass: {
                                    confirmButton: 'btn btn-success mr-5',
                                    cancelButton: 'btn btn-danger'
                                  },
                                  buttonsStyling: false,
                                  confirmButtonText: 'Si, continuar con el proceso!',
                                  cancelButtonText: 'Cancelar',
                                  footer: '<p class="text-primary"><b>Seguimiento al Sílabo y Plan de mejoras </b></p>',
                                });
                                  
            if (value) {
                $scope.properties.showNextTabs = !$scope.properties.showNextTabs;
                
                angular.element(document.getElementById("button")).triggerHandler('click');
            }   
        }
     }
}
