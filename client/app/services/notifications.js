ngDefine('disco.services', [ 'jquery' ], function(module, $) {

  module.service('Notifications', function() {

    var focused = false;
    var enabled = false;

    $(document).blur(function () { focused = false; });
    $(document).focus(function() { focused = true; });

    function WebkitNotifications() {
      var notifications = window.webkitNotifications;

      var open = [];

      this.create = function(icon, title, content) {

        if (focused || !enabled) {
          return;
        }

        if (!notifications.checkPermission()) {
          // 0 is PERMISSION_ALLOWED
          // function defined in step 2
          var notification = notifications.createNotification(icon, title, content);

          var win = window;

          open.push(notification);

          notification.onclose = function() {
            var idx = open.indexOf(notification);
            if (idx != -1) {
              open.splice(idx, 1);
            }
          };

          notification.onshow = function() {
            setTimeout(function() {
              notification.close();
            }, 15000);
          };

          notification.onclick = function() {
            $(win).focus();
            notification.close();
          };

          if (open.length > 2) {
            open.shift().close();
          }

          notification.show();
        }
      };

      this.toggle = function() {
        if (!enabled) {
          notifications.requestPermission();
        }

        enabled = !enabled;
      };

      this.enabled = function() {
        return enabled;
      };
    }

    var Notifications = null;

    if (window.webkitNotifications) {
      return new WebkitNotifications();
    } else {
      return {
        create: function() {},
        enabled: function() {},
        toggle: function() {}
      };
    }
  });
});
