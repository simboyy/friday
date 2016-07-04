'use strict';

angular.module('shopnxApp')
  .controller('ProductDetailsCtrl', function ($scope, $rootScope, Product, Category, socket, $stateParams, $location, $state, $injector) {
    var id = $stateParams.id;
    // var slug = $stateParams.slug;
    // Storing the product id into localStorage because the _id of the selected product which was passed as a hidden parameter from products won't available on page refresh
    if (localStorage !== null && JSON !== null && id !== null) {
        localStorage.productId = id;
    }
    var productId = localStorage !== null ? localStorage.productId : null;

    $scope.product = Product.get({id:productId},function(data) {
      socket.syncUpdates('product', $scope.data);
      generateBreadCrumb('Category',data.category._id);
    });
    $scope.categories = Category.all.query();

    // To shuffle throught different product variants
    $scope.i=0;
    $scope.changeIndex =function(i){
        $scope.i=i;
    };

    // The main function to navigate to a page with some hidden parameters
    $scope.navigate = function(page,params){
      if(params){
        $location.replace().path(page+'/'+params.slug+'/'+params._id);
      }else{
        $location.replace().path('/');
      }
    };

    // Function to generate breadcrumb for category and brand
    // Future: Put it inside a directive
    var generateBreadCrumb = function(page, id){
      $scope.breadcrumb = {};
      $scope.breadcrumb.items = [];
      var api = $injector.get(page);
      api.get({id:id}).$promise.then(function(child){
        $scope.breadcrumb.items.push(child);
        // var p = child.parent;
        // if(p != null){findBrandPath(1);}
        if(page==='Category'){
          $scope.breadcrumb.items.push({name:'All Categories'});
        }
        else if(page==='Brand'){
          $scope.breadcrumb.items.push({name:'All Brands'});
        }
      });
    };

  })

  .controller('MainCtrl', function ($scope, $state, $stateParams, $location, Product, Brand, Category, Feature, socket, $rootScope, $injector, $loading) {

    if ($stateParams.productSku) { // != null
        $scope.product = $scope.store.getProduct($stateParams.productSku);
    }

 	

// For Price slider
    $scope.currencyFormatting = function(value){
      return  '$ ' + value.toString();
    };

    $scope.removeBrand = function(brand){
      var index = $scope.fl.brands.indexOf(brand);
      if (index > -1) {
          $scope.fl.brands.splice(index, 1);
          $scope.filter();
      }
    }

    $scope.Types = Category.all.query();

    $scope.removeFeatures = function(feature){
      console.log($scope.fl.features,feature);
      // var index = $scope.fl.features.indexOf(feature);
      // if (index > -1) {
      //     $scope.fl.features.splice(index, 1);
      //     $scope.filter();
      // }
    }

    $scope.removeCategory = function(){
      $scope.fl.categories = undefined;
      $scope.filter();
    }

    $scope.products = {};
    $scope.filtered = {};
    $scope.products.busy = false;
    $scope.products.end = false;
    $scope.products.after = 0;
    $scope.products.items = [];
    // $scope.products.sort = sortOptions[0].val;
    $scope.fl = {};
    $scope.fl.brands = [];
    $scope.fl.categories = [];
    $scope.priceSlider = {};
    $scope.features = Feature.group.query();
    $scope.navigate = function(page,params){
      // var params = params.delete('$$hashKey');
      if(page==='sort'){
        delete params.$$hashKey;
        var paramString = JSON.stringify(params);
        // console.log(paramString);
        $state.go($state.current, {sort: paramString}, {reload: true});
      }
      else if(params){
        $location.replace().path(page+'/'+params.slug+'/'+params._id);
      }else{
        $location.replace().path('/');
      }
    };
    var generateBreadCrumb = function(page, id){
      $scope.breadcrumb.items = [];
      var api = $injector.get(page);
      api.get({id:id}).$promise.then(function(child){
        $scope.breadcrumb.items.push(child);
        // var p = child.parent;
        // if(p != null){findBrandPath(1);}
        if(page==='Category'){
          $scope.breadcrumb.items.push({name:'All Categories'});
        }else if(page==='Brand'){
          $scope.breadcrumb.items.push({name:'All Brands'});
        }
      });
    };


    var sort = $scope.products.sort = $stateParams.sort;
    var q = {where:{active:true},limit:10};


    // displayProducts(q);
    var a = {};
    $scope.filter = function(){
      var f = [];
      if ($scope.products.busy){ return; }
      $scope.products.busy = true;
      if($scope.fl.features){
        angular.forEach($scope.fl.features,function(val, key){
          if(val.length>0){
            f.push({'features.key' : key, 'features.val' : { $in: val}});
          }
        });
      }
      if($scope.fl.brands){
        if($scope.fl.brands.length>0){
          var brandIds = [];
          angular.forEach($scope.fl.brands,function(brand){
            brandIds.push(brand._id);
          });
          f.push({'brand._id' : { $in: brandIds } });
        }
      }
      if($scope.fl.categories){
        if($scope.fl.categories.length>0){
          var categoryIds = [];
          angular.forEach($scope.fl.categories,function(category){
            categoryIds.push(category.category);
          });
          f.push({'category.parentCategory' : { $in: categoryIds } });
        }
      }
      // if($scope.priceSlider)
      f.push({'variants.price' : { $gt: $scope.priceSlider.min, $lt:$scope.priceSlider.max } });
      // console.log(f.length);
      if(f.length>0){
        q.where = { $and : f};
      }else{
        q.where = {};
      }
      // console.log(f,q);

      displayProducts(q,true);
    };

    // $scope.filterFeatures = function() {
    //   if ($scope.products.busy){ return; }
    //   $scope.products.busy = true;
    //   a.fl = [];
    //   if($scope.fl.features){
    //       angular.forEach($scope.fl.features,function(val, key){
    //         if(val.length>0){
    //           a.fl.push({'features.key' : key, 'features.val' : { $in: val}});
    //         }
    //       });
    //       if(a.fl.length>0 && a.br && a.price) {
    //         q.where = { $and : [a.price, a.br,{$and : a.fl}]};
    //       }
    //       else if(a.br && a.price) {
    //         q.where = { $and : [a.price, a.br]};
    //       }else if(a.br) {
    //         q.where = { $and : [a.br]};
    //       }else{
    //         q.where = {};
    //       }
    //       displayProducts(q,true);
    //   }
    // };
    //
    // $scope.filterBrands = function() {
    //   // This function required to query from database in place of filtering items from angular $scope,
    //   // In some cases we load only 20 products for pagination in that case we won't be able to filter properly
    //   if ($scope.products.busy){ return; }
    //   $scope.products.busy = true;
    //   a.br = [];
    //   console.log($scope.priceSlider);
    //   if($scope.fl.brands){
    //     if($scope.fl.brands.length>0){
    //       var brandIds = [];
    //       angular.forEach($scope.fl.brands,function(brand){
    //         brandIds.push(brand._id);
    //       });
    //       a.price = {'variants.price' : { $gt: $scope.priceSlider.min, $lt:$scope.priceSlider.max } };
    //         a.br = {'brand._id' : { $in: brandIds } };
    //         q.where = { $and : [a.price, a.br, {$and : a.fl}]};
    //     }else if(a.fl){
    //       q.where = { $and : [a.price, a.fl] };
    //     }else{
    //       q.where = { $and : [a.price] };
    //     }
    //   }else {
    //     q.where.brand = undefined;
    //     q.where['brand._id'] = undefined;
    //   }
    //   displayProducts(q,true);
    // };
    //
    // $scope.filterPrice = function(price) {
    //   // This function required to query from database in place of filtering items from angular $scope,
    //   // In some cases we load only 20 products for pagination in that case we won't be able to filter properly
    //   $scope.products.busy = false;
    //   $scope.products.end = false;
    //   $scope.products.after = 0;
    //   $scope.products.items = [];
    //
    //   if ($scope.products.busy){ return;}
    //   $scope.products.busy = true;
    //     console.log('price');
    //   if(price){
    //     a.price = {'variants.price' : { $gt: price.min, $lt:price.max } };
    //     q.where = { $and : [a.price, a.br, {$and : a.fl}]};
    //   }else{
    //     q.where = { $and : [a.br, {$and : a.fl}]};
    //   }
    //   // q.where['variants.price'] = { $gt: price.min, $lt:price.max };
    //   displayProducts(q,true);
    // };

    $scope.sortNow = function(sort){
        q.sort = sort;
        displayProducts(q,true);
    };

    var displayProducts = function(q,flush){
      if(flush){
        q.skip = 0;
        $scope.products.items = [];
        $scope.products.end = false;
        $scope.products.after = 0;
      }
      $loading.start('products');
      $scope.products.busy = true;
      Product.query(q, function(data){
          for (var i = 0; i < data.length; i++) {
              $scope.products.items.push(data[i]);
          }
          $scope.filtered.count = data.length + $scope.products.after;
          if(data.length>=5) { $scope.products.after = $scope.products.after + data.length; } else { $scope.products.end = true;}
          $scope.products.busy = false;
          $loading.finish('products');
      }, function(){ $scope.products.busy = false; $loading.finish('products');});

      Product.count.query(q, function(res){
        $scope.products.count = res[0].count;
      });
    };

    $scope.resetPriceRange = function(){
      $scope.priceSlider = {
          min: 0,
          max: 1000,
          ceil: 1000,
          floor: 0
      };
      $scope.filter();
    };

    if('page' in $stateParams){
      var categoryId;
      if($stateParams.page && $stateParams._id){
        $scope.products.brand = {_id : $stateParams._id};
        $scope.breadcrumb = {type: $stateParams.page};
        generateBreadCrumb($stateParams.page,$stateParams._id);
        if($stateParams.page==='Category'){
          // categoryId = $stateParams._id;
          $scope.fl.categories.push({_id:$stateParams._id,name:$stateParams.slug});
        }else if($stateParams.page==='Brand'){
          $scope.fl.brands.push({_id:$stateParams._id,name:$stateParams.slug});
        }
        $scope.resetPriceRange();
        // q.where['brand._id'] = brandId;
        // q.where['category._id'] = categoryId;
      }else{
        q = {sort:sort,limit:10};
      }
      $scope.filter();
    }else{
      q = {limit:10};
        // console.log('wppp',q);
    }

    $scope.scroll = function() {
        if ($scope.products.busy || $scope.products.end){ return;}
        $scope.products.busy = false;
        q.skip = $scope.products.after;
        displayProducts(q);
    };


    $scope.resetPriceRange();

})


 .controller('MainTNGCtrl', function ($scope, $state, $stateParams, $location, ProductTNG, Brand, CategoryTNG, Feature, socket, $rootScope, $injector, $loading) {

    if ($stateParams.productSku) { // != null
        $scope.product = $scope.store.getProduct($stateParams.productSku);
    }




// For Price slider
    $scope.currencyFormatting = function(value){
      return  '$ ' + value.toString();
    };

    $scope.removeBrand = function(brand){
      var index = $scope.fl.brands.indexOf(brand);
      if (index > -1) {
          $scope.fl.brands.splice(index, 1);
          $scope.filter();
      }
    }

    $scope.Types = CategoryTNG.all.query();

    $scope.removeFeatures = function(feature){
      console.log($scope.fl.features,feature);
      // var index = $scope.fl.features.indexOf(feature);
      // if (index > -1) {
      //     $scope.fl.features.splice(index, 1);
      //     $scope.filter();
      // }
    }

    $scope.removeCategory = function(){
      $scope.fl.categories = undefined;
      $scope.filter();
    }

    $scope.products = {};
    $scope.filtered = {};
    $scope.products.busy = false;
    $scope.products.end = false;
    $scope.products.after = 0;
    $scope.products.items = [];
    // $scope.products.sort = sortOptions[0].val;
    $scope.fl = {};
    $scope.fl.brands = [];
    $scope.fl.categories = [];
    $scope.priceSlider = {};
    $scope.features = Feature.group.query();
    $scope.navigate = function(page,params){
      // var params = params.delete('$$hashKey');
      if(page==='sort'){
        delete params.$$hashKey;
        var paramString = JSON.stringify(params);
        // console.log(paramString);
        $state.go($state.current, {sort: paramString}, {reload: true});
      }
      else if(params){
        $location.replace().path(page+'/'+params.slug+'/'+params._id);
      }else{
        $location.replace().path('/');
      }
    };
    var generateBreadCrumb = function(page, id){
      $scope.breadcrumb.items = [];
      var api = $injector.get(page);
      api.get({id:id}).$promise.then(function(child){
        $scope.breadcrumb.items.push(child);
        // var p = child.parent;
        // if(p != null){findBrandPath(1);}
        if(page==='Category'){
          $scope.breadcrumb.items.push({name:'All Categories'});
        }else if(page==='Brand'){
          $scope.breadcrumb.items.push({name:'All Brands'});
        }
      });
    };


    var sort = $scope.products.sort = $stateParams.sort;
    var q = {where:{active:true},limit:10};


    // displayProducts(q);
    var a = {};
    $scope.filter = function(){
      var f = [];
      if ($scope.products.busy){ return; }
      $scope.products.busy = true;
      if($scope.fl.features){
        angular.forEach($scope.fl.features,function(val, key){
          if(val.length>0){
            f.push({'features.key' : key, 'features.val' : { $in: val}});
          }
        });
      }
      if($scope.fl.brands){
        if($scope.fl.brands.length>0){
          var brandIds = [];
          angular.forEach($scope.fl.brands,function(brand){
            brandIds.push(brand._id);
          });
          f.push({'brand._id' : { $in: brandIds } });
        }
      }
      if($scope.fl.categories){
        if($scope.fl.categories.length>0){
          var categoryIds = [];
          angular.forEach($scope.fl.categories,function(category){
            categoryIds.push(category._id);
          });
          f.push({'category._id' : { $in: categoryIds } });
        }
      }
      // if($scope.priceSlider)
      f.push({'variants.price' : { $gt: $scope.priceSlider.min, $lt:$scope.priceSlider.max } });
      // console.log(f.length);
      if(f.length>0){
        q.where = { $and : f};
      }else{
        q.where = {};
      }
      // console.log(f,q);

      displayProducts(q,true);
    };

    // $scope.filterFeatures = function() {
    //   if ($scope.products.busy){ return; }
    //   $scope.products.busy = true;
    //   a.fl = [];
    //   if($scope.fl.features){
    //       angular.forEach($scope.fl.features,function(val, key){
    //         if(val.length>0){
    //           a.fl.push({'features.key' : key, 'features.val' : { $in: val}});
    //         }
    //       });
    //       if(a.fl.length>0 && a.br && a.price) {
    //         q.where = { $and : [a.price, a.br,{$and : a.fl}]};
    //       }
    //       else if(a.br && a.price) {
    //         q.where = { $and : [a.price, a.br]};
    //       }else if(a.br) {
    //         q.where = { $and : [a.br]};
    //       }else{
    //         q.where = {};
    //       }
    //       displayProducts(q,true);
    //   }
    // };
    //
    // $scope.filterBrands = function() {
    //   // This function required to query from database in place of filtering items from angular $scope,
    //   // In some cases we load only 20 products for pagination in that case we won't be able to filter properly
    //   if ($scope.products.busy){ return; }
    //   $scope.products.busy = true;
    //   a.br = [];
    //   console.log($scope.priceSlider);
    //   if($scope.fl.brands){
    //     if($scope.fl.brands.length>0){
    //       var brandIds = [];
    //       angular.forEach($scope.fl.brands,function(brand){
    //         brandIds.push(brand._id);
    //       });
    //       a.price = {'variants.price' : { $gt: $scope.priceSlider.min, $lt:$scope.priceSlider.max } };
    //         a.br = {'brand._id' : { $in: brandIds } };
    //         q.where = { $and : [a.price, a.br, {$and : a.fl}]};
    //     }else if(a.fl){
    //       q.where = { $and : [a.price, a.fl] };
    //     }else{
    //       q.where = { $and : [a.price] };
    //     }
    //   }else {
    //     q.where.brand = undefined;
    //     q.where['brand._id'] = undefined;
    //   }
    //   displayProducts(q,true);
    // };
    //
    // $scope.filterPrice = function(price) {
    //   // This function required to query from database in place of filtering items from angular $scope,
    //   // In some cases we load only 20 products for pagination in that case we won't be able to filter properly
    //   $scope.products.busy = false;
    //   $scope.products.end = false;
    //   $scope.products.after = 0;
    //   $scope.products.items = [];
    //
    //   if ($scope.products.busy){ return;}
    //   $scope.products.busy = true;
    //     console.log('price');
    //   if(price){
    //     a.price = {'variants.price' : { $gt: price.min, $lt:price.max } };
    //     q.where = { $and : [a.price, a.br, {$and : a.fl}]};
    //   }else{
    //     q.where = { $and : [a.br, {$and : a.fl}]};
    //   }
    //   // q.where['variants.price'] = { $gt: price.min, $lt:price.max };
    //   displayProducts(q,true);
    // };

    $scope.sortNow = function(sort){
        q.sort = sort;
        displayProducts(q,true);
    };

    var displayProducts = function(q,flush){
      if(flush){
        q.skip = 0;
        $scope.products.items = [];
        $scope.products.end = false;
        $scope.products.after = 0;
      }
      $loading.start('products');
      $scope.products.busy = true;
      ProductTNG.query(q, function(data){
          for (var i = 0; i < data.length; i++) {
              $scope.products.items.push(data[i]);
          }
          $scope.filtered.count = data.length + $scope.products.after;
          if(data.length>=5) { $scope.products.after = $scope.products.after + data.length; } else { $scope.products.end = true;}
          $scope.products.busy = false;
          $loading.finish('products');
      }, function(){ $scope.products.busy = false; $loading.finish('products');});

      ProductTNG.count.query(q, function(res){
        $scope.products.count = res[0].count;
      });
    };

    $scope.resetPriceRange = function(){
      $scope.priceSlider = {
          min: 0,
          max: 1000,
          ceil: 1000,
          floor: 0
      };
      $scope.filter();
    };

    if('page' in $stateParams){
      var categoryId;
      if($stateParams.page && $stateParams._id){
        $scope.products.brand = {_id : $stateParams._id};
        $scope.breadcrumb = {type: $stateParams.page};
        generateBreadCrumb($stateParams.page,$stateParams._id);
        if($stateParams.page==='Category'){
          // categoryId = $stateParams._id;
          $scope.fl.categories.push({_id:$stateParams._id,name:$stateParams.slug});
        }else if($stateParams.page==='Brand'){
          $scope.fl.brands.push({_id:$stateParams._id,name:$stateParams.slug});
        }
        $scope.resetPriceRange();
        // q.where['brand._id'] = brandId;
        // q.where['category._id'] = categoryId;
      }else{
        q = {sort:sort,limit:10};
      }
      $scope.filter();
    }else{
      q = {limit:10};
        // console.log('wppp',q);
    }

    $scope.scroll = function() {
        if ($scope.products.busy || $scope.products.end){ return;}
        $scope.products.busy = false;
        q.skip = $scope.products.after;
        displayProducts(q);
    };


    $scope.resetPriceRange();

})


 .controller('MainOICtrl', function ($scope, $state, $stateParams, $location, ProductOI, Brand, CategoryOI, Feature, socket, $rootScope, $injector, $loading) {

    if ($stateParams.productSku) { // != null
        $scope.product = $scope.store.getProduct($stateParams.productSku);
    }




// For Price slider
    $scope.currencyFormatting = function(value){
      return  '$ ' + value.toString();
    };

    $scope.removeBrand = function(brand){
      var index = $scope.fl.brands.indexOf(brand);
      if (index > -1) {
          $scope.fl.brands.splice(index, 1);
          $scope.filter();
      }
    }

    $scope.Types = CategoryOI.all.query();

    $scope.removeFeatures = function(feature){
      console.log($scope.fl.features,feature);
      // var index = $scope.fl.features.indexOf(feature);
      // if (index > -1) {
      //     $scope.fl.features.splice(index, 1);
      //     $scope.filter();
      // }
    }

    $scope.removeCategory = function(){
      $scope.fl.categories = undefined;
      $scope.filter();
    }

    $scope.products = {};
    $scope.filtered = {};
    $scope.products.busy = false;
    $scope.products.end = false;
    $scope.products.after = 0;
    $scope.products.items = [];
    // $scope.products.sort = sortOptions[0].val;
    $scope.fl = {};
    $scope.fl.brands = [];
    $scope.fl.categories = [];
    $scope.priceSlider = {};
    $scope.features = Feature.group.query();
    $scope.navigate = function(page,params){
      // var params = params.delete('$$hashKey');
      if(page==='sort'){
        delete params.$$hashKey;
        var paramString = JSON.stringify(params);
        // console.log(paramString);
        $state.go($state.current, {sort: paramString}, {reload: true});
      }
      else if(params){
        $location.replace().path(page+'/'+params.slug+'/'+params._id);
      }else{
        $location.replace().path('/');
      }
    };
    var generateBreadCrumb = function(page, id){
      $scope.breadcrumb.items = [];
      var api = $injector.get(page);
      api.get({id:id}).$promise.then(function(child){
        $scope.breadcrumb.items.push(child);
        // var p = child.parent;
        // if(p != null){findBrandPath(1);}
        if(page==='Category'){
          $scope.breadcrumb.items.push({name:'All Categories'});
        }else if(page==='Brand'){
          $scope.breadcrumb.items.push({name:'All Brands'});
        }
      });
    };


    var sort = $scope.products.sort = $stateParams.sort;
    var q = {where:{active:true},limit:10};


    // displayProducts(q);
    var a = {};
    $scope.filter = function(){
      var f = [];
      if ($scope.products.busy){ return; }
      $scope.products.busy = true;
      if($scope.fl.features){
        angular.forEach($scope.fl.features,function(val, key){
          if(val.length>0){
            f.push({'features.key' : key, 'features.val' : { $in: val}});
          }
        });
      }
      if($scope.fl.brands){
        if($scope.fl.brands.length>0){
          var brandIds = [];
          angular.forEach($scope.fl.brands,function(brand){
            brandIds.push(brand._id);
          });
          f.push({'brand._id' : { $in: brandIds } });
        }
      }
      if($scope.fl.categories){
        if($scope.fl.categories.length>0){
          var categoryIds = [];
          angular.forEach($scope.fl.categories,function(category){
            categoryIds.push(category._id);
          });
          f.push({'category._id' : { $in: categoryIds } });
        }
      }
      // if($scope.priceSlider)
      f.push({'variants.price' : { $gt: $scope.priceSlider.min, $lt:$scope.priceSlider.max } });
      // console.log(f.length);
      if(f.length>0){
        q.where = { $and : f};
      }else{
        q.where = {};
      }
      // console.log(f,q);

      displayProducts(q,true);
    };

    // $scope.filterFeatures = function() {
    //   if ($scope.products.busy){ return; }
    //   $scope.products.busy = true;
    //   a.fl = [];
    //   if($scope.fl.features){
    //       angular.forEach($scope.fl.features,function(val, key){
    //         if(val.length>0){
    //           a.fl.push({'features.key' : key, 'features.val' : { $in: val}});
    //         }
    //       });
    //       if(a.fl.length>0 && a.br && a.price) {
    //         q.where = { $and : [a.price, a.br,{$and : a.fl}]};
    //       }
    //       else if(a.br && a.price) {
    //         q.where = { $and : [a.price, a.br]};
    //       }else if(a.br) {
    //         q.where = { $and : [a.br]};
    //       }else{
    //         q.where = {};
    //       }
    //       displayProducts(q,true);
    //   }
    // };
    //
    // $scope.filterBrands = function() {
    //   // This function required to query from database in place of filtering items from angular $scope,
    //   // In some cases we load only 20 products for pagination in that case we won't be able to filter properly
    //   if ($scope.products.busy){ return; }
    //   $scope.products.busy = true;
    //   a.br = [];
    //   console.log($scope.priceSlider);
    //   if($scope.fl.brands){
    //     if($scope.fl.brands.length>0){
    //       var brandIds = [];
    //       angular.forEach($scope.fl.brands,function(brand){
    //         brandIds.push(brand._id);
    //       });
    //       a.price = {'variants.price' : { $gt: $scope.priceSlider.min, $lt:$scope.priceSlider.max } };
    //         a.br = {'brand._id' : { $in: brandIds } };
    //         q.where = { $and : [a.price, a.br, {$and : a.fl}]};
    //     }else if(a.fl){
    //       q.where = { $and : [a.price, a.fl] };
    //     }else{
    //       q.where = { $and : [a.price] };
    //     }
    //   }else {
    //     q.where.brand = undefined;
    //     q.where['brand._id'] = undefined;
    //   }
    //   displayProducts(q,true);
    // };
    //
    // $scope.filterPrice = function(price) {
    //   // This function required to query from database in place of filtering items from angular $scope,
    //   // In some cases we load only 20 products for pagination in that case we won't be able to filter properly
    //   $scope.products.busy = false;
    //   $scope.products.end = false;
    //   $scope.products.after = 0;
    //   $scope.products.items = [];
    //
    //   if ($scope.products.busy){ return;}
    //   $scope.products.busy = true;
    //     console.log('price');
    //   if(price){
    //     a.price = {'variants.price' : { $gt: price.min, $lt:price.max } };
    //     q.where = { $and : [a.price, a.br, {$and : a.fl}]};
    //   }else{
    //     q.where = { $and : [a.br, {$and : a.fl}]};
    //   }
    //   // q.where['variants.price'] = { $gt: price.min, $lt:price.max };
    //   displayProducts(q,true);
    // };

    $scope.sortNow = function(sort){
        q.sort = sort;
        displayProducts(q,true);
    };

    var displayProducts = function(q,flush){
      if(flush){
        q.skip = 0;
        $scope.products.items = [];
        $scope.products.end = false;
        $scope.products.after = 0;
      }
      $loading.start('products');
      $scope.products.busy = true;
      ProductOI.query(q, function(data){
          for (var i = 0; i < data.length; i++) {
              $scope.products.items.push(data[i]);
          }
          $scope.filtered.count = data.length + $scope.products.after;
          if(data.length>=5) { $scope.products.after = $scope.products.after + data.length; } else { $scope.products.end = true;}
          $scope.products.busy = false;
          $loading.finish('products');
      }, function(){ $scope.products.busy = false; $loading.finish('products');});

      ProductOI.count.query(q, function(res){
        $scope.products.count = res[0].count;
      });
    };

    $scope.resetPriceRange = function(){
      $scope.priceSlider = {
          min: 0,
          max: 1000,
          ceil: 1000,
          floor: 0
      };
      $scope.filter();
    };

    if('page' in $stateParams){
      var categoryId;
      if($stateParams.page && $stateParams._id){
        $scope.products.brand = {_id : $stateParams._id};
        $scope.breadcrumb = {type: $stateParams.page};
        generateBreadCrumb($stateParams.page,$stateParams._id);
        if($stateParams.page==='Category'){
          // categoryId = $stateParams._id;
          $scope.fl.categories.push({_id:$stateParams._id,name:$stateParams.slug});
        }else if($stateParams.page==='Brand'){
          $scope.fl.brands.push({_id:$stateParams._id,name:$stateParams.slug});
        }
        $scope.resetPriceRange();
        // q.where['brand._id'] = brandId;
        // q.where['category._id'] = categoryId;
      }else{
        q = {sort:sort,limit:10};
      }
      $scope.filter();
    }else{
      q = {limit:10};
        // console.log('wppp',q);
    }

    $scope.scroll = function() {
        if ($scope.products.busy || $scope.products.end){ return;}
        $scope.products.busy = false;
        q.skip = $scope.products.after;
        displayProducts(q);
    };


    $scope.resetPriceRange();

})


 .controller('MainMPCtrl', function ($scope, $state, $stateParams, $location, ProductMP, BrandMP, CategoryMP, Feature, socket, $rootScope, $injector, $loading) {

    if ($stateParams.productSku) { // != null
        $scope.product = $scope.store.getProduct($stateParams.productSku);
    }

 	$scope.images = [
    'img/fader-images/mp1.jpg',
    'img/fader-images/mp2.jpg',
    'img/fader-images/mp3.jpg',
    'img/fader-images/mp4.jpg'
  ];
  
  // callbacks for change in slides
  $scope.updateTsPrevious = function() {
    $scope.tsPrevious = +new Date();
  };
  $scope.updateTsNext = function() {
    $scope.tsNext = +new Date();
  };




// For Price slider
    $scope.currencyFormatting = function(value){
      return  '$ ' + value.toString();
    };

    $scope.removeBrand = function(brand){
      var index = $scope.fl.brands.indexOf(brand);
      if (index > -1) {
          $scope.fl.brands.splice(index, 1);
          $scope.filter();
      }
    }

    $scope.Types = CategoryMP.all.query();

    $scope.removeFeatures = function(feature){
      console.log($scope.fl.features,feature);
      // var index = $scope.fl.features.indexOf(feature);
      // if (index > -1) {
      //     $scope.fl.features.splice(index, 1);
      //     $scope.filter();
      // }
    }

    $scope.removeCategory = function(){
      $scope.fl.categories = undefined;
      $scope.filter();
    }

    $scope.products = {};
    $scope.filtered = {};
    $scope.products.busy = false;
    $scope.products.end = false;
    $scope.products.after = 0;
    $scope.products.items = [];
    // $scope.products.sort = sortOptions[0].val;
    $scope.fl = {};
    $scope.fl.brands = [];
    $scope.fl.categories = [];
    $scope.priceSlider = {};
    $scope.features = Feature.group.query();
    $scope.navigate = function(page,params){
      // var params = params.delete('$$hashKey');
      if(page==='sort'){
        delete params.$$hashKey;
        var paramString = JSON.stringify(params);
        // console.log(paramString);
        $state.go($state.current, {sort: paramString}, {reload: true});
      }
      else if(params){
        $location.replace().path(page+'/'+params.slug+'/'+params._id);
      }else{
        $location.replace().path('/');
      }
    };
    var generateBreadCrumb = function(page, id){
      $scope.breadcrumb.items = [];
      var api = $injector.get(page);
      api.get({id:id}).$promise.then(function(child){
        $scope.breadcrumb.items.push(child);
        // var p = child.parent;
        // if(p != null){findBrandPath(1);}
        if(page==='Category'){
          $scope.breadcrumb.items.push({name:'All Categories'});
        }else if(page==='Brand'){
          $scope.breadcrumb.items.push({name:'All Brands'});
        }
      });
    };


    var sort = $scope.products.sort = $stateParams.sort;
    var q = {where:{active:true},limit:10};


    // displayProducts(q);
    var a = {};
    $scope.filter = function(){
      var f = [];
      if ($scope.products.busy){ return; }
      $scope.products.busy = true;
      if($scope.fl.features){
        angular.forEach($scope.fl.features,function(val, key){
          if(val.length>0){
            f.push({'features.key' : key, 'features.val' : { $in: val}});
          }
        });
      }
      if($scope.fl.brands){
        if($scope.fl.brands.length>0){
          var brandIds = [];
          angular.forEach($scope.fl.brands,function(brand){
            brandIds.push(brand._id);
          });
          f.push({'brand._id' : { $in: brandIds } });
        }
      }
      if($scope.fl.categories){
        if($scope.fl.categories.length>0){
          var categoryIds = [];
          angular.forEach($scope.fl.categories,function(category){
            categoryIds.push(category._id);
          });
          f.push({'category._id' : { $in: categoryIds } });
        }
      }
      // if($scope.priceSlider)
      f.push({'variants.price' : { $gt: $scope.priceSlider.min, $lt:$scope.priceSlider.max } });
      // console.log(f.length);
      if(f.length>0){
        q.where = { $and : f};
      }else{
        q.where = {};
      }
      // console.log(f,q);

      displayProducts(q,true);
    };

    // $scope.filterFeatures = function() {
    //   if ($scope.products.busy){ return; }
    //   $scope.products.busy = true;
    //   a.fl = [];
    //   if($scope.fl.features){
    //       angular.forEach($scope.fl.features,function(val, key){
    //         if(val.length>0){
    //           a.fl.push({'features.key' : key, 'features.val' : { $in: val}});
    //         }
    //       });
    //       if(a.fl.length>0 && a.br && a.price) {
    //         q.where = { $and : [a.price, a.br,{$and : a.fl}]};
    //       }
    //       else if(a.br && a.price) {
    //         q.where = { $and : [a.price, a.br]};
    //       }else if(a.br) {
    //         q.where = { $and : [a.br]};
    //       }else{
    //         q.where = {};
    //       }
    //       displayProducts(q,true);
    //   }
    // };
    //
    // $scope.filterBrands = function() {
    //   // This function required to query from database in place of filtering items from angular $scope,
    //   // In some cases we load only 20 products for pagination in that case we won't be able to filter properly
    //   if ($scope.products.busy){ return; }
    //   $scope.products.busy = true;
    //   a.br = [];
    //   console.log($scope.priceSlider);
    //   if($scope.fl.brands){
    //     if($scope.fl.brands.length>0){
    //       var brandIds = [];
    //       angular.forEach($scope.fl.brands,function(brand){
    //         brandIds.push(brand._id);
    //       });
    //       a.price = {'variants.price' : { $gt: $scope.priceSlider.min, $lt:$scope.priceSlider.max } };
    //         a.br = {'brand._id' : { $in: brandIds } };
    //         q.where = { $and : [a.price, a.br, {$and : a.fl}]};
    //     }else if(a.fl){
    //       q.where = { $and : [a.price, a.fl] };
    //     }else{
    //       q.where = { $and : [a.price] };
    //     }
    //   }else {
    //     q.where.brand = undefined;
    //     q.where['brand._id'] = undefined;
    //   }
    //   displayProducts(q,true);
    // };
    //
    // $scope.filterPrice = function(price) {
    //   // This function required to query from database in place of filtering items from angular $scope,
    //   // In some cases we load only 20 products for pagination in that case we won't be able to filter properly
    //   $scope.products.busy = false;
    //   $scope.products.end = false;
    //   $scope.products.after = 0;
    //   $scope.products.items = [];
    //
    //   if ($scope.products.busy){ return;}
    //   $scope.products.busy = true;
    //     console.log('price');
    //   if(price){
    //     a.price = {'variants.price' : { $gt: price.min, $lt:price.max } };
    //     q.where = { $and : [a.price, a.br, {$and : a.fl}]};
    //   }else{
    //     q.where = { $and : [a.br, {$and : a.fl}]};
    //   }
    //   // q.where['variants.price'] = { $gt: price.min, $lt:price.max };
    //   displayProducts(q,true);
    // };

    $scope.sortNow = function(sort){
        q.sort = sort;
        displayProducts(q,true);
    };

    var displayProducts = function(q,flush){
      if(flush){
        q.skip = 0;
        $scope.products.items = [];
        $scope.products.end = false;
        $scope.products.after = 0;
      }
      $loading.start('products');
      $scope.products.busy = true;
      ProductMP.query(q, function(data){
          for (var i = 0; i < data.length; i++) {
              $scope.products.items.push(data[i]);
          }
          $scope.filtered.count = data.length + $scope.products.after;
          if(data.length>=5) { $scope.products.after = $scope.products.after + data.length; } else { $scope.products.end = true;}
          $scope.products.busy = false;
          $loading.finish('products');
      }, function(){ $scope.products.busy = false; $loading.finish('products');});

      ProductMP.count.query(q, function(res){
        $scope.products.count = res[0].count;
      });
    };

    $scope.resetPriceRange = function(){
      $scope.priceSlider = {
          min: 0,
          max: 1000,
          ceil: 1000,
          floor: 0
      };
      $scope.filter();
    };

    if('page' in $stateParams){
      var categoryId;
      if($stateParams.page && $stateParams._id){
        $scope.products.brand = {_id : $stateParams._id};
        $scope.breadcrumb = {type: $stateParams.page};
        generateBreadCrumb($stateParams.page,$stateParams._id);
        if($stateParams.page==='Category'){
          // categoryId = $stateParams._id;
          $scope.fl.categories.push({_id:$stateParams._id,name:$stateParams.slug});
        }else if($stateParams.page==='Brand'){
          $scope.fl.brands.push({_id:$stateParams._id,name:$stateParams.slug});
        }
        $scope.resetPriceRange();
        // q.where['brand._id'] = brandId;
        // q.where['category._id'] = categoryId;
      }else{
        q = {sort:sort,limit:10};
      }
      $scope.filter();
    }else{
      q = {limit:10};
        // console.log('wppp',q);
    }

    $scope.scroll = function() {
        if ($scope.products.busy || $scope.products.end){ return;}
        $scope.products.busy = false;
        q.skip = $scope.products.after;
        displayProducts(q);
    };


    $scope.resetPriceRange();

})


 .controller('CategoryCtrl', function ($scope,  $stateParams, $location, Product,ProductMP,ProductOI,ProductTNG, Brand,BrandMP,BrandOI, Category,CategoryMP,CategoryOI,CategoryTNG, Feature, socket, $rootScope, $injector, $loading) {
  
	console.log($rootScope.nav);


		var g = [];

      var nav = $rootScope.nav;

    $scope.data = null;
    if ($stateParams.productSku) { // != null
        $scope.product = $scope.store.getProduct($stateParams.productSku);
    }

    console.log($stateParams._id);

    $scope.category = Category.get({id:$stateParams._id},function(data) {
      
      $scope.data = data.category;
      console.log(data);
    });


    





// For Price slider
    $scope.currencyFormatting = function(value){
      return  '$ ' + value.toString();
    };

    $scope.removeBrand = function(brand){
      var index = $scope.fl.brands.indexOf(brand);
      if (index > -1) {
          $scope.fl.brands.splice(index, 1);
          $scope.filter();
      }
    }

    $scope.Types = Category.all.query();
    $scope.categories = Category.all.query(function (data) {
    	console.log(data);
    });

    $scope.removeFeatures = function(feature){
      console.log($scope.fl.features,feature);
      // var index = $scope.fl.features.indexOf(feature);
      // if (index > -1) {
      //     $scope.fl.features.splice(index, 1);
      //     $scope.filter();
      // }
    }

    $scope.removeCategory = function(){
      $scope.fl.categories = undefined;
      $scope.filter();
    }

    $scope.products = {};
    $scope.filtered = {};
    $scope.products.busy = false;
    $scope.products.end = false;
    $scope.products.after = 0;
    $scope.products.items = [];
    // $scope.products.sort = sortOptions[0].val;
    $scope.fl = {};
    $scope.fl.brands = [];
    $scope.fl.categories = [];
    $scope.priceSlider = {};
    $scope.features = Feature.group.query();
    
    $scope.navigate = function(page,params){
      // var params = params.delete('$$hashKey');
      if(page==='sort'){
        delete params.$$hashKey;
        var paramString = JSON.stringify(params);
        // console.log(paramString);
        $state.go($state.current, {sort: paramString}, {reload: true});
      }
      else if(params){
        $location.replace().path(page+'/'+params.slug+'/'+params._id);
      }else{
        $location.replace().path('/');
      }
    };
    var generateBreadCrumb = function(page, id){
      $scope.breadcrumb.items = [];
      var api = $injector.get(page);
      api.get({id:id}).$promise.then(function(child){
        $scope.breadcrumb.items.push(child);
        // var p = child.parent;
        // if(p != null){findBrandPath(1);}
        if(page==='Category'){
          $scope.breadcrumb.items.push({name:'All Categories'});
        }else if(page==='Brand'){
          $scope.breadcrumb.items.push({name:'All Brands'});
        }
      });
    };

    var sort = $scope.products.sort = $stateParams.sort;
    var q = {where:{active:true},limit:10};


    // displayProducts(q);
    var a = {};
    $scope.filter = function(){
      var f = [];

      if ($scope.products.busy){ return; }
      $scope.products.busy = true;
      if($scope.fl.features){
        angular.forEach($scope.fl.features,function(val, key){
          if(val.length>0){
            f.push({'features.key' : key, 'features.val' : { $in: val}});
          }
        });
      }
      if($scope.fl.brands){
        if($scope.fl.brands.length>0){
          var brandIds = [];
          angular.forEach($scope.fl.brands,function(brand){
            brandIds.push(brand._id);
          });
          f.push({'brand._id' : { $in: brandIds } });
        }
      }
      if($scope.fl.categories){
         if($scope.fl.categories.length>0){
          var categoryIds = [];
          var idFlag = null;
          var parentFlag = null;
          angular.forEach($scope.fl.categories,function(category){

          if(category._id.length > 10){
              idFlag = "hello";
          	
          }
          	
           categoryIds.push(category._id);
          });

          if(idFlag){

          	f.push({'category._id' : { $in: categoryIds } });
          }else{
      
          	f.push({'category.parentCategory' : { $in: categoryIds } });
          }


          
        }
      }
      // if($scope.priceSlider)
      f.push({'variants.price' : { $gt: $scope.priceSlider.min, $lt:$scope.priceSlider.max } });
      // console.log(f.length);
      if(f.length>0){
        q.where = { $and : f};
      }else{
        q.where = {};
      }
      // console.log(f,q);

      displayProducts(q,true);
    };

    // $scope.filterFeatures = function() {
    //   if ($scope.products.busy){ return; }
    //   $scope.products.busy = true;
    //   a.fl = [];
    //   if($scope.fl.features){
    //       angular.forEach($scope.fl.features,function(val, key){
    //         if(val.length>0){
    //           a.fl.push({'features.key' : key, 'features.val' : { $in: val}});
    //         }
    //       });
    //       if(a.fl.length>0 && a.br && a.price) {
    //         q.where = { $and : [a.price, a.br,{$and : a.fl}]};
    //       }
    //       else if(a.br && a.price) {
    //         q.where = { $and : [a.price, a.br]};
    //       }else if(a.br) {
    //         q.where = { $and : [a.br]};
    //       }else{
    //         q.where = {};
    //       }
    //       displayProducts(q,true);
    //   }
    // };
    //
    // $scope.filterBrands = function() {
    //   // This function required to query from database in place of filtering items from angular $scope,
    //   // In some cases we load only 20 products for pagination in that case we won't be able to filter properly
    //   if ($scope.products.busy){ return; }
    //   $scope.products.busy = true;
    //   a.br = [];
    //   console.log($scope.priceSlider);
    //   if($scope.fl.brands){
    //     if($scope.fl.brands.length>0){
    //       var brandIds = [];
    //       angular.forEach($scope.fl.brands,function(brand){
    //         brandIds.push(brand._id);
    //       });
    //       a.price = {'variants.price' : { $gt: $scope.priceSlider.min, $lt:$scope.priceSlider.max } };
    //         a.br = {'brand._id' : { $in: brandIds } };
    //         q.where = { $and : [a.price, a.br, {$and : a.fl}]};
    //     }else if(a.fl){
    //       q.where = { $and : [a.price, a.fl] };
    //     }else{
    //       q.where = { $and : [a.price] };
    //     }
    //   }else {
    //     q.where.brand = undefined;
    //     q.where['brand._id'] = undefined;
    //   }
    //   displayProducts(q,true);
    // };
    //
    // $scope.filterPrice = function(price) {
    //   // This function required to query from database in place of filtering items from angular $scope,
    //   // In some cases we load only 20 products for pagination in that case we won't be able to filter properly
    //   $scope.products.busy = false;
    //   $scope.products.end = false;
    //   $scope.products.after = 0;
    //   $scope.products.items = [];
    //
    //   if ($scope.products.busy){ return;}
    //   $scope.products.busy = true;
    //     console.log('price');
    //   if(price){
    //     a.price = {'variants.price' : { $gt: price.min, $lt:price.max } };
    //     q.where = { $and : [a.price, a.br, {$and : a.fl}]};
    //   }else{
    //     q.where = { $and : [a.br, {$and : a.fl}]};
    //   }
    //   // q.where['variants.price'] = { $gt: price.min, $lt:price.max };
    //   displayProducts(q,true);
    // };

    $scope.sortNow = function(sort){
        q.sort = sort;
        displayProducts(q,true);
    };

    var displayProducts = function(q,flush){
      if(flush){
        q.skip = 0;
        $scope.products.items = [];
        $scope.products.end = false;
        $scope.products.after = 0;
      }
      $loading.start('products');
      $scope.products.busy = true;

       Product.query(q, function(data){
			          for (var i = 0; i < data.length; i++) {
			              $scope.products.items.push(data[i]);
			          }
			          $scope.filtered.count = data.length + $scope.products.after;
			          if(data.length>=5) { $scope.products.after = $scope.products.after + data.length; } else { $scope.products.end = true;}
			          $scope.products.busy = false;
			          $loading.finish('products');
			      }, function(){ $scope.products.busy = false; $loading.finish('products');});

			      Product.count.query(q, function(res){
			        $scope.products.count = res[0].count;
			      });

			       ProductMP.query(q, function(data){
			          for (var i = 0; i < data.length; i++) {
			              $scope.products.items.push(data[i]);
			          }
			          $scope.filtered.count = data.length + $scope.products.after;
			          if(data.length>=5) { $scope.products.after = $scope.products.after + data.length; } else { $scope.products.end = true;}
			          $scope.products.busy = false;
			          $loading.finish('products');
			      }, function(){ $scope.products.busy = false; $loading.finish('products');});

			      ProductMP.count.query(q, function(res){
			        $scope.products.count = res[0].count;
			      });

			       ProductOI.query(q, function(data){
			          for (var i = 0; i < data.length; i++) {
			              $scope.products.items.push(data[i]);
			          }
			          $scope.filtered.count = data.length + $scope.products.after;
			          if(data.length>=5) { $scope.products.after = $scope.products.after + data.length; } else { $scope.products.end = true;}
			          $scope.products.busy = false;
			          $loading.finish('products');
			      }, function(){ $scope.products.busy = false; $loading.finish('products');});

			      ProductOI.count.query(q, function(res){
			        $scope.products.count = res[0].count;
			      });

			       ProductTNG.query(q, function(data){
			          for (var i = 0; i < data.length; i++) {
			              $scope.products.items.push(data[i]);
			          }
			          $scope.filtered.count = data.length + $scope.products.after;
			          if(data.length>=5) { $scope.products.after = $scope.products.after + data.length; } else { $scope.products.end = true;}
			          $scope.products.busy = false;
			          $loading.finish('products');
			      }, function(){ $scope.products.busy = false; $loading.finish('products');});

			      ProductTNG.count.query(q, function(res){
			        $scope.products.count = res[0].count;
			      });
     

			     
    };

    $scope.resetPriceRange = function(){
      $scope.priceSlider = {
          min: 0,
          max: 1000,
          ceil: 1000,
          floor: 0
      };
      $scope.filter();
    };

    if('page' in $stateParams){
      var categoryId;
      if($stateParams.page && $stateParams._id){
        $scope.products.brand = {_id : $stateParams._id};
        $scope.breadcrumb = {type: $stateParams.page};
        generateBreadCrumb($stateParams.page,$stateParams._id);
        if($stateParams.page==='Category'){
          // categoryId = $stateParams._id;
          $scope.fl.categories.push({_id:$stateParams._id,name:$stateParams.slug});
        }else if($stateParams.page==='Brand'){
          $scope.fl.brands.push({_id:$stateParams._id,name:$stateParams.slug});
        }
        $scope.resetPriceRange();
        // q.where['brand._id'] = brandId;
        // q.where['category._id'] = categoryId;
      }else{
        q = {sort:sort,limit:10};
      }
      $scope.filter();
    }else{
      q = {limit:10};
        // console.log('wppp',q);
    }

    $scope.scroll = function() {
        if ($scope.products.busy || $scope.products.end){ return;}
        $scope.products.busy = false;
        q.skip = $scope.products.after;
        displayProducts(q);
    };


    $scope.resetPriceRange();

});

