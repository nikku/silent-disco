Silent Disco
============

![Silent Disco Screenshot](https://raw.github.com/Nikku/silent-disco/master/images/screenshot.png)

Silent disco allows people to sync the music they are streaming from 
[SoundCloud](https://soundcloud.com) with others that want to listen to the same stuff.
To do so, users may enter rooms that share a common playlist and play status.


Components
----------

A [client](https://github.com/Nikku/silent-disco/tree/master/client) written in [AngularJS](http://angularjs.org) that synchronizes itself with a silent disco server via [Websockets](http://www.html5rocks.com/en/tutorials/websockets/basics/).
It interacts with SoundCloud via the [SoundCloud API](http://developers.soundcloud.com/docs/api/sdks#javascript).

A [standalone backend](https://github.com/Nikku/silent-disco/tree/master/server) built on top of [netty](http://netty.io) and [MongoDB](http://www.mongodb.org/). 


Other Projects
--------------

- [Silent Disco Scala](https://github.com/adrobisch/silent-disco-scala): a silent disco backend implemented with Play 2.0, Scala and MongoDB.
- [Loudcloud](https://github.com/mgibowski/loudcloud): Original idea.


License
-------

You may use silent-disco under the terms of the MIT License.
