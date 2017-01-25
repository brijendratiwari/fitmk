starter.controller('BlogCtrl',
	function(
		$scope,
		$rootScope,
		$state,
		$ionicLoading,
		Api,
		ApiUrl,
		$ionicScrollDelegate,
		ApiCall,
		AlertFactory
		){


		$scope.blogSearchKey = "";

		resetValue();

		function resetValue() {
			$scope.blogs = [];
			$scope.totalCount = 0;
			$scope.currentIndex = 0;
			$scope.moreBlogsAvailable = true;
		}

		$rootScope.$on('MenuItemChanged', function(event, args) {
			if (args.itemName == 'blog') {
				resetValue();
				$scope.loadMoreBlogs();
			}
		});
		
		// Load More Data
		$scope.loadMoreBlogs = function() {
			$scope.currentIndex++;

			getBlogs(function(){
				if ($scope.totalCount > $scope.blogs.length) {
					$scope.moreBlogsAvailable = true;
				} else {
					$scope.moreBlogsAvailable = false;
				}
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});
		};

		$scope.blogSearch = function() {
			
			$scope.isNextSearch = true;
			$scope.searchText = $scope.blogSearchKey;
			$scope.currentIndex = 1;

			if (!$scope.isSearching) {				
				searchBlogCategories($scope.searchText);
			};	
		};

		$scope.isSearching = false;
		$scope.searchText = "";

		function getBlogs(callback) {
			if ($scope.currentIndex == 1) {
				$ionicLoading.show();	
			}
			
			ApiCall.PostCall(Api.method.getBlogs,
			{
				page:$scope.currentIndex
			},
			function(response) {
				$ionicLoading.hide();
				if (response.success) {
					var blogs = compileOutput(response.blog);
					angular.forEach(blogs, function(value, key){
						$scope.blogs.push(value);
					});
					$scope.totalCount = response.total_count;
					if (callback) {
						callback();
					}
				} else {
					AlertFactory.showResponseError(response, "Blogs not found.")
				}
			}, function (err) {
				$ionicLoading.hide();
				AlertFactory.showError(JSON.stringify(err));
			});
		}

		function searchBlogCategories(searchTextStr) {
			if (searchTextStr.length == 0) {
				$scope.isSearching = false;
				$scope.isNextSearch = false;
			};

			$scope.isSearching = true;
			$scope.isNextSearch = false;

			ApiCall.PostCall(Api.method.getBlogs,
			{
				page:$scope.currentIndex,
				search:searchTextStr
			},
			function(response) {

				if (response.success) {
					var blogs = compileOutput(response.blog);
					$scope.blogs = blogs;
					$scope.totalCount = response.total_count;
				} else {
					$scope.blogs = [];
					$scope.totalCount = 0;
				}

				$ionicScrollDelegate.resize();

				if ($scope.totalCount > $scope.blogs.length) {
					$scope.moreBlogsAvailable = true;
				} else {
					$scope.moreBlogsAvailable = false;
				}

				$scope.isSearching = false;
				if ($scope.isNextSearch) {
					$scope.isNextSearch = false;
					searchBlogCategories($scope.searchText);
				};
			},
			function (err) {
				$ionicLoading.hide();
				console.log(JSON.stringify(err));
			})
		}

		function compileOutput(blogs) {
			var updated_blogs = [];
			for (var i = 0; i < blogs.length; i++) {
				var blog = blogs[i];
				var date = new Date(blog.addedat.replace(/-/g, "/"));
				var ne_blg = blog;

				var newdate = ("" + date).split(" ");

				if (blog.blog_type == "video" && ne_blg.thumb.length > 0) {
					ne_blg.design = "background: url('"+ne_blg.thumb+"') no-repeat scroll center center / auto 100%";
				} else if (ne_blg.thumb.length == 0) {
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

		// $scope.openBlog = function (i) {
		// 	$scope.blogs[i].show = !$scope.blogs[i].show;

		// 	fullBlog($scope.blogs[i].id);
		// };


		
	});
