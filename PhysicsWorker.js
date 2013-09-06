'use strict';

var objects = {};

onmessage = function(event) {
	postMessage(event.data);
}