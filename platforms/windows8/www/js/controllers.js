angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {
})

.controller('AddressesCtrl', function($scope, Adresseses) {
  //$scope.addresses = Addresses.all();
  $scope.addresses=[
    { id: 0, name: 'Scruff McGruff' },
    { id: 1, name: 'G.I. Joe' },
    { id: 2, name: 'Miss Frizzle' },
    { id: 3, name: 'Ash Ketchum' }
  ];
})

.controller('AddressDetailCtrl', function($scope, $stateParams, Addresses) {
  $scope.address = Addresses.get($stateParams.addressId);
})

.controller('AccountCtrl', function($scope) {
});
