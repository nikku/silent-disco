ngDefine('common.web.scrollable', [
  'jquery',
  'jquery-custom-scrollbar'
], function(module, $) {

  var ScrollFactory = function factory() {
    return {
      restrict: 'C',
      link: function (scope, element, attrs) {


        // make the element scrollable
        element.mCustomScrollbar();

        var scrollWatch = attrs['scrollWatch'];

        if (scrollWatch) {
          scope.$watch(scrollWatch, function() {

            setTimeout(function() {
              element.mCustomScrollbar("update");
              element.mCustomScrollbar("scrollTo", "strong:last", { scrollInertia: 0 }); //scroll to appended content
            }, 100);
          });
        }
      }
    };
  };

  module.directive("scrollable", ScrollFactory);
});
