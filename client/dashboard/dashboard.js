angular.module('dashboard-module', [])
.controller('dashboardCtrl', function($scope, Services,$mdDialog, $mdMedia, $route, $sce) {
  $scope.events = {};

      // start uploading dashboard
      Services.uploadDashboard()
      .then(function(data){
        $scope.events.fetch = true;
        var myEvents = [];
        var eventsToJoin = [];

        //creating list of the events that current user attends or created himself
        data.forEach(function(item) {
          if(item.username===localStorage.getItem('username') && item.created_by === 0) {
            myEvents.push(
            {
              'eventname': item.eventname,
              'id': item.id,
              'timestamp': item.timestamp,
              'username': item.username,
              'createdBy': item.created_by,
              'status': 'unjoin'
            });
          }
          else if (item.username=== localStorage.getItem('username') && item.created_by ===1 ) {
            myEvents.push({
              'eventname': item.eventname,
              'id': item.id,
              'timestamp': item.timestamp,
              'username': item.username,
              'createdBy': item.created_by,
              'status': 'created by me'
            });
          }
        });

        //creating the list of events that are created by the user's friends, but aren't joined by the user
        data.forEach(function(item) {
          if (item.username!== localStorage.getItem('username') && item.created_by === 1) {
            eventsToJoin.push({
              'eventname': item.eventname,
              'id': item.id,
              'timestamp': item.timestamp,
              'username': item.username,
              'createdBy': item.created_by,
              'status': 'join'
            });
          }
        });

        $scope.events.list = eventsToJoin;
        $scope.events.eventsIgoTo = myEvents;
        }); // end of .then
      //end of uploading dashboard
      // join or unjoin event

      $scope.join = function(id, status) {
        //join
        if(status === 'join') {
          var joinInfo = {
            'eventId': id,
            'user': localStorage.getItem('username')
          };
          Services.joinEvent(joinInfo);
          $route.reload();
        }
        //unjoin
        else if(status === 'unjoin') {
        // delete the record about user's attendance from database
        Services.unjoinEvent(id); // this doesn't work for come reason.
      }

    };

    Services.uploadFriendslist()
    .then(function(data){
      //console.log("friendslist i got from server ", data.data)
      $scope.friends = data.data;
    });

      //pop up dialog box
      $scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
      $scope.showAdvanced = function(ev) {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
        $mdDialog.show({
          controller: DialogController,
          templateUrl: 'inviteForm.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true,
          fullscreen: useFullScreen
        })
        $scope.$watch(function() {
          return $mdMedia('xs') || $mdMedia('sm');
        }, function(wantsFullScreen) {
          $scope.customFullscreen = (wantsFullScreen === true);
        });
        }; //end of pop up dialog box.

        $scope.time = {
          value: new Date(2016, 3, 9)
        };

        $scope.click = function() {
          var eventInfo = {
            'event' : $scope.user.activity,
            'time' : $scope.time.value,
            'username': localStorage.getItem('username')
          }


          Services.eventsPost(eventInfo)
          .then(function(respData){
            //console.log('i got this back from server/database', respData);
            $route.reload(); //
          });
        };
      });