starter.controller('BlogDetailsCtrl',
	function(
		$scope,
		$state,
		$ionicLoading,
		$stateParams,
		Api,
		ApiUrl,
		ApiCall,
		User,
		AlertFactory,
		$ionicSlideBoxDelegate,
		$sce
		){


		function apply(){
			if(!$scope.$$phase) {
				$scope.$apply();
			}
		}

		$scope.blog = {};
		
		$scope.getVideoUrl = function (videoName) {
			var preUrl = "https://www.youtube.com/embed/";
			return $sce.trustAsResourceUrl(preUrl + videoName);
		}
		$scope.getPathForImage = function (imageName) {
			return ApiUrl.imgPath() + imageName;
		};

		$scope.slideHasChanged = function(index) {

		};
		$scope.slideBoxNext = function(){
			$ionicSlideBoxDelegate.next();
		};
		$scope.slideBoxPrevious = function(){
			$ionicSlideBoxDelegate.previous();
		};

		$scope.isAdminOrInstructor = function() {
			return User.isInstructor() || User.isAdmin();
		};

		fullBlog();

		function fullBlog() {
			// $ionicLoading.show();
			ApiCall.PostCall(Api.method.fullBlog,
			{
				blog_id: $stateParams.blogId
			},
			function(response) {
				$ionicLoading.hide();
				if (response.success) {
					$scope.blog= compileOutput(response.blog_info)[0];
					getBlogView();
					apply();
					// if ($scope.blog_type == 'video') {
					// 	setVideo($scope.blog);
					// } else if ($scope.blog_type == 'slideshow') {
					// 	setSlideShow($scope.blog);
					// } else if ($scope.thumb) {
					// 	setImage($scope.blog);
					// }

				} else {
					AlertFactory.showResponseError(response, "Blogs details not found.")
				}
			}, function (err) {
				$ionicLoading.hide();
				AlertFactory.showError(JSON.stringify(err));
			});
		}

		function getBlogView() {
			$ionicLoading.show();
			ApiCall.PostCall(Api.method.getBlowView,{
				blog_id:$stateParams.blogId
			},
			function(response){
				$ionicLoading.hide();
				console.log('getItemView '+JSON.stringify(response));

				if (response.success) {
					$scope.viewCount = response.view_count;
				} 
			},
			function(error){

			});
		}


		function compileOutput(blogs) {
			var updated_blogs = [];
			for (var i = 0; i < blogs.length; i++) {
				var blog = blogs[i];
				var date = new Date(blog.addedat.replace(/-/g, "/"));
				var ne_blg = blog;

				var newdate = ("" + date).split(" ");

				if (ne_blg.thumb.length == 0) {
					ne_blg.design = "background-color: #ccc";
				}
				else {
					ne_blg.design = "background: url('" + ApiUrl.imgPath() + blog.thumb + "') no-repeat scroll center center / auto 100%";
				}


				ne_blg.addedat =  newdate[1] + " " + newdate[2] + " " + newdate[3];
				updated_blogs[i] = ne_blg;
			}
			return updated_blogs;
		}
		
	});
