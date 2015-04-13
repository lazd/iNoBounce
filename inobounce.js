/*! iNoBounce - v0.1.2
* https://github.com/lazd/iNoBounce/
* Copyright (c) 2013 Larry Davis <lazdnet@gmail.com>; Licensed BSD */
(function(global) {
	// Stores the X & Y position where the touch started
	var startY = 0;
	var startX = 0;

	// Store enabled status
	var enabled = false;

	var handleTouchmove = function(evt) {
		// Get the element that was scrolled upon
		var el = evt.target;

		// Check all parent elements for scrollability
		while (el !== document.body) {
			// Get some style properties
			var style = window.getComputedStyle(el);

			if (!style) {
				// If we've encountered an element we can't compute the style for, get out
				break;
			}

			var scrolling = style.getPropertyValue('-webkit-overflow-scrolling');

			// Handle Y
			var overflowY = style.getPropertyValue('overflow-y');
			var height = parseInt(style.getPropertyValue('height'), 10);

			// Determine if the element should scroll
			var isYScrollable = scrolling === 'touch' && (overflowY === 'auto' || overflowY === 'scroll');
			var canYScroll = el.scrollHeight > el.offsetHeight;

			if (isYScrollable && canYScroll) {
				// Get the current Y position of the touch
				var curY = evt.touches ? evt.touches[0].screenY : evt.screenY;

				// Determine if the user is trying to scroll past the top or bottom
				// In this case, the window will bounce, so we have to prevent scrolling completely
				var isAtTop = (startY <= curY && el.scrollTop === 0);
				var isAtBottom = (startY >= curY && el.scrollHeight - el.scrollTop === height);

				// Stop a bounce bug when at the bottom or top of the scrollable element
				if (isAtTop || isAtBottom) {
					evt.preventDefault();
				}

				// No need to continue up the DOM, we've done our job
				return;
			}

			// Handle X
			var overflowX = style.getPropertyValue('overflow-x');
			var width = parseInt(style.getPropertyValue('width'), 10);

			// Determine if the element should scroll
			var isXScrollable = scrolling === 'touch' && (overflowX === 'auto' || overflowX === 'scroll');
			var canXScroll = el.scrollWidth > el.offsetWidth;

			if (isXScrollable && canXScroll){
				// Get the current X position of the touch
				var curX = evt.touches ? evt.touches[0].screenX : evt.screenX;

				// Determine if the user is trying to scroll past the left or right
				// In this case, the window will bounce, so we have to prevent scrolling completely
				var isAtLeft = (startX <= curX && el.scrollLeft === 0);
				var isAtRight = (startX >= curX && el.scrollWidth - el.scrollLeft === width);

				// Stop a bounce bug when at the left or right of the scrollable element
				if (isAtLeft || isAtRight) {
					evt.preventDefault();
				}

				// No need to continue up the DOM, we've done our job
				return;
			}

			// Test the next parent
			el = el.parentNode;
		}
		// Stop the bouncing -- no parents are scrollable
		evt.preventDefault();
	};

	var handleTouchstart = function(evt) {
		// Store the first X & Y position of the touch
		startY = evt.touches ? evt.touches[0].screenY : evt.screenY;
		startX = evt.touches ? evt.touches[0].screenX : evt.screenX;
	};

	var enable = function() {
		// Listen to a couple key touch events
		window.addEventListener('touchstart', handleTouchstart, false);
		window.addEventListener('touchmove', handleTouchmove, false);
		enabled = true;
	};

	var disable = function() {
		// Stop listening
		window.removeEventListener('touchstart', handleTouchstart, false);
		window.removeEventListener('touchmove', handleTouchmove, false);
		enabled = false;
	};

	var isEnabled = function() {
		return enabled;
	};

	// Enable by default if the browser supports -webkit-overflow-scrolling
	// Test this by setting the property with JavaScript on an element that exists in the DOM
	// Then, see if the property is reflected in the computed style
	var testDiv = document.createElement('div');
	document.documentElement.appendChild(testDiv);
	testDiv.style.WebkitOverflowScrolling = 'touch';
	var scrollSupport = 'getComputedStyle' in window && window.getComputedStyle(testDiv)['-webkit-overflow-scrolling'] === 'touch';
	document.documentElement.removeChild(testDiv);

	if (scrollSupport) {
		enable();
	}

	// A module to support enabling/disabling iNoBounce
	var iNoBounce = {
		enable: enable,
		disable: disable,
		isEnabled: isEnabled
	};

	if (typeof module !== 'undefined' && module.exports) {
		// Node.js Support
		module.exports = iNoBounce;
	}
	if (typeof global.define === 'function') {
		// AMD Support
		(function(define) {
			define(function() { return iNoBounce; });
		}(global.define));
	}
	else {
		// Browser support
		global.iNoBounce = iNoBounce;
	}
}(this));
