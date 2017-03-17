/**
 * Created by zhangyaqiang on 2017/3/15.
 */
var app = angular.module('App', ['angular-popups']);

app.controller('Controller', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
	$scope.name = 'zuq';
	$scope.elementInfo = [];
	console.log('11');
	$scope.time = ''
	var video_id = document.getElementById($scope.video_Id);
	video_id.ontimeupdate=function(){tagtime_judge(this)};
	function tagtime_judge(event)
	{
		console.log('111');
		$scope.time = event.currentTime;
		$scope.$digest();
	}

	$http({method: 'GET', url: 'http://10.108.101.173:3000/api/getProjectAttributes/'+$scope.project_id})
		.then(function success(response) {
			//获取所有项目信息
			console.log(response.data);
			for (ele in response.data.result){
				ele = response.data.result[ele];
				//分类
				switch(ele.kind) {
					case 1:
						var temp = {_id: '' , kind: '',title:'', options:[], color: '', video_id: '', current_time: '', pic: '',
							start_time:'', end_time: '', link: '', left :'', top: '', voted: false, answer: -1, sta_info: []};
						// temp.project_id = $scope.current_project.project_id;
						temp._id = ele._id;
						temp.kind = '话题投票';
						temp.title = ele.titles[0];
						temp.color = ele.colors[0];
						// temp.video_id =
						temp.current_time = Number(ele.times[0]);
						temp.pic = ele.images[0];
						temp.link = ele.links[0];
						temp.left = ele.positions[0].l;
						temp.top = ele.positions[0].t;
						temp.options = ele.texts;
						temp.start_time = ele.times[1];
						temp.end_time = ele.times[2];
						var element = $.extend(true, {}, temp);
						$scope.elementInfo.push(element);
						break;
				}
			}
		},function error() {
			console.log('error');
		})
	console.log('444');

	$scope.vote = function (id) {
		console.log('1114444');
		for (ele in $scope.elementInfo){
			if($scope.elementInfo[ele]._id == id){
				break;
			}
		}
		url = 'http://10.108.101.173:3000/api/vote/' + id + '/' + $scope.elementInfo[ele].answer;
		$http({method:'POST', url: url})
			.then(function success(response) {
				var num = response.data.result.num;
				console.log(num);
				for(var i=0;i<num ;i++){
					console.log(i);
					$scope.elementInfo[ele].sta_info.push(response.data.result.data[i].count);
					console.log(response.data.result.data[i].count);
				}
				$scope.elementInfo[ele].voted = true;
				$scope.elementInfo[ele].sta_info[$scope.elementInfo[ele].answer] += 1;
			},function error() {

			})
	}
}]);

app.directive('interElement', function () {
	return {
		template: '<div ng-repeat="element in elementInfo">/' +
		'<div vote-element></div>/' +
		'<div photo-element></div>/' +
		'<div ad-element></div>/' +
		'</div>'
	}
});

app.directive('voteElement', function () {
	return {
		templateUrl: 'vote.html'
	}
});

app.directive('photoElement', function () {
	return {
		templateUrl: 'cloud_photo.html'
	}
});

app.directive('adElement', function () {
	return {
		templateUrl: 'ad_photo.html'
	}
})

