ngDefine('disco.services', [ 'jquery' ], function(module, $) {

  module.service('Notifications', function() {

    var focused = false;
    var enabled = false;

    $(document).blur(function () { focused = false; });
    $(document).focus(function() { focused = true; });

    function WebkitNotifications() {
      var notifications = window.webkitNotifications;

      this.create = function(icon, title, content) {

        if (focused || !enabled) {
          return;
        }

        if (!notifications.checkPermission()) {
          // 0 is PERMISSION_ALLOWED
          // function defined in step 2
          notifications.createNotification(icon, title, content).show();
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
