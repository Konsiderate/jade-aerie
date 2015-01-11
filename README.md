DO NOT USE THIS YET, IT'S A MASSIVE WORK IN PROGRESS.

# jade-aerie

Template cache management for [jade-lang](http://jade-lang.com/) in [Node.js](http://nodejs.org/).

## Introduction

Jade was not designed for performance and can add significant delay to web requests. While Jade in express provides lazy in memory caching this could be better enhanced to be GC resistant and utilize a third party caching layer (memcache, redis, etc.)

jade-aerie seeks to provide a configureable and non-intrusive caching experience; utilizing compiled templates, and a third party caching layer.

## Getting Started

Each view is a representation of a data object, a collection of data objects or
other views. Each view is cached using an id and version and maybe referenced
by any other view. This created the Russian Nesting Doll effect. When caching
is enabled a fully rendered top-level view is returned. If a data object is
modified it's cache is busted as is the cache of all ancestor views. Rebuilding
the top-level page can be done quickly as all the child views are cached, with
the exception of the modified resource.

Each child view must have a clear path to all it's ancestor views to notify the
top-level view when a rebuild is required.