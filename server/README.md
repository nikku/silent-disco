Silent Disco - Server
=====================

> Requires [MongoDB](http://mongodb.org/) instance, JDK 7 and netty 4

A simple backend for silent disco implemented on top of netty that uses MongoDB for persistence.


Run
---

Package via `mvn clean package`. Creates the standalone jar `target/silent-disco-server-{VERSION}-jar-with-dependencies.jar`.

Run (standalone jar): `java -jar JAR_FILE host:port`


Test
----

Test via `mvn clean test`

