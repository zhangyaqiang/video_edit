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
	$scope.elementInfo = [];
	//当前项目
	$scope.current_project = {project_name: 'Test', project_id: 000001};
	$scope.getproject = function () {
		$http({method: 'GET', url: 'http://10.108.101.173:3000/project/getProjects', data: '',
				headers: {'x-access-token': $rootScope.token}})
			.then(function success(response) {
				console.log(response.data);
				$scope.projects = response.data.result;
				if ($scope.projects.length == 0) {
					$scope.current_project = {};
				}else {
					$scope.current_project = $scope.projects[0];
					$scope.project_info();
				}
			},function error(data, status, headers, config) {
				consolfae.log('error');
			});
	};
	$scope.change_project = function (project) {
		$scope.current_project = project;
		$scope.elementInfo = [];
		//切换项目时刷新数据
		$scope.project_info();
	};
	//获取项目信息
	$scope.project_info = function () {
		$http({method: 'GET', url: 'http://10.108.101.173:3000/api/getProjectAttributes/'+$scope.current_project.project_id,
				headers: {'x-access-token': $rootScope.token}})
			.then(function success(response) {
				console.log(111,response.data);
				//获取所有项目信息
				for (ele in response.data.result){
					e = response.data.result[ele];
					//分类
					switch(e.kind) {
						case 1:
							var temp = {_Id: '' , kind: '',title:'', options:[], color: '', video_id: '', current_time: '', pic: '',
								start_time:'', end_time: '', link: '', left :'', top: '', voted: false, answer: -1, sta_info: []};
							temp._Id = e._id;
							temp.kind = '话题投票';
							temp.title = e.titles[0];
							temp.color = e.colors[0];
							temp.name = e.name;
							temp.current_time = Number(e.times[0]);
							temp.pic = 'http://10.108.101.173:3000/'+e.images[0];
							temp.link = e.links[0];
							temp.left = e.positions[0].l;
							temp.top = e.positions[0].t;
							temp.options = e.texts;
							temp.start_time = e.times[1];
							temp.end_time = e.times[2];
							var element = $.extend(true, {}, temp);
							$scope.elementInfo.push(element);
							break;
						case 2:
							var temp = {_Id: '' , kind: '',title:'', pic: '', link: '', positions: [], times: [], name: ''};
							temp._Id = e._id;
							temp.kind = '云图云窗';
							temp.title = e.titles[0];
							temp.name = e.name;
							temp.pic = 'http://10.108.101.173:3000/'+e.images[0];
							temp.link = e.links[0];
							temp.positions = e.positions;
							for(t in e.times){
								e.times[t] = Number(e.times[t]);
							}
							temp.times = e.times;
							var element = $.extend(true, {}, temp);
							$scope.elementInfo.push(element);
							break;
						case 3:
							var temp = {_Id: '' , kind: '',title:'', pic: '', link: '', color:'', positions: [], times: [], name: '', description: '', show: false};
							temp._Id = e._id;
							temp.kind = '广告云窗';
							temp.title = e.titles[0];
							temp.description = e.description;
							temp.name = e.name;
							temp.pic = 'http://10.108.101.173:3000/'+e.images[0];
							temp.link = e.links[0];
							temp.color = e.colors[0];
							temp.positions = e.positions;
							for(t in e.times){
								e.times[t] = Number(e.times[t]);
							}
							temp.times = e.times;
							var element = $.extend(true, {}, temp);
							$scope.elementInfo.push(element);
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
	//删除项目
	$scope.del_project;
	$scope.delete_project = function (id) {
		console.log('delete')
		for (p in $scope.projects) {
			if ($scope.projects[p].project_id == id) {
				$scope.del_project = p;
				break;
			}
		}
	}

	$scope.confirm_delete = function () {
		$http({method: 'POST', url: 'http://10.108.101.173:3000/project/delete',
			data: {project_Id: $scope.projects[$scope.del_project].project_id},
			headers: {'x-access-token': $rootScope.token}})
			.then(function success(response) {
				console.log(response.data);
				$scope.projects.splice(p, 1);
				$scope.change_project($scope.projects[0]);
			},function error() {

			})
	}
	
	//
	$scope.player;
	var video_id = document.getElementById('ad_photo_video');
	function getElementLeft(element){
		var actualLeft = element.offsetLeft;
		var current = element.offsetParent;
		while (current !== null){
			actualLeft += current.offsetLeft;
			current = current.offsetParent;
		}
		return actualLeft;
	}
	function getElementTop(element){
		var actualTop = element.offsetTop;
		var current = element.offsetParent;
		while (current !== null){
			actualTop += current.offsetTop;
			current = current.offsetParent;
		}
		return actualTop;
	}
	function pausecomp(millis)
	{
		var date = new Date();
		var curDate = null;
		do { curDate = new Date(); }
		while(curDate-date < millis);
	}


	$scope.player_info = function () {
		setTimeout(function(){
			$scope.player = {top: getElementTop(video_id), left: getElementLeft(video_id), width: video_id.width, height: video_id.height}
			console.log($scope.player);
		}, 200);
	}
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
		$http({method: 'POST', url: 'http://10.108.101.173:3000/user/register', data:$scope.register,
			headers: {'x-access-token': $rootScope.token}})
			.then(function success(response) {
				console.log('register success!', response.data);
				if (response.data.status == 0){
					$rootScope.User = $scope.register.username;
					$rootScope.isAuthenticated = true;
					$rootScope.token = response.data.token;
					$scope.getproject();
				}
				else{
					$scope.illegal = true;
				}
			},function error() {
				$scope.illegal = true;
			})
	};

}]);

//元素管理
app.controller('elementAdmin', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
	
	$scope.data = {pic: '/images/banner.png'};
	$scope.delete = function (id) {
		for (ele in $scope.elementInfo){
			if($scope.elementInfo[ele]._Id == id){
				// var index = i;
				break;
			}
		}
		$http({method:'POST', url: 'http://10.108.101.173:3000/element/delete', data: {element_Id: id},
			headers: {'x-access-token': $rootScope.token}})
			.then(function success(response) {
				$scope.elementInfo.splice(ele,1);
			},function error() {

			})
	}
	
}]);


