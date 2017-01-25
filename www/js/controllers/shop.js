starter.controller('ShopCtrl',
	function(
		$scope,
		$rootScope,
		$ionicScrollDelegate,
		$state,
		$ionicLoading,
		ApiCall,
		AlertFactory,
		SharedData,
		Api,
		ApiUrl
		){

		$scope.packageSearchKey = "";

		resetValue();

		function resetValue() {
			$scope.categories = [];
			$scope.totalCount = 0;
			$scope.currentIndex = 0;
			$scope.moreCategoriesAvailable = true;
			$ionicScrollDelegate.scrollTop();
		}


		$rootScope.$on('MenuItemChanged', function(event, args) {
			if (args.itemName == 'shop') {
				resetValue();
				$scope.loadMoreCategories();
			}
		});

		// Load More Data
		$scope.loadMoreCategories = function() {			
			$scope.currentIndex++;

			getShopCategories(function(){
				if ($scope.totalCount > $scope.categories.length) {
					$scope.moreCategoriesAvailable = true;
				} else {
					$scope.moreCategoriesAvailable = false;
				}
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});
		};

		$scope.packageSearch = function() {
			
			$scope.isNextSearch = true;
			$scope.searchText = $scope.packageSearchKey;
			$scope.currentIndex = 1;

			if (!$scope.isSearching) {				
				searchShopCategories($scope.searchText);
			};	
		};

		
		$scope.categoryItemClick = function(catName) {
			SharedData.setClickedShopCategory(catName);
		};

		$scope.isSearching = false;
		$scope.searchText = "";



		function getShopCategories(callback) {
			if ($scope.currentIndex == 1) {
				$ionicLoading.show();	
			}
			ApiCall.PostCall(Api.method.getShopCategories,
			{
				page:$scope.currentIndex,
				search:$scope.packageSearchKey
			},
			function(response) {
				$ionicLoading.hide();

				if (response.success) {
					var categories = arrange(response.result);
					angular.forEach(categories, function(value, key){
						$scope.categories.push(value);
					});
					$scope.totalCount = response.total_count;
				} 
				if (callback) {
					callback();
				}
			},
			function (err) {
				$ionicLoading.hide();
				console.log(JSON.stringify(err));
			})
		}

		function searchShopCategories(searchTextStr) {
			if (searchTextStr.length == 0) {
				$scope.isSearching = false;
				$scope.isNextSearch = false;
			};

			$scope.isSearching = true;
			$scope.isNextSearch = false;

			ApiCall.PostCall(Api.method.getShopCategories,
			{
				page:$scope.currentIndex,
				search:searchTextStr
			},
			function(response) {

				if (response.success) {
					$scope.categories= arrange(response.result);					
					$scope.totalCount = response.total_count;
				} else {
					$scope.categories = [];
					$scope.totalCount = 0;
				}

				$ionicScrollDelegate.resize();
				
				if ($scope.totalCount > $scope.categories.length) {
					$scope.moreCategoriesAvailable = true;
				} else {
					$scope.moreCategoriesAvailable = false;
				}

				$scope.isSearching = false;
				if ($scope.isNextSearch) {
					$scope.isNextSearch = false;
					searchShopCategories($scope.searchText);
				};

			},
			function (err) {
				$ionicLoading.hide();
				console.log(JSON.stringify(err));
			})
		}

		function chunkString(str, length) {
			return str.match(new RegExp('.{1,' + length + '}', 'g'));
		}

		function arrange (data) {
			var converted = [];

			for (var i = 0; i < data.length; i++) {
				var categ = data[i];
				var ne_dt = data[i];

				var catName = "";
				var texts = chunkString(categ.catName, 30);
				for (var j = 0; j < texts.length; j++) {
					catName += texts[j] + "<br/>";
				}
				ne_dt.catName = catName;
				if (categ.image.length == 0) {
					ne_dt.design = "background-color: #ccc";
				}
				else {
					ne_dt.design = "background: url('" + ApiUrl.imgPath() + categ.image + "') no-repeat scroll center center / auto 100%";
				}
				converted[i] = ne_dt;
			}
			return converted;
		}

		
	})
