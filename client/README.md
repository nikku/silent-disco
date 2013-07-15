Silent Disco - client
---------------------

Standalone client application for silent disco that is built via [AngularJS](http://angularjs.org).
Interactions are synchronized via web sockets.


Run
---

Update the following line in `src/main/webapp/app/index.html` to point to a running silent disco server by adding a `ws-base` attribute:

    <base href="." />

The default implementation will assume the websocket backend is running under the same host/port the client application is served on.

Create a `src/main/webapp/app/soundcloud/client.js` file based on the provided `client.sample.js` sample.

Deploy `src/main/webapp` directory to a webserver (i.e. Apache2 / asdf).


Test
----

> Requires [NodeJS](http://nodejs.org/) and [karma](http://karma-runner.github.com).
>
> Install karma `npm -g install karma@canary` + dependencies `npm update --dev`.
>
> Additionally paths to browser runtimes may need to be defined in environment variables:
> <code>PHANTOMJS_BIN</code>, <code>FIREFOX_BIN</code>, <code>CHROME_BIN</code>.

Run unit tests via `karma start src/test/javascript/config/karma.unit.js`.