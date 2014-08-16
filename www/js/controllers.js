angular.module('starter.controllers', [])
.controller('DashCtrl', function($scope, UserService) {
  UserService.authenticate();
})
.controller('ShareCtrl',function($scope){
})
.controller('AddressesCtrl', function($scope, $state, Addresses) {
    //console.log(addresses);
    //$scope.addresses=addresses; //resolved
    Addresses.all(function(value){
      $scope.addresses=value;
    });
})
.controller('AddressCreateCtrl',function($scope,$state,Addresses,BusyService){
	$scope.address=[];
	$scope.create=function(){
    BusyService.show();
		Addresses.create($scope.address).then(function(response){
        console.log(response);
        BusyService.hide();
        $state.go('app.addresses');
    },function(response){
      BusyService.hide();
      console.log(response);
    });
	}
})
.controller('AddressDetailCtrl', function($scope, $state, $stateParams, Addresses, BusyService) {
  $scope.address=Addresses.get($stateParams.addressId);
  $scope.addressId=$stateParams.addressId;
  $scope.delete=function(addressId){
    BusyService.show();
    Addresses.delete(addressId).then(
      function(data){
        BusyService.hide();
    		console.log('delete success');
    		$state.go('app.addresses');
  	 },
  	function(data){
      BusyService.hide();
  		console.log('delete fail');
  	});
  }
})
.controller('AddressEditCtrl', function($scope, $stateParams, $state, Addresses, BusyService){
	$scope.address=Addresses.copy($stateParams.addressId);
	$scope.addressId=$stateParams.addressId;
	$scope.edit=function(index){
    BusyService.show();
		if(! angular.equals($scope.addressClone,$scope.address)){
			Addresses.put($scope.address).then(function(response){
        console.log(response);
        BusyService.hide();
        $state.go('app.addresses');
      },function(response){
        BusyService.hide();
        console.log(response);
      });
		}
	}
})

.controller('CardCtrl', function($scope) {
})

/*Controller for all of app to detect http authourization*/
.controller('AppCtrl', function($scope, $state, $ionicModal) {
   
  $ionicModal.fromTemplateUrl('templates/login.html', function(modal) {
      $scope.loginModal = modal;
    },
    {
      scope: $scope,
      animation: 'slide-in-up',
      focusFirstInput: true
    }
  );
  //Be sure to cleanup the modal by removing it from the DOM
  $scope.$on('$destroy', function() {
    $scope.loginModal.remove();
  });
  /*Register Modal*/
  $ionicModal.fromTemplateUrl('templates/register.html', function(modal) {
      $scope.registerModal = modal;
    },
    {
      scope: $scope,
      animation: 'slide-in-up',
      focusFirstInput: true
    }
  );
  //Be sure to cleanup the modal by removing it from the DOM
  $scope.$on('$destroy', function() {
    $scope.registerModal.remove();
  });

})
/*Login Controller */
.controller('LoginCtrl', function($scope, $http, $ionicModal, $state, Facebook, FacebookService, AuthenticationService, localStorageService) {
  $scope.message = "";
  // Define user empty data :/
  $scope.user = {};
      
  // Defining user logged status
  $scope.logged = false;
  $scope.login = function() {
    AuthenticationService.login($scope.user);
  };
  $scope.facebook = function() {
    Facebook.getLoginStatus(function(response) {
      if (response.status == 'connected') {
        $scope.logged = true;
        FacebookService.me(); 
      }
      else
        $scope.fbLogin();
    },true);
  };
  //Include permissions object as second parameter
  $scope.fbLogin = function() {
   Facebook.login(function(response) {
      if (response.status == 'connected') {
        $scope.logged = true;
        var user=FacebookService.me();
        user.facebook_id=user.id;
        user.password=user.id;
        localStorageService.set('user',user);
      }
    },Facebook.permissions());
  };
  $scope.register= function(){
    $scope.registerModal.show();
  };
  $scope.$on('event:auth-loginRequired', function(e, rejection) {
  	$scope.user=AuthenticationService.getUser();
  	if($scope.user.email && $scope.user.password){
  		AuthenticationService.login($scope.user);
  	}
    $scope.loginModal.show();
  });
 
  $scope.$on('event:auth-loginConfirmed', function() {
     $scope.email = null;
     $scope.password = null;
     $scope.loginModal.hide();
     $scope.registerModal.hide();
  });
  
  $scope.$on('event:auth-login-failed', function(e, status) {
    var error = "Login failed.";
    console.log(status);
    if (status == 400) {
      error = "Invalid email or Password. Did you activate the account? Check email";
    }
    $scope.message = error;
  });
 
  $scope.$on('event:auth-logout-complete', function() {
    $state.go('app.dash', {}, {reload: true, inherit: false});
  });    
})
.controller('RegisterCtrl',function($scope,$state, $ionicPopup, AuthenticationService, UserService, BusyService, localStorageService){
  $scope.register=function(user,form){
    $scope.submitted=true;
    if(! form.$invalid){
      BusyService.show();
      UserService.create(user).then(function(response){
        console.log(response);
        BusyService.hide();
        if(response.error){
          $scope.message=response.error.email;
        }else{
          if(response.user){
            console.log(response.user);
            var newUser=response.user;
            newUser.password=user.password;
            console.log('newuser',newUser);
            localStorageService.set('user',newUser);
            var alertPopup = $ionicPopup.alert({
               title: 'Before you continue...',
               template: 'An email hase been sent to validate your account, please return after you have activated your account'
            });
            alertPopup.then(function(res) {
              console.log('state');
              $scope.loginModal.hide();
              $scope.registerModal.hide();
              $state.go('app.dash');
            },function(res){
                console.log('fail');
            });
          }
        }
      },function(response){
        BusyService.hide();
        console.log('error',response);
      });
    }
    
  }
})
.controller('LogoutCtrl', function($scope, AuthenticationService) {
    AuthenticationService.logout();
});
