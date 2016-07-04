'use strict';

angular.module('shopnxApp')
  .controller('ContactCtrl', function ($scope, $modal,$log,$window) {
  	var vm = this;

  	var p = null;

  	$scope.openChat = function () {
  	   $window.open('https://ardath-chat.herokuapp.com', 'C-Sharpcorner', 'width=600,height=700');
  
  };

  $scope.messages = [
    {
      'username': 'username1',
      'content': 'Hi!'
    },
    {
      'username': 'username2',
      'content': 'Hello!'
    },
    {
      'username': 'username2',
      'content': 'Hello!'
    },
    {
      'username': 'username2',
      'content': 'Hello!'
    },
    {
      'username': 'username2',
      'content': 'Hello!'
    },
    {
      'username': 'username2',
      'content': 'Hello!'
    }
  ];

  $scope.username = 'username1';

  $scope.sendMessage = function(message, username) {
    if(message && message !== '' && username) {
      $scope.messages.push({
        'username': username,
        'content': message
      });
    }
  };
  $scope.visible = true;
  $scope.expandOnNew = true;

    $scope.message = 'Hello';
  })

  .controller('ChatInstanceCtrl', function ($scope,$rootScope,Auth,User,$cookieStore,$modalInstance,toastr, items) {
 
var vm = this;
  if($cookieStore.get('token')) {
      $scope.currentUser = User.get();
    }
  
  console.log($scope.currentUser);

  // console.log($rootScope.toMerge);

 


  $scope.you = {
        userId: '4562KDJYE72930DST283DFY202Dd',
        avatar: 'http://www.orangecountyjailministryorlando.com/wp-content/uploads/2015/01/Woman_Avatar.gif',
        userName: 'Anna'
    };

  

  $scope.sendMessage = function(message) {

      console.log('sendMessage');
      items.messages.push(message);
      

     console.log($rootScope.toDelete);
        

  };

  $scope.$on('simple-chat-message-posted', function() {
            console.log('onMessagePosted');
        });

  $scope.ok = function (items) {


    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

 
});

