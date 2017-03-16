/**
 * Created by zhangyaqiang on 2017/1/11.
 */
var app = angular.module('App', ['angular-popups', 'ngFileUpload']);

var deafult_project = {project_name: 'Test', project_id: 000001};

//总体控制器
app.controller('MyController', ['$scope', '$rootScope', '$http', 'fileReader', function ($scope, $rootScope, $http, fileReader) {
	$rootScope.User = null;
	$rootScope.isAuthenticated = false;
	$rootScope.token = '';
	//项目信息 [{'project_id': xxx, 'project_name': xxx}, {'project_id': xxx, 'project_name': xxx}]
	$scope.projects = [];
	$scope.voteInfo = [];
	//当前项目
	$scope.current_project = {project_name: 'Test', project_id: 000001};
	$scope.getproject = function () {
		$http({method: 'GET', url: 'http://10.108.101.173:3000/project/getProjects', data: '',
				headers: {'x-access-token': $rootScope.token}})
			.then(function success(response) {
				$scope.projects = response.data.result;
				$scope.current_project = $scope.projects[0];
				$scope.project_info();
			},function error(data, status, headers, config) {
				consolfae.log('error');
			});
	};
	$scope.change_project = function (project) {
		$scope.current_project = project;
		$scope.voteInfo = [];
		//切换项目时刷新数据
		$scope.project_info();
	};
	//获取项目信息
	$scope.project_info = function () {
		$http({method: 'POST', url: 'http://10.108.101.173:3000/project/getAllElements', data: {project_Id: $scope.current_project.project_id},
				headers: {'x-access-token': $rootScope.token}})
			.then(function success(response) {
				//获取所有项目信息
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
							$scope.voteInfo.push(element);
							break;
					}
				}
			},function error() {
				console.log('error');
			})
	};

	$scope.element_info = function () {
		var data = $scope.current_project.project_id;
		$http({method: 'POST', url: '/project/getAttributes', data: $scope.current_project})
			.then(function success(response) {
				console.log('elementAdmin');
				$scope.elements = response.data;
			},function error() {
				console.log('error');
			})
	};
	$scope.logout = function () {
		$http({method: 'GET', url: 'http://10.108.101.173:3000/user/logout',
			headers: {'Content-Type': 'application/left-www-form-urlencoded',
				'x-access-token': $rootScope.token}})
			.then(function success(response,data, status, headers, config) {
				if (response.data.status == 0){
					$rootScope.User = null;
					$rootScope.isAuthenticated = false;
					$scope.loginerror = false;
					$scope.projects = [];
					$scope.current_project = deafult_project;
					$rootScope.token = '';
					console.log('logout')
				}
			},function error(data, status, headers, config) {
				console.log('logout error!');
			})
	};
}]);

//登录模块
app.controller('Login', ['$scope', '$rootScope', '$http', '$window', function ($scope, $rootScope, $http, $window) {
	$scope.user = {username: "", password: ""};
	$scope.loginerror = false;
	$scope.welclome = '';
	$scope.message = '';

	//原始方法
	$scope.submit = function () {
		$http({method: 'POST', url: 'http://10.108.101.173:3000/user/login', data: $scope.user,
			headers: {'x-access-token': $rootScope.token}})
			.then(function success(response,data, status, headers, config) {
				console.log(response.data);
				if (response.data.status == 0){
					$rootScope.User = $scope.user.username;
					$rootScope.isAuthenticated = true;
					$rootScope.token = response.data.token;
					$scope.getproject();
				}
			},function error(data, status, headers, config) {
				$scope.loginerror = true;
			})
	};
}]);

//注册模块
app.controller('Register', ['$scope', '$rootScope', '$http', '$window', function ($scope, $rootScope, $http, $window) {
	$scope.register = {username: '', password:''};
	$scope.pwd_confirm = '';
	$scope.illegal = false;
	$scope.pwd_inconsistent = true;

	$scope.submit = function () {
		$http({method: 'POST', url: '10.108.101.173:3000/user/register', data: $scope.register,
			headers: {'Content-Type': 'application/left-www-form-urlencoded',
				'x-access-token': $rootScope.token}})
			.then(function success() {
				console.log('register success!');
				$rootScope.User = $scope.register.username;
				$rootScope.isAuthenticated = true;
			},function error() {
				$scope.illegal = true;
			})
	};

}]);