//创建新项目
app.controller('createProject', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
	$scope.new_project = {project_name: '', project_id: '', description: ''};
	$scope.create_success_1 = true;
	$scope.create_project = function () {
		console.log('create');
		console.log($scope.new_project);
		$http({method: 'POST', url: 'http://10.108.101.173:3000/project/create',
			data: {project_name: $scope.new_project.project_name, description: $scope.new_project.description},
				headers:{'x-access-token': $rootScope.token}})
			.then(function success(response) {
				console.log(response.data);
				temp = {project_name: $scope.new_project.project_name, project_id: response.data.result._Id};
				var p = $.extend(true, {}, temp);
				$scope.projects.push(p);
				$scope.change_project(p);
				// $scope.change_project({project_name: $scope.new_project.project_name, project_id: response.data.result._Id});
			},function error() {
				console.log('create error');
			})
	};

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
	$scope.current_pattern = {_Id: '' , kind: 1,title:'who?', options:['me', 'you'], name: '', color: '0', video_id: '1', current_time: '', pic: 'images/banner.png',
		start_time: 0, end_time: 0, link: 'www.baidu.com', left :300, top: 300, voted: false, answer: -1, sta_info: []};

	//按钮是否显示
	$scope.btn_show = false;

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
		console.log('11');
		var p = $.extend(true, {}, $scope.current_pattern);

		temp = {colors: [],images: [], kind: '', links: [], name: [],
			positions: [], sizes: [], texts: [], times: [], titles: [], _id: ''};
		temp.colors.push($scope.current_pattern.color);
		// if ($scope.pic_file != null){
		// 	temp.images.push($scope.current_pattern.name);
		// }
		temp.kind = $scope.current_pattern.kind;
		temp.links.push($scope.current_pattern.link);
		temp.positions.push({t: $scope.current_pattern.top,l: $scope.current_pattern.left,w: 0, h: 0});
		temp.texts = $scope.current_pattern.options;
		temp.times.push($scope.current_pattern.current_time);
		temp.times.push($scope.current_pattern.start_time);
		temp.times.push($scope.current_pattern.end_time);
		temp.name = $scope.current_pattern.name;
		temp.titles.push($scope.current_pattern.title);
		all = {properties: temp, project_Id: $scope.current_project.project_id};
		console.log(all);
		$http({method:'POST', url:'http://10.108.101.173:3000/element/create', data:all,
			headers:{'x-access-token': $rootScope.token}})
			.then(function success(response) {
				console.log('ele_id',response.data);
				temp._Id = response.data.result;
				p._Id = response.data.result;
				//发送选项数目
				len = $scope.current_pattern.options.length;
				$http({method: 'POST', url: 'http://10.108.101.173:3000/element/updateVoteNum', data: {element_Id:response.data.result, num: len},
						headers: {'x-access-token': $rootScope.token}})
					.then(function success(response) {

					},function error() {

					});
				//上传图片
				if ($scope.pic_file != null){
					$scope.upload(response.data.result, $scope.pic_file, $scope.current_pattern.name);
				}
		},function error() {
				console.log('create vote element error')
		});

		p.kind = '话题投票';

		$scope.elementInfo.push(p);
	};
	$scope.upload = function (_Id, file, name) {
		Upload.upload({url:'http://10.108.101.173:3000/image/upload',
			data:{element_Id: _Id, file_name: name, file: file}
		}).success(function (response) {

		}).error(function () {

		})
	};
}]);

