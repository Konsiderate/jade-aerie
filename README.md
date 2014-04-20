# jade-aerie

Template cache management for [jade-lang](http://jade-lang.com/) in [Node.js](http://nodejs.org/).

## Introduction

Jade was not designed for performance and can add significant delay to web requests. While Jade in express provides lazy in memory caching this could be better enhanced to be GC resistant and utilize a third party caching layer (memcache, redis, etc.)

jade-aerie seeks to provide a highly configureable and non-intrusive caching experience; utilizing compiled templates, and a third party caching layer.