//元素管理
app.controller('elementAdmin', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
	
	$scope.data = {pic: '/images/banner.png'};
	$scope.delete = function (id) {
		for (ele in $scope.voteInfo){
			if($scope.voteInfo[ele]._id == id){
				// var index = i;
				break;
			}
		}
		$http({method:'POST', url: 'http://10.108.101.173:3000/element/delete', data: {element_Id: id},
			headers: {'x-access-token': $rootScope.token}})
			.then(function success(response) {
				$scope.voteInfo.splice(ele,1);
			},function error() {

			})
	}
	
}]);


//创建新项目
app.controller('createProject', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
	$scope.project_name = '';
	$scope.create_success = false;
	$scope.create_project = function () {
		$http({method: 'POST', url: 'http://10.108.101.173:3000/project/create', data: $scope.project_name,
				headers:{'x-access-token': $rootScope.token}})
			.then(function success(response) {
				$scope.projects.push(response.data);
				change_project(response.data.project_Id);
			},function error() {
				console.log('create error');
			})
	}
}]);

//话题投票模块
app.controller('topicVote', ['$scope', '$rootScope', '$http', 'fileReader', 'Upload',function ($scope, $rootScope, $http, fileReader, Upload) {
	$scope.video_url = 'video/sample.mp4';
	$scope.url = '';
	$scope.seturl = function () {
		$scope.video_url = $scope.url;
	};
	$scope.default_pic = 'images/banner.png';
	$scope.pic_name = '';
	$scope.pic_file = null;
	$scope.current_pattern = {_id: '' , kind: 1,title:'who?', options:['me', 'you'], name: '', color: '0', video_id: '1', current_time: '', pic: 'images/banner.png',
		start_time: 0, end_time: 0, link: 'www.baidu.com', left :300, top: 300, voted: false, answer: -1, sta_info: []};

	//投票问题增减
	$scope.delete_option = function (index) {
		$scope.current_pattern.options.splice(index,1)
	};
	$scope.add_option = function (vote) {
		$scope.current_pattern.options.push("answer")
	};

	//计算位置
	$scope.add_hotpoint = function (mouseEvent) {
		var video = angular.element(mouseEvent.toElement);
		video[0].pause();
		var width = video[0].width;
		var height = video[0].height;
		$scope.current_pattern.current_time = video[0].currentTime;
		if (!mouseEvent){
			mouseEvent = window.event;
		}

		if (mouseEvent.pageX || mouseEvent.pageY){
			$scope.current_pattern.left = mouseEvent.pageX;
			$scope.current_pattern.top = mouseEvent.pageY;
		}
		else if (mouseEvent.clientX || mouseEvent.clientY){
			$scope.current_pattern.left = mouseEvent.clientX + document.body.scrollLeft +
				document.documentElement.scrollLeft;
			$scope.current_pattern.top = mouseEvent.clientY + document.body.scrollTop +
				document.documentElement.scrollTop;
		}

		if (mouseEvent.target){
		    var offEl = mouseEvent.target;
		    var offX = 0;
		    var offY = 0;
		    if (typeof(offEl.offsetParent) != "undefined"){
		        while (offEl){
		            offX += offEl.offsetLeft;
		            offY += offEl.offsetTop;
		            offEl = offEl.offsetParent;
		        }
		    }
		    else{
		        offX = offEl.left;
		        offY = offEl.top;
		    }

		    $scope.current_pattern.left -= offX;
		    $scope.current_pattern.top -= offY;
		}
	};

	//更新banner图片
	$scope.getFile = function () {
		fileReader.readAsDataUrl($scope.file, $scope)
			.then(function (result) {
				$scope.current_pattern.pic = result;
			})
	};

	//获取播放器播放信息
	var video_id = document.getElementById('topic_vote_video');
	video_id.ontimeupdate=function(){tagtime_judge(this)};
	function tagtime_judge(event)
	{
		$scope.time = event.currentTime;
		$scope.$digest();
	}

	//确认添加元素
	$scope.add_element =function () {

		var p = $.extend(true, {}, $scope.current_pattern);

		temp = {colors: [],images: [], kind: '', links: [], name: [],
			positions: [], sizes: [], texts: [], times: [], titles: [], _id: ''}
		temp.colors.push($scope.current_pattern.color);
		temp.images.push($scope.pic_name);
		temp.kind = $scope.current_pattern.kind;
		temp.links.push($scope.current_pattern.link);
		temp.positions.push({t: $scope.current_pattern.left,l: $scope.current_pattern.top,w: 0, h: 0});
		temp.texts = $scope.current_pattern.options;
		temp.times.push($scope.current_pattern.current_time);
		temp.times.push($scope.current_pattern.start_time);
		temp.times.push($scope.current_pattern.end_time);
		temp.name = $scope.current_pattern.name;
		temp.titles.push($scope.current_pattern.title);
		all = {properties: temp, project_Id: $scope.current_project.project_id};


		$http({method:'POST', url:'http://10.108.101.173:3000/element/create', data:all,
				headers:{'x-access-token': $rootScope.token}})
			.then(function success(response) {
				console.log(response.data);
				temp._id = response.data.result;
				p._id = response.data.result;
				//发送选项数目
				len = $scope.current_pattern.options.length;
				$http({method: 'POST', url: 'http://10.108.101.173:3000/element/updateVoteNum', data: {element_Id:response.data.result, num: len},
						headers: {'x-access-token': $rootScope.token}})
					.then(function success(response) {
						console.log(response.data);
						console.log('update');
					},function error() {

					})
				//上传图片
				$scope.upload(response.data.result, $scope.pic_file, $scope.current_pattern.name);
		},function error() {
			//传图片
		});
		$scope.upload = function (_Id, file, name) {
			console.log('upload');
			Upload.upload({url:'http://10.108.101.173:3000/image/upload',
				data:{element_Id: _Id, file_name: name, file: file},
				}).success(function () {
						console.log('upload');
				}).error(function () {

			})

		}
		switch (p.kind){
			case 1:
				p.kind = '话题投票';
				break;
		}
		$scope.voteInfo.push(p);
	};
}]);

