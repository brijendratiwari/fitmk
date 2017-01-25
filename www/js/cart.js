starter.factory('Cart', function($rootScope) {

	var cartO = {};

	cartO.setItemCount = function(count) {
		window.localStorage.setItem('cart_items_count', count);
		$rootScope.cartItemCount =  count;
	},
	cartO.getItemCount = function() {
		var count = window.localStorage.getItem('cart_items_count');
		if (count == undefined || count == null) {
			count = 0;
		}
		$rootScope.cartItemCount =  count;
		return parseInt(count);
	},
	cartO.getCount = function() {
		var cart = window.localStorage.getItem('cart');
		if (cart == undefined || cart == null) {
			cart = [];
		}
		else {
			cart = JSON.parse(cart);
		}
		return cart.length;
	};

	cartO.getCart = function() {
		var cart = window.localStorage.getItem('cart');
		if (cart == undefined || cart == null) {
			cart = [];
		}
		else {
			cart = JSON.parse(cart);
		}
		return cart;
	};

	cartO.addCart = function(itemId, details) {
		var cart = window.localStorage.getItem('cart');
		if (cart == undefined || cart == null) {
			cart = [];
		}
		else {
			cart = JSON.parse(cart);
		}
		var affect = false;
		for (var i = 0; i < cart.length; i++) {
			var item = cart[i];
			if (item.id == itemId) {
				item.count = item.count + 1;
				affect = true;
				break;
			}
		}
		if (!affect) {
			cart[cart.length] = {id: itemId, productdetail: details, count: 1};
		}
		window.localStorage.setItem('cart', JSON.stringify(cart));
	};

	cartO.empty = function() {
		window.localStorage.removeItem('cart');
	};

	cartO.removeItem = function(pid, onCmmplete) {
		var cart = window.localStorage.getItem('cart');
		if (cart == undefined || cart == null) {
			cart = [];
		}
		else {
			cart = JSON.parse(cart);
		}
		var affect = false;

		var new_cart = [];
		for (var i = 0; i < cart.length; i++) {
			var item = cart[i];
			if (item.id == pid) {
				affect = true;
			}
			else {
				new_cart.push(item);
			}
		}
		window.localStorage.setItem('cart', JSON.stringify(new_cart));
		onCmmplete(affect);
	}
	return cartO;
})
