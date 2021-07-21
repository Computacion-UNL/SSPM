/**
 * The controller is a JavaScript function that augments the AngularJS scope and exposes functions that can be used in the custom widget template
 * 
 * Custom widget properties defined on the right can be used as variables in a controller with $scope.properties
 * To use AngularJS standard services, you must declare them in the main function arguments.
 * 
 * You can leave the controller empty if you do not need it.
 */
 function tableCntroller($scope) {
 
    this.isSelected = function(grade, selected) {
        
        if(selected){
            grade.amount--;
        }else{
            grade.amount++;
        }
    };
     
 }
