/*! iNoBounce - v0.1.6
* https://github.com/lazd/iNoBounce/
* Copyright (c) 2013 Larry Davis <lazdnet@gmail.com>; Licensed BSD */
(function(global) {
	// Stores the Y position where the touch started
  var startY = 0;
  var startX = 0;

	// Store enabled status
	var enabled = false;

	var supportsPassiveOption = false;
	try {
		var opts = Object.defineProperty({}, 'passive', {
			get: function() {
				supportsPassiveOption = true;
			}
		});
		window.addEventListener('test', null, opts);
	} catch (e) {}

	var handleTouchmove = function(evt) {
		// Get the element that was scrolled upon
		var el = evt.target;

		// Allow zooming
		var zoom = window.innerWidth / window.document.documentElement.clientWidth;
		if (evt.touches.length > 1 || zoom !== 1) {
			return;
		}

		// Check all parent elements for scrollability
		while (el !== document.body && el !== document) {
			// Get some style properties
			var style = window.getComputedStyle(el);

			if (!style) {
				// If we've encountered an element we can't compute the style for, get out
				break;
			}

			// Ignore range input element
			if (el.nodeName === 'INPUT' && el.getAttribute('type') === 'range') {
				return;
			}

			var scrolling = style.getPropertyValue('-webkit-overflow-scrolling');
			var overflowY = style.getPropertyValue('overflow-y');
			var overflowX = style.getPropertyValue('overflow-x');
			var height = parseInt(style.getPropertyValue('height'), 10);

			// Determine if the element should scroll
			var isScrollable = isScrollableCheck(scrolling, overflowY, overflowX);
			var canScroll = canScrollCheck(overflowY, el);

			if (isScrollable && canScroll) {

				if (overflowY === 'auto' || overflowY === 'scroll') {
					horScroll(evt, height, el)
				}
				else {
					vertScroll(evt)
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

	// ensure user is scrolling horizontally
	var vertScroll = function(evt){
		// Get the current Y position of the touch
		var curY = evt.touches ? evt.touches[0].screenY : evt.screenY;
		// Get the current X position of the touch
		var curX = evt.touches ? evt.touches[0].screenX : evt.screenX;

		var Ydiff = Math.abs(startY-curY)
		var Xdiff = Math.abs(startX-curX)

		// prevent if the user tried to scroll vertical in horizontal area
		if (Ydiff > Xdiff) {
			evt.preventDefault();
		}
	}

  var horScroll = function(evt, height, el){
    // Get the current Y position of the touch
    var curY = evt.touches ? evt.touches[0].screenY : evt.screenY;

    // Determine if the user is trying to scroll past the top or bottom
    // In this case, the window will bounce, so we have to prevent scrolling completely
    var isAtTop = (startY <= curY && el.scrollTop === 0);
    var isAtBottom = (startY >= curY && el.scrollHeight - el.scrollTop === height);

    // Stop a bounce bug when at the bottom or top of the scrollable element
    // Only need this for vertical scrolling
    if ( isAtTop || isAtBottom) {
      evt.preventDefault();
    }
  }

	var canScrollCheck = function(overflowY, el){
		if (overflowY === 'auto' || overflowY === 'scroll') {
			return el.scrollHeight > el.offsetHeight
		}

		return el.scrollWidth > el.offsetWidth;
	}

  var isScrollableCheck = function(scrolling, overflowY, overflowX){
		isTouchScroll = scrolling === 'touch';
		scrollY = (overflowY === 'auto' || overflowY === 'scroll');
		scrollX = (overflowX === 'auto' || overflowX === 'scroll');

		return isTouchScroll && (scrollY || scrollX);
  }

	var handleTouchstart = function(evt) {
		// Store the first Y position of the touch
    startY = evt.touches ? evt.touches[0].screenY : evt.screenY;
		// Store the first X position of the touch
		startX = evt.touches ? evt.touches[0].screenX : evt.screenX;
	};

  var enable = function() {
		// Listen to a couple key touch events
		window.addEventListener('touchstart', handleTouchstart, supportsPassiveOption ? { passive : false } : false);
		window.addEventListener('touchmove', handleTouchmove, supportsPassiveOption ? { passive : false } : false);
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
			define('iNoBounce', [], function() { return iNoBounce; });
		}(global.define));
	}
	else {
		// Browser support
		global.iNoBounce = iNoBounce;
	}
}(this));