//投票操作
app.controller('Vote', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {

	$scope.vote = function (id) {
		for (ele in $scope.voteInfo){
			if($scope.voteInfo[ele]._id == id){
				break;
			}
		}
		url = 'http://10.108.101.173:3000/api/vote/' + id + '/' + $scope.voteInfo[ele].answer;
		$http({method:'POST', url: url})
			.then(function success(response) {
				var num = response.data.result.num;
				console.log(num);
				for(var i=0;i<num ;i++){
					console.log(i);
					$scope.voteInfo[ele].sta_info.push(response.data.result.data[i].count);
					console.log(response.data.result.data[i].count);
				}
				$scope.voteInfo[ele].voted = true;
			},function error() {

			})
	}
}]);

//云图
app.controller('cloudPicture', ['$scope', function ($scope) {
	$scope.video_url = 'video/sample.mp4';
	$scope.url = '';
	$scope.seturl = function () {
		$scope.video_url = $scope.url;
	};
	$scope.new_element = [];
	$scope.cloudInfo = [];

	//添加新元素
	$scope.add_element = function () {
		var temp = $.extend(true, {}, $scope.new_element);
		$socpe.cloudInfo.push(temp);
	}
}])

//文件读取指令
app.directive('fileModel', ['$parse', function ($parse) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs, ngModel) {
			var model = $parse(attrs.fileModel);
			var modelSetter = model.assign;
			element.bind('change', function(event){
				scope.$apply(function(){
					modelSetter(scope, element[0].files[0]);
				});
				//附件预览
				scope.file = (event.srcElement || event.target).files[0];
				scope.getFile();
			});
		}
	};
}]);

//文件读取服务
app.factory('fileReader', ["$q", "$log", function($q, $log){
	var onLoad = function(reader, deferred, scope) {
		return function () {
			scope.$apply(function () {
				deferred.resolve(reader.result);
			});
		};
	};

	var onError = function (reader, deferred, scope) {
		return function () {
			scope.$apply(function () {
				deferred.reject(reader.result);
			});
		};
	};

	var getReader = function(deferred, scope) {
		var reader = new FileReader();
		reader.onload = onLoad(reader, deferred, scope);
		reader.onerror = onError(reader, deferred, scope);
		return reader;
	};

	var readAsDataURL = function (file, scope) {
		var deferred = $q.defer();
		var reader = getReader(deferred, scope);
		reader.readAsDataURL(file);
		return deferred.promise;
	};

	return {
		readAsDataUrl: readAsDataURL
	};
}]);

//link
app.controller('linkCount', ['$scope', 'Upload', '$timeout', function ($scope, Upload, $timeout) {
	$scope.data = {
		file: null
	};
	$scope.upload = function () {
		if (!$scope.data.file) {
			return;
		}

		var url = $scope.params.url;  //params是model传的参数，图片上传接口的url
		var data = angular.copy($scope.params.data || {}); // 接口需要的额外参数，比如指定所上传的图片属于哪个用户: { UserId: 78 }
		data.file = $scope.data.file;

		Upload.upload({
			url: url,
			data: data
		}).success(function (data) {
			$scope.hide(data);
		}).error(function () {
			logger.log('error');
		});
	};
	$scope.num = 'p';
}]);