//投票操作
app.controller('Vote', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {

	$scope.vote = function (id) {
		for (ele in $scope.elementInfo){
			if($scope.elementInfo[ele]._Id == id){
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

//云图
app.controller('cloudPicture', ['$scope', '$rootScope', 'fileReader', '$http', 'Upload', function ($scope, $rootScope, fileReader, $http, Upload) {
	$scope.video_url = 'video/sample.mp4';
	$scope.url = '';
	$scope.seturl = function () {
		$scope.video_url = $scope.url;
	};
	$scope.pic_file = null;
	$scope.new_element = {element_Id: '', kind: 2, name: '', pic:'', title: '', link: '', start_time: '', end_time: '', times: [], positions: []};
	$scope.current_element_Id = '';

	$scope.position = {t: '', l: '', w: 0, h: 0};
	$scope.time = '';
	$scope.getFile = function () {
		fileReader.readAsDataUrl($scope.file, $scope)
			.then(function (result) {
				$scope.new_element.pic = result;
			})
	};

	//获取播放器播放信息
	var video_id = document.getElementById('cloud_photo_video');
	video_id.ontimeupdate=function(){tagtime_judge(this)};
	function tagtime_judge(event)
	{
		$scope.time = event.currentTime;
		$scope.$digest();
	}

	//创建新元素
	$scope.create_element = function () {
		if ($scope.pic_file == ''){
			window.alert('请先选择图片!');
		}
		else {
			var p = $.extend(true, {}, $scope.new_element);
			temp = {colors: [],images: [], kind: '', links: [], name: [],
			positions: [], sizes: [], texts: [], times: [], titles: [], _id: ''};
			temp.kind = $scope.new_element.kind;
			temp.links.push($scope.new_element.link);
			temp.name = $scope.new_element.name;
			all = {properties: temp, project_Id: $scope.current_project.project_id};

			$http({method: 'POST', url: 'http://10.108.101.173:3000/element/create', data: all,
					headers: {'x-access-token': $rootScope.token}})
				.then(function success(response) {
					p._Id = response.data.result;
					upload(response.data.result, $scope.pic_file, $scope.new_element.name);
				},function error() {
					console.log('create cloud photo error')
				});
			p.kind = '云图云窗';
			$scope.elementInfo.push(p);
		}
	}

	//编辑元素信息
	$scope.edit_element = function (id) {
		for (ele in $scope.elementInfo){
			if ($scope.elementInfo[ele]._Id == id){
				break;
			}
		}
		$http({method: 'POST', url: 'http://10.108.101.173:3000/element/updateName',
			data:{element_Id: $scope.elementInfo[ele], name: $scope.elementInfo[ele].name},
			headers: {'x-access-token': $rootScope.token}})
			.then(function success() {
				console.log('update name');
			},function error() {

			});
		$http({method: 'POST', url: 'http://10.108.101.173:3000/element/updateLinks',
			data:{element_Id: $scope.elementInfo[ele], index: [0], links: [$scope.elementInfo[ele].link()]},
			headers: {'x-access-token': $rootScope.token}})
			.then(function success() {
				console.log('update link');
			},function error() {

			});
		$http({method: 'POST', url: 'http://10.108.101.173:3000/element/updateTitles',
			data:{element_Id: $scope.elementInfo[ele], indexs:[0], titles: [$scope.elementInfo[ele].title]},
			headers: {'x-access-token': $rootScope.token}})
			.then(function success() {
				console.log('update title');
			},function error() {

			});
	}
	
	//上传文件
	upload = function (_Id, file, name) {
		Upload.upload({url:'http://10.108.101.173:3000/image/upload',
			data:{element_Id: _Id, file_name: name, file: file},
		}).success(function () {

		}).error(function () {

		})
	};

	//计算位置
	$scope.add_hotpoint = function (mouseEvent) {
		var video = angular.element(mouseEvent.toElement);
		video[0].pause();
		var width = video[0].width;
		var height = video[0].height;
		$scope.show_time = video[0].currentTime;
		if (!mouseEvent){
			mouseEvent = window.event;
		}

		if (mouseEvent.pageX || mouseEvent.pageY){
			$scope.position.l = mouseEvent.pageX;
			$scope.position.t = mouseEvent.pageY;
		}
		else if (mouseEvent.clientX || mouseEvent.clientY){
			$scope.position.l = mouseEvent.clientX + document.body.scrollLeft +
				document.documentElement.scrollLeft;
			$scope.position.t = mouseEvent.clientY + document.body.scrollTop +
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

			$scope.position.l -= offX;
			$scope.position.t -= offY;
		}
	};

	//选择元素
	$scope.change_element = function (id) {
		console.log('change element');
		$scope.current_element_Id = id;
	}

	//添加位置和时间信息
	$scope.add_element =function () {
		for (ele in $scope.elementInfo){
			if ($scope.elementInfo[ele]._Id == $scope.current_element_Id){
				break;
			}
		}
		$http({method: 'POST', url: 'http://10.108.101.173:3000/element/addTimes',
			data: {element_Id: $scope.current_element_Id, times: [$scope.show_time]},
			headers: {'x-access-token': $rootScope.token}})
			.then(function success(response) {
				console.log(222);
				console.log(222,$scope.show_time);
				console.log(response.data);
				var t = $scope.show_time;
				$scope.elementInfo[ele].times.push(t);
			},function error() {
				console.log(3333);
			});
		$http({method: 'POST', url: 'http://10.108.101.173:3000/element/addPositions',
			data: {element_Id: $scope.current_element_Id, positions: [$scope.position]},
			headers: {'x-access-token': $rootScope.token}})
			.then(function success() {
				var p = $.extend(true, {}, $scope.position)
				$scope.elementInfo[ele].positions.push(p);
			},function error() {

			});
		console.log('add_photo');
		$scope.current_element_Id = false;
	}
}]);

//广告
app.controller('adPhoto',['$scope', '$rootScope', 'fileReader', '$http', 'Upload', function ($scope, $rootScope, fileReader, $http, Upload) {
	$scope.video_url = 'video/sample.mp4';
	$scope.url = '';
	$scope.seturl = function () {
		$scope.video_url = $scope.url;
	};
	$scope.pic_file = null;
	$scope.new_element = {element_Id: '', kind: 2, name: '', pic:'', title: '', link: '', times: [], positions: [], color: '0', show: false, description:''};
	$scope.position = {t: '', l: '', w: 0, h: 0};
	$scope.time = '';
	$scope.current_element_Id = '';
	$scope.show;
	$scope.getFile = function () {
		fileReader.readAsDataUrl($scope.file, $scope)
			.then(function (result) {
				$scope.new_element.pic = result;
			})
	};

	//获取播放器播放信息
	var video_id = document.getElementById('ad_photo_video');
	video_id.ontimeupdate=function(){tagtime_judge(this)};
	function tagtime_judge(event)
	{
		$scope.time = event.currentTime;
		$scope.$digest();
	}
	
	
	$scope.create_element = function () {
		var p = $.extend(true, {}, $scope.new_element);
		temp = {colors: [],images: [], kind: '', links: [], name: [],
			positions: [], sizes: [], description: '', times: [], titles: [], _id: ''};
		temp.kind = 3;
		temp.links.push($scope.new_element.link);
		temp.name = $scope.new_element.name;
		temp.titles.push($scope.new_element.title);
		temp.description= $scope.new_element.description;
		temp.colors.push($scope.new_element.color);
		all = {properties: temp, project_Id: $scope.current_project.project_id};

		$http({method: 'POST', url: 'http://10.108.101.173:3000/element/create', data: all,
			headers: {'x-access-token': $rootScope.token}})
			.then(function success(response) {
				p._Id = response.data.result;
				upload(response.data.result, $scope.pic_file, $scope.new_element.name);
			},function error() {
				console.log('create ad photo error');
			});
		p.kind = '广告云窗'
		$scope.elementInfo.push(p);
	};

	//计算位置
	$scope.add_hotpoint = function (mouseEvent) {
		var video = angular.element(mouseEvent.toElement);
		video[0].pause();
		var width = video[0].width;
		var height = video[0].height;
		$scope.show_time = video[0].currentTime;
		if (!mouseEvent){
			mouseEvent = window.event;
		}

		if (mouseEvent.pageX || mouseEvent.pageY){
			$scope.position.l = mouseEvent.pageX;
			$scope.position.t = mouseEvent.pageY;
		}
		else if (mouseEvent.clientX || mouseEvent.clientY){
			$scope.position.l = mouseEvent.clientX + document.body.scrollLeft +
				document.documentElement.scrollLeft;
			$scope.position.t = mouseEvent.clientY + document.body.scrollTop +
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

			$scope.position.l -= offX;
			$scope.position.t -= offY;
		}
	};

	$scope.video_pause = function (id) {
		video_id.pause();
		for(ele in $scope.elementInfo){
			if($scope.elementInfo[ele]._Id == id){
				break;
			}
		}
		console.log(33,ele);
		$scope.elementInfo[ele].show =true;
	}

	$scope.video_start = function (id) {
		video_id.play();
		for(ele in $scope.elementInfo){
			if($scope.elementInfo[ele]._Id == id){
				break;
			}
		}
		$scope.elementInfo[ele].show = false;
	}

	//编辑元素信息
	$scope.edit_element = function (id) {
		for (ele in $scope.elementInfo){
			if ($scope.elementInfo[ele]._Id == id){
				break;
			}
		}
		$http({method: 'POST', url: 'http://10.108.101.173:3000/element/updateName',
			data:{element_Id: $scope.elementInfo[ele], name: $scope.elementInfo[ele].name},
			headers: {'x-access-token': $rootScope.token}})
			.then(function success() {
				console.log('update name');
			},function error() {

			});
		$http({method: 'POST', url: 'http://10.108.101.173:3000/element/updateLinks',
			data:{element_Id: $scope.elementInfo[ele], index: [0], links: [$scope.elementInfo[ele].link()]},
			headers: {'x-access-token': $rootScope.token}})
			.then(function success() {
				console.log('update link');
			},function error() {

			});
		$http({method: 'POST', url: 'http://10.108.101.173:3000/element/updateTitles',
			data:{element_Id: $scope.elementInfo[ele], indexs:[0], titles: [$scope.elementInfo[ele].title]},
			headers: {'x-access-token': $rootScope.token}})
			.then(function success() {
				console.log('update title');
			},function error() {

			});
		$http({method: 'POST', url: 'http://10.108.101.173:3000/element/Description',
			data:{element_Id: $scope.elementInfo[ele], indexs:[0], titles: [$scope.elementInfo[ele].description]},
			headers: {'x-access-token': $rootScope.token}})
			.then(function success() {
				console.log('update description');
			},function error() {

			});
	}

	//上传文件
	upload = function (_Id, file, name) {
		Upload.upload({url:'http://10.108.101.173:3000/image/upload',
			data:{element_Id: _Id, file_name: name, file: file},
		}).success(function () {

		}).error(function () {

		})
	};

	//选择元素
	$scope.change_element = function (id) {
		console.log('change element');
		console.log(id);
		$scope.current_element_Id = id;
	}

	//添加元素
	$scope.add_element =function () {
		for (ele in $scope.elementInfo){
			if ($scope.elementInfo[ele]._Id == $scope.current_element_Id){
				break;
			}
		}
		$http({method: 'POST', url: 'http://10.108.101.173:3000/element/addTimes',
			data: {element_Id: $scope.current_element_Id, times: [$scope.show_time]},
			headers: {'x-access-token': $rootScope.token}})
			.then(function success(response) {
				console.log(222);
				console.log(222,$scope.show_time);
				console.log(response.data);
				var t = $scope.show_time;
				$scope.elementInfo[ele].times.push(t);
			},function error() {
				console.log(3333);
			});
		$http({method: 'POST', url: 'http://10.108.101.173:3000/element/addPositions',
			data: {element_Id: $scope.current_element_Id, positions: [$scope.position]},
			headers: {'x-access-token': $rootScope.token}})
			.then(function success() {
				var p = $.extend(true, {}, $scope.position)
				$scope.elementInfo[ele].positions.push(p);
			},function error() {

			});
		console.log('add ad');
		$scope.current_element_Id = false;
	}
}]);

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

