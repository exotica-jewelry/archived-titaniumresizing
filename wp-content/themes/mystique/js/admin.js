
/**
* Cookie plugin
*
* Copyright (c) 2006 Klaus Hartl (stilbuero.de)
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
*/
jQuery.cookie = function(name, value, options){
  if(typeof value != 'undefined'){ // name and value given, set cookie
    options = options || {};
    if(value === null){
      value = '';
      options.expires = -1;
    }
    var expires = '';
    if(options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)){
      var date;
      if(typeof options.expires == 'number'){
        date = new Date();
        date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
      }else{
        date = options.expires;
      }
      expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
    }

    // CAUTION: Needed to parenthesize options.path and options.domain
    // in the following expressions, otherwise they evaluate to undefined
    // in the packed version for some reason...
    var path = options.path ? '; path=' + (options.path) : '',
        domain = options.domain ? '; domain=' + (options.domain) : '',
        secure = options.secure ? '; secure' : '';
    document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');

  }else{ // only name given, get cookie
    var cookieValue = null;
    if(document.cookie && document.cookie != ''){
      var cookies = document.cookie.split(';');
      for(var i = 0; i < cookies.length; i++){
        var cookie = jQuery.trim(cookies[i]);
        // Does this cookie string begin with the name we want?
        if(cookie.substring(0, name.length + 1) == (name + '=')){
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
};





/*
 jQuery Form Dependencies 1.2, http://digitalnature.eu
   This is a jQuery port of the Form Manager script by Twey, http://www.twey.co.uk/

  Usage samples:
    $("input").setupDependencies();
    $("input, select").setupDependencies({attribute:'rel', disable_only:false, clear_inactive:true});

  Use, copying, and modification allowed, so long as credit
  remains intact, under the terms of the GNU General Public License,
  version 2 or later. See http://www.gnu.org/copyleft/gpl.html for details.

  big @todo: optimize for speed (too slow on pages with many dependencies)
*/

(function($){
$.fn.setupDependencies = function(options){

  var defaults = {
        attribute              : 'rules',           // the field attribute which contains the rules (use 'rel' for w3c valid code)
        disable_only           : true,              // if true it will disable fields + label, otherwise it will also hide them
        clear_inactive         : false,             // clears input values from hidden/disabled fields
        identify_by            : 'name',            // attribute used to identify dependencies (ie. DEPENDS ON [identify_by] BEING ...)

        condition_separator    : ' AND ',           // rules...
        possibility_separator  : ' OR ',
        name_value_separator   : ' BEING ',
        depends                : 'DEPENDS ON ',
        conflicts              : 'CONFLICTS WITH ',
        empty                  : 'EMPTY'
      },

      settings = $.extend({}, defaults, options),
      matches = this,

      valueMatches = function(e, v){
        return (e.val() == v || (e.is(':radio') && e.filter(':checked').val() == v));
      },

      // show or enable
      show = function(e){
        $('label[for="' + e.attr('id') + '"]').removeClass('disabled');
        e.removeAttr('disabled');
        if(!settings.disable_only){
          e.show();
          $('label[for="' + e.attr('id') + '"]').show();
        }
        return true;
      },

      // hide or disable
      hide = function(e){
        $('label[for="' + e.attr('id') + '"]').addClass('disabled');
        e.attr('disabled', 'disabled');
        if(!settings.disable_only){
          e.hide();
          $('label[for="' + e.attr('id') + '"]').hide();
        }
        if(settings.clear_inactive == true && !e.is(':submit')) // ignore submit buttons
          if(e.is(':checkbox,:radio')) e.removeAttr('checked'); else e.val('');
        return true;
      };


  return this.bind('change input', function(){  // note: input event not working in IE <= 8, obviously
    var j, k, f, n, isHidden, dep;

    matches.each(function(){

      isHidden = false;
      dep = $(this).attr(settings.attribute);

      if(dep)
        for(j = 0, f = dep.split(settings.condition_separator); j < f.length; ++j)
          if(f[j].indexOf(settings.depends) === 0){
            for(k = 0, g = f[j].substr(settings.depends.length).split(settings.possibility_separator); k < g.length; ++k)
              if(g[k].indexOf(settings.name_value_separator) === -1){
                if(matches.filter('[' + settings.identify_by + '="' + g[k] + '"]').is(':checked')) break; else if(k + 1 == g.length) isHidden = hide($(this));

              }else{
                n = g[k].split(settings.name_value_separator);
                if(valueMatches(matches.filter('[' + settings.identify_by+'="' + n[0] + '"]'), n[1])) break; else if(k + 1 == g.length) isHidden = hide($(this));
              }
          }else if(f[j].indexOf(settings.conflicts) === 0){
            if(f[j].indexOf(settings.name_value_separator) === -1){
              if(matches.filter('[' + settings.identify_by + '="' + f[j].substr(settings.conflicts.length) + '"]').is(':checked')){
                isHidden = hide($(this));
                break;
              }
            }else{
              n = f[j].substr(settings.conflicts.length).split(settings.name_value_separator);
              if(valueMatches(matches.filter('[' + settings.identify_by + '="' + n[0] + '"]'), n[1])){
                isHidden = hide($(this));
                break;
              }
            }
          };

      if(!isHidden) show($(this));

    });

    return true;
  }).change();



};

})(jQuery);



/**
 * AJAX Upload ( http://valums.com/ajax-upload/ )
 * Copyright (c) Andris Valums
 * Licensed under the MIT license ( http://valums.com/mit-license/ )
 * Thanks to Gary Haran, David Mark, Corey Burns and others for contributions
 */
(function () {
    /* global window */
    /* jslint browser: true, devel: true, undef: true, nomen: true, bitwise: true, regexp: true, newcap: true, immed: true */

    /**
     * Wrapper for FireBug's console.log
     */
    function log(){
        if (typeof(console) != 'undefined' && typeof(console.log) == 'function'){
            Array.prototype.unshift.call(arguments, '[Ajax Upload]');
            console.log( Array.prototype.join.call(arguments, ' '));
        }
    }

    /**
     * Attaches event to a dom element.
     * @param {Element} el
     * @param type event name
     * @param fn callback This refers to the passed element
     */
    function addEvent(el, type, fn){
        if (el.addEventListener) {
            el.addEventListener(type, fn, false);
        } else if (el.attachEvent) {
            el.attachEvent('on' + type, function(){
                fn.call(el);
	        });
	    } else {
            throw new Error('not supported or DOM not loaded');
        }
    }

    /**
     * Attaches resize event to a window, limiting
     * number of event fired. Fires only when encounteres
     * delay of 100 after series of events.
     *
     * Some browsers fire event multiple times when resizing
     * http://www.quirksmode.org/dom/events/resize.html
     *
     * @param fn callback This refers to the passed element
     */
    function addResizeEvent(fn){
        var timeout;

	    addEvent(window, 'resize', function(){
            if (timeout){
                clearTimeout(timeout);
            }
            timeout = setTimeout(fn, 100);
        });
    }

    // Needs more testing, will be rewriten for next version
    // getOffset function copied from jQuery lib (http://jquery.com/)
    if (document.documentElement.getBoundingClientRect){
        // Get Offset using getBoundingClientRect
        // http://ejohn.org/blog/getboundingclientrect-is-awesome/
        var getOffset = function(el){
            var box = el.getBoundingClientRect();
            var doc = el.ownerDocument;
            var body = doc.body;
            var docElem = doc.documentElement; // for ie
            var clientTop = docElem.clientTop || body.clientTop || 0;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;

            // In Internet Explorer 7 getBoundingClientRect property is treated as physical,
            // while others are logical. Make all logical, like in IE8.
            var zoom = 1;
            if (body.getBoundingClientRect) {
                var bound = body.getBoundingClientRect();
                zoom = (bound.right - bound.left) / body.clientWidth;
            }

            if (zoom > 1) {
                clientTop = 0;
                clientLeft = 0;
            }

            var top = box.top / zoom + (window.pageYOffset || docElem && docElem.scrollTop / zoom || body.scrollTop / zoom) - clientTop, left = box.left / zoom + (window.pageXOffset || docElem && docElem.scrollLeft / zoom || body.scrollLeft / zoom) - clientLeft;

            return {
                top: top,
                left: left
            };
        };
    } else {
        // Get offset adding all offsets
        var getOffset = function(el){
            var top = 0, left = 0;
            do {
                top += el.offsetTop || 0;
                left += el.offsetLeft || 0;
                el = el.offsetParent;
            } while (el);

            return {
                left: left,
                top: top
            };
        };
    }

    /**
     * Returns left, top, right and bottom properties describing the border-box,
     * in pixels, with the top-left relative to the body
     * @param {Element} el
     * @return {Object} Contains left, top, right,bottom
     */
    function getBox(el){
        var left, right, top, bottom;
        var offset = getOffset(el);
        left = offset.left;
        top = offset.top;

        right = left + el.offsetWidth;
        bottom = top + el.offsetHeight;

        return {
            left: left,
            right: right,
            top: top,
            bottom: bottom
        };
    }

    /**
     * Helper that takes object literal
     * and add all properties to element.style
     * @param {Element} el
     * @param {Object} styles
     */
    function addStyles(el, styles){
        for (var name in styles) {
            if (styles.hasOwnProperty(name)) {
                el.style[name] = styles[name];
            }
        }
    }

    /**
     * Function places an absolutely positioned
     * element on top of the specified element
     * copying position and dimentions.
     * @param {Element} from
     * @param {Element} to
     */
    function copyLayout(from, to){
	    var box = getBox(from);

        addStyles(to, {
	        position: 'absolute',
	        left : box.left + 'px',
	        top : box.top + 'px',
	        width : from.offsetWidth + 'px',
	        height : from.offsetHeight + 'px'
	    });
    }

    /**
    * Creates and returns element from html chunk
    * Uses innerHTML to create an element
    */
    var toElement = (function(){
        var div = document.createElement('div');
        return function(html){
            div.innerHTML = html;
            var el = div.firstChild;
            return div.removeChild(el);
        };
    })();

    /**
     * Function generates unique id
     * @return unique id
     */
    var getUID = (function(){
        var id = 0;
        return function(){
            return 'ValumsAjaxUpload' + id++;
        };
    })();

    /**
     * Get file name from path
     * @param {String} file path to file
     * @return filename
     */
    function fileFromPath(file){
        return file.replace(/.*(\/|\\)/, "");
    }

    /**
     * Get file extension lowercase
     * @param {String} file name
     * @return file extenstion
     */
    function getExt(file){
        return (-1 !== file.indexOf('.')) ? file.replace(/.*[.]/, '') : '';
    }

    function hasClass(el, name){
        var re = new RegExp('\\b' + name + '\\b');
        return re.test(el.className);
    }
    function addClass(el, name){
        if ( ! hasClass(el, name)){
            el.className += ' ' + name;
        }
    }
    function removeClass(el, name){
        var re = new RegExp('\\b' + name + '\\b');
        el.className = el.className.replace(re, '');
    }

    function removeNode(el){
        el.parentNode.removeChild(el);
    }

    /**
     * Easy styling and uploading
     * @constructor
     * @param button An element you want convert to
     * upload button. Tested dimentions up to 500x500px
     * @param {Object} options See defaults below.
     */
    window.AjaxUpload = function(button, options){
        this._settings = {
            // Location of the server-side upload script
            action: 'upload.php',
            // File upload name
            name: 'userfile',
            // Additional data to send
            data: {},
            // Submit file as soon as it's selected
            autoSubmit: true,
            // The type of data that you're expecting back from the server.
            // html and xml are detected automatically.
            // Only useful when you are using json data as a response.
            // Set to "json" in that case.
            responseType: false,
            // Class applied to button when mouse is hovered
            hoverClass: 'hover',
            // Class applied to button when AU is disabled
            disabledClass: 'disabled',
            // When user selects a file, useful with autoSubmit disabled
            // You can return false to cancel upload
            onChange: function(file, extension){
            },
            // Callback to fire before file is uploaded
            // You can return false to cancel upload
            onSubmit: function(file, extension){
            },
            // Fired when file upload is completed
            // WARNING! DO NOT USE "FALSE" STRING AS A RESPONSE!
            onComplete: function(file, response){
            }
        };

        // Merge the users options with our defaults
        for (var i in options) {
            if (options.hasOwnProperty(i)){
                this._settings[i] = options[i];
            }
        }

        // button isn't necessary a dom element
        if (button.jquery){
            // jQuery object was passed
            button = button[0];
        } else if (typeof button == "string") {
            if (/^#.*/.test(button)){
                // If jQuery user passes #elementId don't break it
                button = button.slice(1);
            }

            button = document.getElementById(button);
        }

        if ( ! button || button.nodeType !== 1){
            throw new Error("Please make sure that you're passing a valid element");
        }

        if ( button.nodeName.toUpperCase() == 'A'){
            // disable link
            addEvent(button, 'click', function(e){
                if (e && e.preventDefault){
                    e.preventDefault();
                } else if (window.event){
                    window.event.returnValue = false;
                }
            });
        }

        // DOM element
        this._button = button;
        // DOM element
        this._input = null;
        // If disabled clicking on button won't do anything
        this._disabled = false;

        // if the button was disabled before refresh if will remain
        // disabled in FireFox, let's fix it
        this.enable();

        this._rerouteClicks();
    };

    // assigning methods to our class
    AjaxUpload.prototype = {
        setData: function(data){
            this._settings.data = data;
        },
        disable: function(){
            addClass(this._button, this._settings.disabledClass);
            this._disabled = true;

            var nodeName = this._button.nodeName.toUpperCase();
            if (nodeName == 'INPUT' || nodeName == 'BUTTON'){
                this._button.setAttribute('disabled', 'disabled');
            }

            // hide input
            if (this._input){
                // We use visibility instead of display to fix problem with Safari 4
                // The problem is that the value of input doesn't change if it
                // has display none when user selects a file
                this._input.parentNode.style.visibility = 'hidden';
            }
        },
        enable: function(){
            removeClass(this._button, this._settings.disabledClass);
            this._button.removeAttribute('disabled');
            this._disabled = false;

        },
        /**
         * Creates invisible file input
         * that will hover above the button
         * <div><input type='file' /></div>
         */
        _createInput: function(){
            var self = this;

            var input = document.createElement("input");
            input.setAttribute('type', 'file');
            input.setAttribute('name', this._settings.name);

            addStyles(input, {
                'position' : 'absolute',
                // in Opera only 'browse' button
                // is clickable and it is located at
                // the right side of the input
                'right' : 0,
                'margin' : 0,
                'padding' : 0,
                'fontSize' : '480px',
                'cursor' : 'pointer'
            });

            var div = document.createElement("div");
            addStyles(div, {
                'display' : 'block',
                'position' : 'absolute',
                'overflow' : 'hidden',
                'margin' : 0,
                'padding' : 0,
                'opacity' : 0,
                // Make sure browse button is in the right side
                // in Internet Explorer
                'direction' : 'ltr',
                //Max zIndex supported by Opera 9.0-9.2
                'zIndex': 2147483583
            });

            // Make sure that element opacity exists.
            // Otherwise use IE filter
            if ( div.style.opacity !== "0") {
                if (typeof(div.filters) == 'undefined'){
                    throw new Error('Opacity not supported by the browser');
                }
                div.style.filter = "alpha(opacity=0)";
            }

            addEvent(input, 'change', function(){

                if ( ! input || input.value === ''){
                    return;
                }

                // Get filename from input, required
                // as some browsers have path instead of it
                var file = fileFromPath(input.value);

                if (false === self._settings.onChange.call(self, file, getExt(file))){
                    self._clearInput();
                    return;
                }

                // Submit form when value is changed
                if (self._settings.autoSubmit) {
                    self.submit();
                }
            });

            addEvent(input, 'mouseover', function(){
                addClass(self._button, self._settings.hoverClass);
            });

            addEvent(input, 'mouseout', function(){
                removeClass(self._button, self._settings.hoverClass);

                // We use visibility instead of display to fix problem with Safari 4
                // The problem is that the value of input doesn't change if it
                // has display none when user selects a file
                //input.parentNode.style.visibility = 'hidden';

            });

	        div.appendChild(input);
            document.body.appendChild(div);

            this._input = input;
        },
        _clearInput : function(){
            if (!this._input){
                return;
            }

            // this._input.value = ''; Doesn't work in IE6
            removeNode(this._input.parentNode);
            this._input = null;
            this._createInput();

            removeClass(this._button, this._settings.hoverClass);
        },
        /**
         * Function makes sure that when user clicks upload button,
         * the this._input is clicked instead
         */
        _rerouteClicks: function(){
            var self = this;

            // IE will later display 'access denied' error
            // if you use using self._input.click()
            // other browsers just ignore click()

            addEvent(self._button, 'mouseover', function(){
                if (self._disabled){
                    return;
                }

                if ( ! self._input){
	                self._createInput();
                }

                var div = self._input.parentNode;
                copyLayout(self._button, div);
                div.style.visibility = 'visible';

            });


            // commented because we now hide input on mouseleave
            /**
             * When the window is resized the elements
             * can be misaligned if button position depends
             * on window size
             */
            //addResizeEvent(function(){
            //    if (self._input){
            //        copyLayout(self._button, self._input.parentNode);
            //    }
            //});

        },
        /**
         * Creates iframe with unique name
         * @return {Element} iframe
         */
        _createIframe: function(){
            // We can't use getTime, because it sometimes return
            // same value in safari :(
            var id = getUID();

            // We can't use following code as the name attribute
            // won't be properly registered in IE6, and new window
            // on form submit will open
            // var iframe = document.createElement('iframe');
            // iframe.setAttribute('name', id);

            var iframe = toElement('<iframe src="javascript:false;" name="' + id + '" />');
            // src="javascript:false; was added
            // because it possibly removes ie6 prompt
            // "This page contains both secure and nonsecure items"
            // Anyway, it doesn't do any harm.
            iframe.setAttribute('id', id);

            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            return iframe;
        },
        /**
         * Creates form, that will be submitted to iframe
         * @param {Element} iframe Where to submit
         * @return {Element} form
         */
        _createForm: function(iframe){
            var settings = this._settings;

            // We can't use the following code in IE6
            // var form = document.createElement('form');
            // form.setAttribute('method', 'post');
            // form.setAttribute('enctype', 'multipart/form-data');
            // Because in this case file won't be attached to request
            var form = toElement('<form method="post" enctype="multipart/form-data"></form>');

            form.setAttribute('action', settings.action);
            form.setAttribute('target', iframe.name);
            form.style.display = 'none';
            document.body.appendChild(form);

            // Create hidden input element for each data key
            for (var prop in settings.data) {
                if (settings.data.hasOwnProperty(prop)){
                    var el = document.createElement("input");
                    el.setAttribute('type', 'hidden');
                    el.setAttribute('name', prop);
                    el.setAttribute('value', settings.data[prop]);
                    form.appendChild(el);
                }
            }
            return form;
        },
        /**
         * Gets response from iframe and fires onComplete event when ready
         * @param iframe
         * @param file Filename to use in onComplete callback
         */
        _getResponse : function(iframe, file){
            // getting response
            var toDeleteFlag = false, self = this, settings = this._settings;

            addEvent(iframe, 'load', function(){

                if (// For Safari
                    iframe.src == "javascript:'%3Chtml%3E%3C/html%3E';" ||
                    // For FF, IE
                    iframe.src == "javascript:'<html></html>';"){
                        // First time around, do not delete.
                        // We reload to blank page, so that reloading main page
                        // does not re-submit the post.

                        if (toDeleteFlag) {
                            // Fix busy state in FF3
                            setTimeout(function(){
                                removeNode(iframe);
                            }, 0);
                        }

                        return;
                }

                var doc = iframe.contentDocument ? iframe.contentDocument : window.frames[iframe.id].document;

                // fixing Opera 9.26,10.00
                if (doc.readyState && doc.readyState != 'complete') {
                   // Opera fires load event multiple times
                   // Even when the DOM is not ready yet
                   // this fix should not affect other browsers
                   return;
                }

                // fixing Opera 9.64
                if (doc.body && doc.body.innerHTML == "false") {
                    // In Opera 9.64 event was fired second time
                    // when body.innerHTML changed from false
                    // to server response approx. after 1 sec
                    return;
                }

                var response;

                if (doc.XMLDocument) {
                    // response is a xml document Internet Explorer property
                    response = doc.XMLDocument;
                } else if (doc.body){
                    // response is html document or plain text
                    response = doc.body.innerHTML;

                    if (settings.responseType && settings.responseType.toLowerCase() == 'json') {
                        // If the document was sent as 'application/javascript' or
                        // 'text/javascript', then the browser wraps the text in a <pre>
                        // tag and performs html encoding on the contents.  In this case,
                        // we need to pull the original text content from the text node's
                        // nodeValue property to retrieve the unmangled content.
                        // Note that IE6 only understands text/html
                        if (doc.body.firstChild && doc.body.firstChild.nodeName.toUpperCase() == 'PRE') {
                            response = doc.body.firstChild.firstChild.nodeValue;
                        }

                        if (response) {
                            response = eval("(" + response + ")");
                        } else {
                            response = {};
                        }
                    }
                } else {
                    // response is a xml document
                    response = doc;
                }

                settings.onComplete.call(self, file, response);

                // Reload blank page, so that reloading main page
                // does not re-submit the post. Also, remember to
                // delete the frame
                toDeleteFlag = true;

                // Fix IE mixed content issue
                iframe.src = "javascript:'<html></html>';";
            });
        },
        /**
         * Upload file contained in this._input
         */
        submit: function(){
            var self = this, settings = this._settings;

            if ( ! this._input || this._input.value === ''){
                return;
            }

            var file = fileFromPath(this._input.value);

            // user returned false to cancel upload
            if (false === settings.onSubmit.call(this, file, getExt(file))){
                this._clearInput();
                return;
            }

            // sending request
            var iframe = this._createIframe();
            var form = this._createForm(iframe);

            // assuming following structure
            // div -> input type='file'
            removeNode(this._input.parentNode);
            removeClass(self._button, self._settings.hoverClass);

            form.appendChild(this._input);

            form.submit();

            // request set, clean up
            removeNode(form); form = null;
            removeNode(this._input); this._input = null;

            // Get response from iframe and fire onComplete event when ready
            this._getResponse(iframe, file);

            // get ready for next request
            this._createInput();
        }
    };
})();




/**
 *
 * Color picker
 * Author: Stefan Petre www.eyecon.ro
 *
 * Dual licensed under the MIT and GPL licenses
 *
 */
(function ($) {
	var ColorPicker = function () {
		var
			ids = {},
			inAction,
			charMin = 65,
			visible,
			tpl = '<div class="colorpicker"><div class="colorpicker_color"><div><div></div></div></div><div class="colorpicker_hue"><div></div></div><div class="colorpicker_new_color"></div><div class="colorpicker_current_color"></div><div class="colorpicker_hex"><input type="text" maxlength="6" size="6" /></div><div class="colorpicker_rgb_r colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_g colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_h colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_s colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_submit"></div></div>',
			defaults = {
				eventName: 'click',
				onShow: function () {},
				onBeforeShow: function(){},
				onHide: function () {},
				onChange: function () {},
				onSubmit: function () {},
				color: 'ff0000',
				livePreview: true,
				flat: false
			},
			fillRGBFields = function  (hsb, cal) {
				var rgb = HSBToRGB(hsb);
				$(cal).data('colorpicker').fields
					.eq(1).val(rgb.r).end()
					.eq(2).val(rgb.g).end()
					.eq(3).val(rgb.b).end();
			},
			fillHSBFields = function  (hsb, cal) {
				$(cal).data('colorpicker').fields
					.eq(4).val(hsb.h).end()
					.eq(5).val(hsb.s).end()
					.eq(6).val(hsb.b).end();
			},
			fillHexFields = function (hsb, cal) {
				$(cal).data('colorpicker').fields
					.eq(0).val(HSBToHex(hsb)).end();
			},
			setSelector = function (hsb, cal) {
				$(cal).data('colorpicker').selector.css('backgroundColor', '#' + HSBToHex({h: hsb.h, s: 100, b: 100}));
				$(cal).data('colorpicker').selectorIndic.css({
					left: parseInt(150 * hsb.s/100, 10),
					top: parseInt(150 * (100-hsb.b)/100, 10)
				});
			},
			setHue = function (hsb, cal) {
				$(cal).data('colorpicker').hue.css('top', parseInt(150 - 150 * hsb.h/360, 10));
			},
			setCurrentColor = function (hsb, cal) {
				$(cal).data('colorpicker').currentColor.css('backgroundColor', '#' + HSBToHex(hsb));
			},
			setNewColor = function (hsb, cal) {
				$(cal).data('colorpicker').newColor.css('backgroundColor', '#' + HSBToHex(hsb));
			},
			keyDown = function (ev) {
				var pressedKey = ev.charCode || ev.keyCode || -1;
				if ((pressedKey > charMin && pressedKey <= 90) || pressedKey == 32) {
					return false;
				}
				var cal = $(this).parent().parent();
				if (cal.data('colorpicker').livePreview === true) {
					change.apply(this);
				}
			},
			change = function (ev) {
				var cal = $(this).parent().parent(), col;
				if (this.parentNode.className.indexOf('_hex') > 0) {
					cal.data('colorpicker').color = col = HexToHSB(fixHex(this.value));
				} else if (this.parentNode.className.indexOf('_hsb') > 0) {
					cal.data('colorpicker').color = col = fixHSB({
						h: parseInt(cal.data('colorpicker').fields.eq(4).val(), 10),
						s: parseInt(cal.data('colorpicker').fields.eq(5).val(), 10),
						b: parseInt(cal.data('colorpicker').fields.eq(6).val(), 10)
					});
				} else {
					cal.data('colorpicker').color = col = RGBToHSB(fixRGB({
						r: parseInt(cal.data('colorpicker').fields.eq(1).val(), 10),
						g: parseInt(cal.data('colorpicker').fields.eq(2).val(), 10),
						b: parseInt(cal.data('colorpicker').fields.eq(3).val(), 10)
					}));
				}
				if (ev) {
					fillRGBFields(col, cal.get(0));
					fillHexFields(col, cal.get(0));
					fillHSBFields(col, cal.get(0));
				}
				setSelector(col, cal.get(0));
				setHue(col, cal.get(0));
				setNewColor(col, cal.get(0));
				cal.data('colorpicker').onChange.apply(cal, [col, HSBToHex(col), HSBToRGB(col), cal.data('colorpicker').el]);
			},
			blur = function (ev) {
				var cal = $(this).parent().parent();
				cal.data('colorpicker').fields.parent().removeClass('colorpicker_focus');
			},
			focus = function () {
				charMin = this.parentNode.className.indexOf('_hex') > 0 ? 70 : 65;
				$(this).parent().parent().data('colorpicker').fields.parent().removeClass('colorpicker_focus');
				$(this).parent().addClass('colorpicker_focus');
			},
			downIncrement = function (ev) {
				var field = $(this).parent().find('input').focus();
				var current = {
					el: $(this).parent().addClass('colorpicker_slider'),
					max: this.parentNode.className.indexOf('_hsb_h') > 0 ? 360 : (this.parentNode.className.indexOf('_hsb') > 0 ? 100 : 255),
					y: ev.pageY,
					field: field,
					val: parseInt(field.val(), 10),
					preview: $(this).parent().parent().data('colorpicker').livePreview
				};
				$(document).bind('mouseup', current, upIncrement);
				$(document).bind('mousemove', current, moveIncrement);
			},
			moveIncrement = function (ev) {
				ev.data.field.val(Math.max(0, Math.min(ev.data.max, parseInt(ev.data.val + ev.pageY - ev.data.y, 10))));
				if (ev.data.preview) {
					change.apply(ev.data.field.get(0), [true]);
				}
				return false;
			},
			upIncrement = function (ev) {
				change.apply(ev.data.field.get(0), [true]);
				ev.data.el.removeClass('colorpicker_slider').find('input').focus();
				$(document).unbind('mouseup', upIncrement);
				$(document).unbind('mousemove', moveIncrement);
				return false;
			},
			downHue = function (ev) {
				var current = {
					cal: $(this).parent(),
					y: $(this).offset().top
				};
				current.preview = current.cal.data('colorpicker').livePreview;
				$(document).bind('mouseup', current, upHue);
				$(document).bind('mousemove', current, moveHue);
			},
			moveHue = function (ev) {
				change.apply(
					ev.data.cal.data('colorpicker')
						.fields
						.eq(4)
						.val(parseInt(360*(150 - Math.max(0,Math.min(150,(ev.pageY - ev.data.y))))/150, 10))
						.get(0),
					[ev.data.preview]
				);
				return false;
			},
			upHue = function (ev) {
				fillRGBFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
				fillHexFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
				$(document).unbind('mouseup', upHue);
				$(document).unbind('mousemove', moveHue);
				return false;
			},
			downSelector = function (ev) {
				var current = {
					cal: $(this).parent(),
					pos: $(this).offset()
				};
				current.preview = current.cal.data('colorpicker').livePreview;
				$(document).bind('mouseup', current, upSelector);
				$(document).bind('mousemove', current, moveSelector);
			},
			moveSelector = function (ev) {
				change.apply(
					ev.data.cal.data('colorpicker')
						.fields
						.eq(6)
						.val(parseInt(100*(150 - Math.max(0,Math.min(150,(ev.pageY - ev.data.pos.top))))/150, 10))
						.end()
						.eq(5)
						.val(parseInt(100*(Math.max(0,Math.min(150,(ev.pageX - ev.data.pos.left))))/150, 10))
						.get(0),
					[ev.data.preview]
				);
				return false;
			},
			upSelector = function (ev) {
				fillRGBFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
				fillHexFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
				$(document).unbind('mouseup', upSelector);
				$(document).unbind('mousemove', moveSelector);
				return false;
			},
			enterSubmit = function (ev) {
				$(this).addClass('colorpicker_focus');
			},
			leaveSubmit = function (ev) {
				$(this).removeClass('colorpicker_focus');
			},
			clickSubmit = function (ev) {
				var cal = $(this).parent();
				var col = cal.data('colorpicker').color;
				cal.data('colorpicker').origColor = col;
				setCurrentColor(col, cal.get(0));
				cal.data('colorpicker').onSubmit(col, HSBToHex(col), HSBToRGB(col), cal.data('colorpicker').el);
			},
			show = function (ev) {
				var cal = $('#' + $(this).data('colorpickerId'));
				cal.data('colorpicker').onBeforeShow.apply(this, [cal.get(0)]);
				var pos = $(this).offset();
				var viewPort = getViewport();
				var top = pos.top + this.offsetHeight;
				var left = pos.left;
				if (top + 176 > viewPort.t + viewPort.h) {
					top -= this.offsetHeight + 176;
				}
				if (left + 356 > viewPort.l + viewPort.w) {
					left -= 356;
				}
				cal.css({left: left + 'px', top: top + 'px'});
				if (cal.data('colorpicker').onShow.apply(this, [cal.get(0)]) != false) {
					cal.show();
				}
				$(document).bind('mousedown', {cal: cal}, hide);
				return false;
			},
			hide = function (ev) {
				if (!isChildOf(ev.data.cal.get(0), ev.target, ev.data.cal.get(0))) {
					if (ev.data.cal.data('colorpicker').onHide.apply(this, [ev.data.cal.get(0)]) != false) {
						ev.data.cal.hide();
					}
					$(document).unbind('mousedown', hide);
				}
			},
			isChildOf = function(parentEl, el, container) {
				if (parentEl == el) {
					return true;
				}
				if (parentEl.contains) {
					return parentEl.contains(el);
				}
				if ( parentEl.compareDocumentPosition ) {
					return !!(parentEl.compareDocumentPosition(el) & 16);
				}
				var prEl = el.parentNode;
				while(prEl && prEl != container) {
					if (prEl == parentEl)
						return true;
					prEl = prEl.parentNode;
				}
				return false;
			},
			getViewport = function () {
				var m = document.compatMode == 'CSS1Compat';
				return {
					l : window.pageXOffset || (m ? document.documentElement.scrollLeft : document.body.scrollLeft),
					t : window.pageYOffset || (m ? document.documentElement.scrollTop : document.body.scrollTop),
					w : window.innerWidth || (m ? document.documentElement.clientWidth : document.body.clientWidth),
					h : window.innerHeight || (m ? document.documentElement.clientHeight : document.body.clientHeight)
				};
			},
			fixHSB = function (hsb) {
				return {
					h: Math.min(360, Math.max(0, hsb.h)),
					s: Math.min(100, Math.max(0, hsb.s)),
					b: Math.min(100, Math.max(0, hsb.b))
				};
			},
			fixRGB = function (rgb) {
				return {
					r: Math.min(255, Math.max(0, rgb.r)),
					g: Math.min(255, Math.max(0, rgb.g)),
					b: Math.min(255, Math.max(0, rgb.b))
				};
			},
			fixHex = function (hex) {
				var len = 6 - hex.length;
				if (len > 0) {
					var o = [];
					for (var i=0; i<len; i++) {
						o.push('0');
					}
					o.push(hex);
					hex = o.join('');
				}
				return hex;
			},
			HexToRGB = function (hex) {
				var hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
				return {r: hex >> 16, g: (hex & 0x00FF00) >> 8, b: (hex & 0x0000FF)};
			},
			HexToHSB = function (hex) {
				return RGBToHSB(HexToRGB(hex));
			},
			RGBToHSB = function (rgb) {
				var hsb = {
					h: 0,
					s: 0,
					b: 0
				};
				var min = Math.min(rgb.r, rgb.g, rgb.b);
				var max = Math.max(rgb.r, rgb.g, rgb.b);
				var delta = max - min;
				hsb.b = max;

				hsb.s = max != 0 ? 255 * delta / max : 0;
				if (hsb.s != 0) {
					if (rgb.r == max) {
						hsb.h = (rgb.g - rgb.b) / delta;
					} else if (rgb.g == max) {
						hsb.h = 2 + (rgb.b - rgb.r) / delta;
					} else {
						hsb.h = 4 + (rgb.r - rgb.g) / delta;
					}
				} else {
					hsb.h = -1;
				}
				hsb.h *= 60;
				if (hsb.h < 0) {
					hsb.h += 360;
				}
				hsb.s *= 100/255;
				hsb.b *= 100/255;
				return hsb;
			},
			HSBToRGB = function (hsb) {
				var rgb = {};
				var h = Math.round(hsb.h);
				var s = Math.round(hsb.s*255/100);
				var v = Math.round(hsb.b*255/100);
				if(s == 0) {
					rgb.r = rgb.g = rgb.b = v;
				} else {
					var t1 = v;
					var t2 = (255-s)*v/255;
					var t3 = (t1-t2)*(h%60)/60;
					if(h==360) h = 0;
					if(h<60) {rgb.r=t1;	rgb.b=t2; rgb.g=t2+t3}
					else if(h<120) {rgb.g=t1; rgb.b=t2;	rgb.r=t1-t3}
					else if(h<180) {rgb.g=t1; rgb.r=t2;	rgb.b=t2+t3}
					else if(h<240) {rgb.b=t1; rgb.r=t2;	rgb.g=t1-t3}
					else if(h<300) {rgb.b=t1; rgb.g=t2;	rgb.r=t2+t3}
					else if(h<360) {rgb.r=t1; rgb.g=t2;	rgb.b=t1-t3}
					else {rgb.r=0; rgb.g=0;	rgb.b=0}
				}
				return {r:Math.round(rgb.r), g:Math.round(rgb.g), b:Math.round(rgb.b)};
			},
			RGBToHex = function (rgb) {
				var hex = [
					rgb.r.toString(16),
					rgb.g.toString(16),
					rgb.b.toString(16)
				];
				$.each(hex, function (nr, val) {
					if (val.length == 1) {
						hex[nr] = '0' + val;
					}
				});
				return hex.join('');
			},
			HSBToHex = function (hsb) {
				return RGBToHex(HSBToRGB(hsb));
			},
			restoreOriginal = function () {
				var cal = $(this).parent();
				var col = cal.data('colorpicker').origColor;
				cal.data('colorpicker').color = col;
				fillRGBFields(col, cal.get(0));
				fillHexFields(col, cal.get(0));
				fillHSBFields(col, cal.get(0));
				setSelector(col, cal.get(0));
				setHue(col, cal.get(0));
				setNewColor(col, cal.get(0));
			};
		return {
			init: function (opt) {
				opt = $.extend({}, defaults, opt||{});
				if (typeof opt.color == 'string') {
					opt.color = HexToHSB(opt.color);
				} else if (opt.color.r != undefined && opt.color.g != undefined && opt.color.b != undefined) {
					opt.color = RGBToHSB(opt.color);
				} else if (opt.color.h != undefined && opt.color.s != undefined && opt.color.b != undefined) {
					opt.color = fixHSB(opt.color);
				} else {
					return this;
				}
				return this.each(function () {
					if (!$(this).data('colorpickerId')) {
						var options = $.extend({}, opt);
						options.origColor = opt.color;
						var id = 'collorpicker_' + parseInt(Math.random() * 1000);
						$(this).data('colorpickerId', id);
						var cal = $(tpl).attr('id', id);
						if (options.flat) {
							cal.appendTo(this).show();
						} else {
							cal.appendTo(document.body);
						}
						options.fields = cal
											.find('input')
												.bind('keyup', keyDown)
												.bind('change', change)
												.bind('blur', blur)
												.bind('focus', focus);
						cal
							.find('span').bind('mousedown', downIncrement).end()
							.find('>div.colorpicker_current_color').bind('click', restoreOriginal);
						options.selector = cal.find('div.colorpicker_color').bind('mousedown', downSelector);
						options.selectorIndic = options.selector.find('div div');
						options.el = this;
						options.hue = cal.find('div.colorpicker_hue div');
						cal.find('div.colorpicker_hue').bind('mousedown', downHue);
						options.newColor = cal.find('div.colorpicker_new_color');
						options.currentColor = cal.find('div.colorpicker_current_color');
						cal.data('colorpicker', options);
						cal.find('div.colorpicker_submit')
							.bind('mouseenter', enterSubmit)
							.bind('mouseleave', leaveSubmit)
							.bind('click', clickSubmit);
						fillRGBFields(options.color, cal.get(0));
						fillHSBFields(options.color, cal.get(0));
						fillHexFields(options.color, cal.get(0));
						setHue(options.color, cal.get(0));
						setSelector(options.color, cal.get(0));
						setCurrentColor(options.color, cal.get(0));
						setNewColor(options.color, cal.get(0));
						if (options.flat) {
							cal.css({
								position: 'relative',
								display: 'block'
							});
						} else {
							$(this).bind(options.eventName, show);
						}
					}
				});
			},
			showPicker: function() {
				return this.each( function () {
					if ($(this).data('colorpickerId')) {
						show.apply(this);
					}
				});
			},
			hidePicker: function() {
				return this.each( function () {
					if ($(this).data('colorpickerId')) {
						$('#' + $(this).data('colorpickerId')).hide();
					}
				});
			},
			setColor: function(col) {
				if (typeof col == 'string') {
					col = HexToHSB(col);
				} else if (col.r != undefined && col.g != undefined && col.b != undefined) {
					col = RGBToHSB(col);
				} else if (col.h != undefined && col.s != undefined && col.b != undefined) {
					col = fixHSB(col);
				} else {
					return this;
				}
				return this.each(function(){
					if ($(this).data('colorpickerId')) {
						var cal = $('#' + $(this).data('colorpickerId'));
						cal.data('colorpicker').color = col;
						cal.data('colorpicker').origColor = col;
						fillRGBFields(col, cal.get(0));
						fillHSBFields(col, cal.get(0));
						fillHexFields(col, cal.get(0));
						setHue(col, cal.get(0));
						setSelector(col, cal.get(0));
						setCurrentColor(col, cal.get(0));
						setNewColor(col, cal.get(0));
					}
				});
			}
		};
	}();
	$.fn.extend({
		ColorPicker: ColorPicker.init,
		ColorPickerHide: ColorPicker.hidePicker,
		ColorPickerShow: ColorPicker.showPicker,
		ColorPickerSetColor: ColorPicker.setColor
	});
})(jQuery);














// jQuery Slider Plugin
// Egor Khmelev - http://blog.egorkhmelev.com/ - hmelyoff@gmail.com

(function(){

  // Simple Inheritance
  Function.prototype.inheritFrom = function(BaseClass, oOverride){
  	var Inheritance = function() {};
  	Inheritance.prototype = BaseClass.prototype;
  	this.prototype = new Inheritance();
  	this.prototype.constructor = this;
  	this.prototype.baseConstructor = BaseClass;
  	this.prototype.superClass = BaseClass.prototype;

  	if(oOverride){
  		for(var i in oOverride) {
  			this.prototype[i] = oOverride[i];
  		}
  	}
  };

  // Format numbers
  Number.prototype.jSliderNice=function(iRoundBase){
  	var re=/^(-)?(\d+)([\.,](\d+))?$/;
  	var iNum=Number(this);
  	var sNum=String(iNum);
  	var aMatches;
  	var sDecPart='';
  	var sTSeparator=' ';
  	if((aMatches = sNum.match(re))){
  		var sIntPart=aMatches[2];
  		var iDecPart=(aMatches[4]) ? Number('0.'+aMatches[4]) : 0;
  		if(iDecPart){
  			var iRF=Math.pow(10, (iRoundBase) ? iRoundBase : 2);
  			iDecPart=Math.round(iDecPart*iRF);
  			sNewDecPart=String(iDecPart);
  			sDecPart = sNewDecPart;
  			if(sNewDecPart.length < iRoundBase){
  				var iDiff = iRoundBase-sNewDecPart.length;
  				for (var i=0; i < iDiff; i++) {
  					sDecPart = "0" + sDecPart;
  				};
  			}
  			sDecPart = "," + sDecPart;
  		} else {
  			if(iRoundBase && iRoundBase != 0){
  				for (var i=0; i < iRoundBase; i++) {
  					sDecPart += "0";
  				};
  				sDecPart = "," + sDecPart;
  			}
  		}
  		var sResult;
  		if(Number(sIntPart) < 1000){
  			sResult = sIntPart+sDecPart;
  		}else{
  			var sNewNum='';
  			var i;
  			for(i=1; i*3<sIntPart.length; i++)
  				sNewNum=sTSeparator+sIntPart.substring(sIntPart.length - i*3, sIntPart.length - (i-1)*3)+sNewNum;
  			sResult = sIntPart.substr(0, 3 - i*3 + sIntPart.length)+sNewNum+sDecPart;
  		}
  		if(aMatches[1])
  			return '-'+sResult;
  		else
  			return sResult;
  	}
  	else{
  		return sNum;
  	}
  };

  this.jSliderIsArray = function( value ){
    if( typeof value == "undefined" ) return false;

    if (value instanceof Array ||  // Works quickly in same execution context.
        // If value is from a different execution context then
        // !(value instanceof Object), which lets us early out in the common
        // case when value is from the same context but not an array.
        // The {if (value)} check above means we don't have to worry about
        // undefined behavior of Object.prototype.toString on null/undefined.
        //
        // HACK: In order to use an Object prototype method on the arbitrary
        //   value, the compiler requires the value be cast to type Object,
        //   even though the ECMA spec explicitly allows it.
        (!(value instanceof Object) &&
         (Object.prototype.toString.call(
             /** @type {Object} */ (value)) == '[object Array]') ||

         // In IE all non value types are wrapped as objects across window
         // boundaries (not iframe though) so we have to do object detection
         // for this edge case
         typeof value.length == 'number' &&
         typeof value.splice != 'undefined' &&
         typeof value.propertyIsEnumerable != 'undefined' &&
         !value.propertyIsEnumerable('splice')

        )) {
      return true;
    }

    return false;
  }


})();


// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed

(function(){
  var cache = {};

  this.jSliderTmpl = function jSliderTmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !(/\W/).test(str) ?
      cache[str] = cache[str] ||
        jSliderTmpl(str) :

      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");

    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();


// Draggable Class
// Egor Khmelev - http://blog.egorkhmelev.com/

(function( $ ){

  this.Draggable = function(){
  	this._init.apply( this, arguments );
  };

  Draggable.prototype = {
  	// Methods for re-init in child class
  	oninit: function(){},
  	events: function(){},
  	onmousedown: function(){
  		this.ptr.css({ position: "absolute" });
  	},
  	onmousemove: function( evt, x, y ){
  		this.ptr.css({ left: x, top: y });
  	},
  	onmouseup: function(){},

  	isDefault: {
  		drag: false,
  		clicked: false,
  		toclick: true,
  		mouseup: false
  	},

  	_init: function(){
  		if( arguments.length > 0 ){
  			this.ptr = $(arguments[0]);
  			this.outer = $(".draggable-outer");

  			this.is = {};
  			$.extend( this.is, this.isDefault );

  			var _offset = this.ptr.offset();
  			this.d = {
  				left: _offset.left,
  				top: _offset.top,
  				width: this.ptr.width(),
  				height: this.ptr.height()
  			};

  			this.oninit.apply( this, arguments );

  			this._events();
  		}
  	},
  	_getPageCoords: function( event ){
  	  if( event.targetTouches && event.targetTouches[0] ){
  	    return { x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY };
  	  } else
  	    return { x: event.pageX, y: event.pageY };
  	},
  	_bindEvent: function( ptr, eventType, handler ){
  	  var self = this;

  	  if( this.supportTouches_ )
        ptr.get(0).addEventListener( this.events_[ eventType ], handler, false );

  	  else
  	    ptr.bind( this.events_[ eventType ], handler );
  	},
  	_events: function(){
  		var self = this;

      this.supportTouches_ = ( $.browser.webkit && navigator.userAgent.indexOf("Mobile") != -1 );
      this.events_ = {
        "click": this.supportTouches_ ? "touchstart" : "click",
        "down": this.supportTouches_ ? "touchstart" : "mousedown",
        "move": this.supportTouches_ ? "touchmove" : "mousemove",
        "up"  : this.supportTouches_ ? "touchend" : "mouseup"
      };

      this._bindEvent( $( document ), "move", function( event ){
				if( self.is.drag ){
          event.stopPropagation();
          event.preventDefault();
					self._mousemove( event );
				}
			});
      this._bindEvent( $( document ), "down", function( event ){
				if( self.is.drag ){
          event.stopPropagation();
          event.preventDefault();
				}
			});
      this._bindEvent( $( document ), "up", function( event ){
				self._mouseup( event );
			});

      this._bindEvent( this.ptr, "down", function( event ){
				self._mousedown( event );
				return false;
			});
      this._bindEvent( this.ptr, "up", function( event ){
				self._mouseup( event );
			});

  		this.ptr.find("a")
  			.click(function(){
  				self.is.clicked = true;

  				if( !self.is.toclick ){
  					self.is.toclick = true;
  					return false;
  				}
  			})
  			.mousedown(function( event ){
  				self._mousedown( event );
  				return false;
  			});

  		this.events();
  	},
  	_mousedown: function( evt ){
  		this.is.drag = true;
  		this.is.clicked = false;
  		this.is.mouseup = false;

  		var _offset = this.ptr.offset();
  		var coords = this._getPageCoords( evt );
  		this.cx = coords.x - _offset.left;
  		this.cy = coords.y - _offset.top;

  		$.extend(this.d, {
  			left: _offset.left,
  			top: _offset.top,
  			width: this.ptr.width(),
  			height: this.ptr.height()
  		});

  		if( this.outer && this.outer.get(0) ){
  			this.outer.css({ height: Math.max(this.outer.height(), $(document.body).height()), overflow: "hidden" });
  		}

  		this.onmousedown( evt );
  	},
  	_mousemove: function( evt ){
  		this.is.toclick = false;
  		var coords = this._getPageCoords( evt );
  		this.onmousemove( evt, coords.x - this.cx, coords.y - this.cy );
  	},
  	_mouseup: function( evt ){
  		var oThis = this;

  		if( this.is.drag ){
  			this.is.drag = false;

  			if( this.outer && this.outer.get(0) ){

  				if( $.browser.mozilla ){
  					this.outer.css({ overflow: "hidden" });
  				} else {
  					this.outer.css({ overflow: "visible" });
  				}

  				if( $.browser.msie && $.browser.version == '6.0' ){
  					this.outer.css({ height: "100%" });
  				} else {
  					this.outer.css({ height: "auto" });
  				}
  			}

  			this.onmouseup( evt );
  		}
  	}

  };

})( jQuery );



// jQuery Slider (Safari)
// Egor Khmelev - http://blog.egorkhmelev.com/

(function( $ ) {

	$.slider = function( node, settings ){
	  var jNode = $(node);
	  if( !jNode.data( "jslider" ) )
	    jNode.data( "jslider", new jSlider( node, settings ) );

	  return jNode.data( "jslider" );
	};

	$.fn.slider = function( action, opt_value ){
	  var returnValue, args = arguments;

	  function isDef( val ){
	    return val !== undefined;
	  };

	  function isDefAndNotNull( val ){
      return val != null;
	  };

		this.each(function(){
		  var self = $.slider( this, action );

		  // do actions
		  if( typeof action == "string" ){
		    switch( action ){
		      case "value":
		        if( isDef( args[ 1 ] ) && isDef( args[ 2 ] ) ){
		          var pointers = self.getPointers();
		          if( isDefAndNotNull( pointers[0] ) && isDefAndNotNull( args[1] ) ){
		            pointers[0].set( args[ 1 ] );
		            pointers[0].setIndexOver();
		          }

		          if( isDefAndNotNull( pointers[1] ) && isDefAndNotNull( args[2] ) ){
		            pointers[1].set( args[ 2 ] );
		            pointers[1].setIndexOver();
		          }
		        }

		        else if( isDef( args[ 1 ] ) ){
		          var pointers = self.getPointers();
		          if( isDefAndNotNull( pointers[0] ) && isDefAndNotNull( args[1] ) ){
		            pointers[0].set( args[ 1 ] );
		            pointers[0].setIndexOver();
		          }
		        }

		        else
  		        returnValue = self.getValue();

		        break;

		      case "prc":
		        if( isDef( args[ 1 ] ) && isDef( args[ 2 ] ) ){
		          var pointers = self.getPointers();
		          if( isDefAndNotNull( pointers[0] ) && isDefAndNotNull( args[1] ) ){
		            pointers[0]._set( args[ 1 ] );
		            pointers[0].setIndexOver();
		          }

		          if( isDefAndNotNull( pointers[1] ) && isDefAndNotNull( args[2] ) ){
		            pointers[1]._set( args[ 2 ] );
		            pointers[1].setIndexOver();
		          }
		        }

		        else if( isDef( args[ 1 ] ) ){
		          var pointers = self.getPointers();
		          if( isDefAndNotNull( pointers[0] ) && isDefAndNotNull( args[1] ) ){
		            pointers[0]._set( args[ 1 ] );
		            pointers[0].setIndexOver();
		          }
		        }

		        else
  		        returnValue = self.getPrcValue();

		        break;

  		    case "calculatedValue":
  		      var value = self.getValue().split(";");
  		      returnValue = "";
  		      for (var i=0; i < value.length; i++) {
  		        returnValue += (i > 0 ? ";" : "") + self.nice( value[i] );
  		      };

  		      break;

  		    case "skin":
		        self.setSkin( args[1] );

  		      break;
		    };

		  }

		  // return actual object
		  else if( !action && !opt_value ){
		    if( !jSliderIsArray( returnValue ) )
		      returnValue = [];

		    returnValue.push( slider );
		  }
		});

		// flatten array just with one slider
		if( jSliderIsArray( returnValue ) && returnValue.length == 1 )
		  returnValue = returnValue[ 0 ];

		return returnValue || this;
	};

  var OPTIONS = {

    settings: {
      from: 1,
      to: 10,
      step: 1,
      smooth: true,
      limits: true,
      round: 0,
      value: "5;7",
      dimension: ""
    },

    className: "jslider",
    selector: ".jslider-",

    template: jSliderTmpl(
      '<span class="<%=className%>">' +
        '<table><tr><td>' +
          '<div class="<%=className%>-bg">' +
            '<i class="l"><i></i></i><i class="r"><i></i></i>' +
            '<i class="v"><i></i></i>' +
          '</div>' +

          '<div class="<%=className%>-pointer"><i></i></div>' +
          '<div class="<%=className%>-pointer <%=className%>-pointer-to"><i></i></div>' +

          '<div class="<%=className%>-label"><span><%=settings.from%></span></div>' +
          '<div class="<%=className%>-label <%=className%>-label-to"><span><%=settings.to%></span><%=settings.dimension%></div>' +

          '<div class="<%=className%>-value"><span></span><%=settings.dimension%></div>' +
          '<div class="<%=className%>-value <%=className%>-value-to"><span></span><%=settings.dimension%></div>' +

          '<div class="<%=className%>-scale"><%=scale%></div>'+

        '</td></tr></table>' +
      '</span>'
    )

  };

  this.jSlider = function(){
  	return this.init.apply( this, arguments );
  };

  jSlider.prototype = {
    init: function( node, settings ){
      this.settings = $.extend(true, {}, OPTIONS.settings, settings ? settings : {});

      // obj.sliderHandler = this;
      this.inputNode = $( node ).hide();

			this.settings.interval = this.settings.to-this.settings.from;
			this.settings.value = this.inputNode.attr("value");

			if( this.settings.calculate && $.isFunction( this.settings.calculate ) )
			  this.nice = this.settings.calculate;

			if( this.settings.onstatechange && $.isFunction( this.settings.onstatechange ) )
			  this.onstatechange = this.settings.onstatechange;

      this.is = {
        init: false
      };
			this.o = {};

      this.create();
    },

    onstatechange: function(){},

    create: function(){
      var $this = this;

      this.domNode = $( OPTIONS.template({
        className: OPTIONS.className,
        settings: {
          from: this.nice( this.settings.from ),
          to: this.nice( this.settings.to ),
          dimension: this.settings.dimension
        },
        scale: this.generateScale()
      }) );

      this.inputNode.after( this.domNode );
      this.drawScale();

      // set skin class
      if( this.settings.skin && this.settings.skin.length > 0 )
        this.setSkin( this.settings.skin );

			this.sizes = {
			  domWidth: this.domNode.width(),
			  domOffset: this.domNode.offset()
			};

      // find some objects
      $.extend(this.o, {
        pointers: {},
        labels: {
          0: {
            o: this.domNode.find(OPTIONS.selector + "value").not(OPTIONS.selector + "value-to")
          },
          1: {
            o: this.domNode.find(OPTIONS.selector + "value").filter(OPTIONS.selector + "value-to")
          }
        },
        limits: {
          0: this.domNode.find(OPTIONS.selector + "label").not(OPTIONS.selector + "label-to"),
          1: this.domNode.find(OPTIONS.selector + "label").filter(OPTIONS.selector + "label-to")
        }
      });

      $.extend(this.o.labels[0], {
        value: this.o.labels[0].o.find("span")
      });

      $.extend(this.o.labels[1], {
        value: this.o.labels[1].o.find("span")
      });


      if( !$this.settings.value.split(";")[1] ){
        this.settings.single = true;
        this.domNode.addDependClass("single");
      }

      if( !$this.settings.limits )
        this.domNode.addDependClass("limitless");

      this.domNode.find(OPTIONS.selector + "pointer").each(function( i ){
        var value = $this.settings.value.split(";")[i];
        if( value ){
          $this.o.pointers[i] = new jSliderPointer( this, i, $this );

          var prev = $this.settings.value.split(";")[i-1];
          if( prev && new Number(value) < new Number(prev) ) value = prev;

          value = value < $this.settings.from ? $this.settings.from : value;
          value = value > $this.settings.to ? $this.settings.to : value;

          $this.o.pointers[i].set( value, true );
        }
      });

      this.o.value = this.domNode.find(".v");
      this.is.init = true;

      $.each(this.o.pointers, function(i){
        $this.redraw(this);
      });

      (function(self){
        $(window).resize(function(){
          self.onresize();
        });
      })(this);

    },

    setSkin: function( skin ){
      if( this.skin_ )
        this.domNode.removeDependClass( this.skin_, "_" );

      this.domNode.addDependClass( this.skin_ = skin, "_" );
    },

    setPointersIndex: function( i ){
      $.each(this.getPointers(), function(i){
        this.index( i );
      });
    },

    getPointers: function(){
      return this.o.pointers;
    },

    generateScale: function(){
      if( this.settings.scale && this.settings.scale.length > 0 ){
        var str = "";
        var s = this.settings.scale;

        //var prc = Math.round((100/(s.length-1))*10)/10;
        var prc = (((100/(s.length-1)))*10)/10; // Math.round() change

        for( var i=0; i < s.length; i++ ){
          str += '<span style="left: ' + i*prc + '%">' + ( s[i] != '|' ? '<ins>' + s[i] + '</ins>' : '' ) + '</span>';
        };
        return str;
      };

      return '';
    },

    drawScale: function(){
      this.domNode.find(OPTIONS.selector + "scale span ins").each(function(){
        $(this).css({ marginLeft: -$(this).outerWidth()/2 });
      });
    },

    onresize: function(){
      var self = this;
			this.sizes = {
			  domWidth: this.domNode.width(),
			  domOffset: this.domNode.offset()
			};

      $.each(this.o.pointers, function(i){
        self.redraw(this);
      });
    },

    limits: function( x, pointer ){
  	  // smooth
  	  if( !this.settings.smooth ){
  	    var step = this.settings.step*100 / ( this.settings.interval );
  	    x = Math.round( x/step ) * step;
  	  }

  	  var another = this.o.pointers[1-pointer.uid];
  	  if( another && pointer.uid && x < another.value.prc ) x = another.value.prc;
  	  if( another && !pointer.uid && x > another.value.prc ) x = another.value.prc;

      // base limit
  	  if( x < 0 ) x = 0;
  	  if( x > 100 ) x = 100;

      return Math.round( x*10 ) / 10;
    },

    redraw: function( pointer ){
      if( !this.is.init ) return false;

      this.setValue();

      // redraw range line
      if( this.o.pointers[0] && this.o.pointers[1] )
        this.o.value.css({ left: this.o.pointers[0].value.prc + "%", width: ( this.o.pointers[1].value.prc - this.o.pointers[0].value.prc ) + "%" });

      this.o.labels[pointer.uid].value.html(
        this.nice(
          pointer.value.origin
        )
      );

      // redraw position of labels
      this.redrawLabels( pointer );

    },

    redrawLabels: function( pointer ){

      function setPosition( label, sizes, prc ){
    	  sizes.margin = -sizes.label/2;

        // left limit
        label_left = sizes.border + sizes.margin;
        if( label_left < 0 )
          sizes.margin -= label_left;

        // right limit
        if( sizes.border+sizes.label / 2 > self.sizes.domWidth ){
          sizes.margin = 0;
          sizes.right = true;
        } else
          sizes.right = false;

        label.o.css({ left: prc + "%", marginLeft: sizes.margin, right: "auto" });
        if( sizes.right ) label.o.css({ left: "auto", right: 0 });
        return sizes;
      }

      var self = this;
  	  var label = this.o.labels[pointer.uid];
  	  var prc = pointer.value.prc;

  	  var sizes = {
  	    label: label.o.outerWidth(),
  	    right: false,
  	    border: ( prc * this.sizes.domWidth ) / 100
  	  };

      //console.log(this.o.pointers[1-pointer.uid])
      if( !this.settings.single ){
        // glue if near;
        var another = this.o.pointers[1-pointer.uid];
      	var another_label = this.o.labels[another.uid];

        switch( pointer.uid ){
          case 0:
            if( sizes.border+sizes.label / 2 > another_label.o.offset().left-this.sizes.domOffset.left ){
              another_label.o.css({ visibility: "hidden" });
          	  another_label.value.html( this.nice( another.value.origin ) );

            	label.o.css({ visibility: "visible" });

            	prc = ( another.value.prc - prc ) / 2 + prc;
            	if( another.value.prc != pointer.value.prc ){
            	  label.value.html( this.nice(pointer.value.origin) + "&nbsp;&ndash;&nbsp;" + this.nice(another.value.origin) );
              	sizes.label = label.o.outerWidth();
              	sizes.border = ( prc * this.sizes.domWidth ) / 100;
              }
            } else {
            	another_label.o.css({ visibility: "visible" });
            }
            break;

          case 1:
            if( sizes.border - sizes.label / 2 < another_label.o.offset().left - this.sizes.domOffset.left + another_label.o.outerWidth() ){
              another_label.o.css({ visibility: "hidden" });
          	  another_label.value.html( this.nice(another.value.origin) );

            	label.o.css({ visibility: "visible" });

            	prc = ( prc - another.value.prc ) / 2 + another.value.prc;
            	if( another.value.prc != pointer.value.prc ){
            	  label.value.html( this.nice(another.value.origin) + "&nbsp;&ndash;&nbsp;" + this.nice(pointer.value.origin) );
              	sizes.label = label.o.outerWidth();
              	sizes.border = ( prc * this.sizes.domWidth ) / 100;
              }
            } else {
              another_label.o.css({ visibility: "visible" });
            }
            break;
        }
      }

      sizes = setPosition( label, sizes, prc );

      /* draw second label */
      if( another_label ){
        var sizes = {
    	    label: another_label.o.outerWidth(),
    	    right: false,
    	    border: ( another.value.prc * this.sizes.domWidth ) / 100
    	  };
        sizes = setPosition( another_label, sizes, another.value.prc );
      }

	    this.redrawLimits();
    },

    redrawLimits: function(){
  	  if( this.settings.limits ){

        var limits = [ true, true ];

        for( key in this.o.pointers ){

          if( !this.settings.single || key == 0 ){

        	  var pointer = this.o.pointers[key];
            var label = this.o.labels[pointer.uid];
            var label_left = label.o.offset().left - this.sizes.domOffset.left;

        	  var limit = this.o.limits[0];
            if( label_left < limit.outerWidth() )
              limits[0] = false;

        	  var limit = this.o.limits[1];
        	  if( label_left + label.o.outerWidth() > this.sizes.domWidth - limit.outerWidth() )
        	    limits[1] = false;
        	}

        };

        for( var i=0; i < limits.length; i++ ){
          if( limits[i] )
            this.o.limits[i].fadeIn("fast");
          else
            this.o.limits[i].fadeOut("fast");
        };

  	  }
    },

    setValue: function(){
      var value = this.getValue();
      this.inputNode.attr( "value", value );
      this.onstatechange.call( this, value );
    },
    getValue: function(){
      if(!this.is.init) return false;
      var $this = this;

      var value = "";
      $.each( this.o.pointers, function(i){
        if( this.value.prc != undefined && !isNaN(this.value.prc) ) value += (i > 0 ? ";" : "") + $this.prcToValue( this.value.prc );
      });
      return value;
    },
    getPrcValue: function(){
      if(!this.is.init) return false;
      var $this = this;

      var value = "";
      $.each( this.o.pointers, function(i){
        if( this.value.prc != undefined && !isNaN(this.value.prc) ) value += (i > 0 ? ";" : "") + this.value.prc;
      });
      return value;
    },
    prcToValue: function( prc ){

  	  if( this.settings.heterogeneity && this.settings.heterogeneity.length > 0 ){
    	  var h = this.settings.heterogeneity;

    	  var _start = 0;
    	  var _from = this.settings.from;

    	  for( var i=0; i <= h.length; i++ ){
    	    if( h[i] ) var v = h[i].split("/");
    	    else       var v = [100, this.settings.to];

    	    v[0] = new Number(v[0]);
    	    v[1] = new Number(v[1]);

    	    if( prc >= _start && prc <= v[0] ) {
    	      var value = _from + ( (prc-_start) * (v[1]-_from) ) / (v[0]-_start);
    	    }

    	    _start = v[0];
    	    _from = v[1];
    	  };

  	  } else {
        var value = this.settings.from + ( prc * this.settings.interval ) / 100;
  	  }

      return this.round( value );
    },

  	valueToPrc: function( value, pointer ){
  	  if( this.settings.heterogeneity && this.settings.heterogeneity.length > 0 ){
    	  var h = this.settings.heterogeneity;

    	  var _start = 0;
    	  var _from = this.settings.from;

    	  for (var i=0; i <= h.length; i++) {
    	    if(h[i]) var v = h[i].split("/");
    	    else     var v = [100, this.settings.to];
    	    v[0] = new Number(v[0]); v[1] = new Number(v[1]);

    	    if(value >= _from && value <= v[1]){
    	      var prc = pointer.limits(_start + (value-_from)*(v[0]-_start)/(v[1]-_from));
    	    }

    	    _start = v[0]; _from = v[1];
    	  };

  	  } else {
    	  var prc = pointer.limits((value-this.settings.from)*100/this.settings.interval);
  	  }

  	  return prc;
  	},


  	round: function( value ){
	    value = Math.round( value / this.settings.step ) * this.settings.step;
  		if( this.settings.round ) value = Math.round( value * Math.pow(10, this.settings.round) ) / Math.pow(10, this.settings.round);
  		else value = Math.round( value );
  		return value;
  	},

  	nice: function( value ){
  		value = value.toString().replace(/,/gi, ".");
  		value = value.toString().replace(/ /gi, "");
  		if( Number.prototype.jSliderNice )
  		  return (new Number(value)).jSliderNice(this.settings.round).replace(/-/gi, "&minus;");
  		else
  		  return new Number(value);
  	}

  };

  function jSliderPointer(){
  	this.baseConstructor.apply(this, arguments);
  }

  jSliderPointer.inheritFrom(Draggable, {
    oninit: function( ptr, id, _constructor ){
      this.uid = id;
      this.parent = _constructor;
      this.value = {};
      this.settings = this.parent.settings;
    },
  	onmousedown: function(evt){
  	  this._parent = {
  	    offset: this.parent.domNode.offset(),
  	    width: this.parent.domNode.width()
  	  };
  	  this.ptr.addDependClass("hover");
  	  this.setIndexOver();
  	},
  	onmousemove: function( evt, x ){
  	  var coords = this._getPageCoords( evt );
  	  this._set( this.calc( coords.x ) );
  	},
  	onmouseup: function( evt ){
      // var coords = this._getPageCoords( evt );
      // this._set( this.calc( coords.x ) );

  	  if( this.parent.settings.callback && $.isFunction(this.parent.settings.callback) )
  	    this.parent.settings.callback.call( this.parent, this.parent.getValue() );

  	  this.ptr.removeDependClass("hover");
  	},

  	setIndexOver: function(){
  	  this.parent.setPointersIndex( 1 );
  	  this.index( 2 );
  	},

  	index: function( i ){
  	  this.ptr.css({ zIndex: i });
  	},

  	limits: function( x ){
  	  return this.parent.limits( x, this );
  	},

  	calc: function(coords){
  	  var x = this.limits(((coords-this._parent.offset.left)*100)/this._parent.width);
  	  return x;
  	},

  	set: function( value, opt_origin ){
  	  this.value.origin = this.parent.round(value);
  	  this._set( this.parent.valueToPrc( value, this ), opt_origin );
  	},
  	_set: function( prc, opt_origin ){
  	  if( !opt_origin )
  	    this.value.origin = this.parent.prcToValue(prc);

  	  this.value.prc = prc;
  		this.ptr.css({ left: prc + "%" });
  	  this.parent.redraw(this);
  	}

  });


})(jQuery);





/* end */







/*
 * Depend Class v0.1b : attach class based on first class in list of current element
 * File: jquery.dependClass.js
 * Copyright (c) 2009 Egor Hmelyoff, hmelyoff@gmail.com
 */


(function($) {
	// Init plugin function
	$.baseClass = function(obj){
	  obj = $(obj);
	  return obj.get(0).className.match(/([^ ]+)/)[1];
	};

	$.fn.addDependClass = function(className, delimiter){
		var options = {
		  delimiter: delimiter ? delimiter : '-'
		}
		return this.each(function(){
		  var baseClass = $.baseClass(this);
		  if(baseClass)
    		$(this).addClass(baseClass + options.delimiter + className);
		});
	};

	$.fn.removeDependClass = function(className, delimiter){
		var options = {
		  delimiter: delimiter ? delimiter : '-'
		}
		return this.each(function(){
		  var baseClass = $.baseClass(this);
		  if(baseClass)
    		$(this).removeClass(baseClass + options.delimiter + className);
		});
	};

	$.fn.toggleDependClass = function(className, delimiter){
		var options = {
		  delimiter: delimiter ? delimiter : '-'
		}
		return this.each(function(){
		  var baseClass = $.baseClass(this);
		  if(baseClass)
		    if($(this).is("." + baseClass + options.delimiter + className))
    		  $(this).removeClass(baseClass + options.delimiter + className);
    		else
    		  $(this).addClass(baseClass + options.delimiter + className);
		});
	};

	// end of closure
})(jQuery);








/*
	jQuery TextAreaResizer plugin
	Created on 17th January 2008 by Ryan O'Dell
	Version 1.0.4

	Converted from Drupal -> textarea.js
	Found source: http://plugins.jquery.com/misc/textarea.js
	$Id: textarea.js,v 1.11.2.1 2007/04/18 02:41:19 drumm Exp $

	1.0.1 Updates to missing global 'var', added extra global variables, fixed multiple instances, improved iFrame support
	1.0.2 Updates according to textarea.focus
	1.0.3 Further updates including removing the textarea.focus and moving private variables to top
	1.0.4 Re-instated the blur/focus events, according to information supplied by dec


*/
(function($) {
	var area, staticOffset;  // added the var declaration for 'staticOffset' thanks to issue logged by dec.
	var iLastMousePos = 0;
	var iMin = 32;
	var grip;

	$.fn.Resizer = function(options) {
        var defaults = {
    		onStartDrag: function () {},
		    onEndDrag: function () {}
        };

        var settings = $.extend({}, defaults, options);

      	/* private functions */
      	var startDrag = function(e) {
      		area = $(e.data.el);
      		area.blur();
      		iLastMousePos = mousePosition(e).y;
      		staticOffset = area.height() - iLastMousePos;
      		area.css('opacity', 0.25);
       	    settings.onStartDrag.call(e, area);
      		$(document).mousemove(performDrag).mouseup(endDrag);
      		return false;
      	};

      	var performDrag = function (e){
      		var iThisMousePos = mousePosition(e).y;
      		var iMousePos = staticOffset + iThisMousePos;
      		if (iLastMousePos >= (iThisMousePos)) {
      			iMousePos -= 5;
      		}
      		iLastMousePos = iThisMousePos;
      		iMousePos = Math.max(iMin, iMousePos);
      		area.height(iMousePos + 'px');
      		if (iMousePos < iMin) endDrag(e);
      		return false;
      	};

      	var endDrag = function (e){
      		$(document).unbind('mousemove', performDrag).unbind('mouseup', endDrag);
      		area.css('opacity', 1);
      		area.focus();
            settings.onEndDrag.call(e, area);
      		area = null;
      		staticOffset = null;
      		iLastMousePos = 0;
      	};

      	var mousePosition = function(e) {
      		return { x: e.clientX + document.documentElement.scrollLeft, y: e.clientY + document.documentElement.scrollTop };
      	};

		return this.each(function() {
		    area = $(this).addClass('processed'), staticOffset = null;

			// 18-01-08 jQuery bind to pass data element rather than direct mousedown - Ryan O'Dell
		    // When wrapping the text area, work around an IE margin bug.  See:
		    // http://jaspan.com/ie-inherited-margin-bug-form-elements-and-haslayout
            if($(this).is("iframe")){
              // don't move iframes around the DOM because some browser will reload them...
              $(this).parents('.resizable-wrapper').append($('<div class="grippie"></div>').bind("mousedown",{el: this} , startDrag));
            }else{

  		      $(this).wrap('<div class="resizable-wrapper"></div>')
		        .parent().append($('<div class="grippie"></div>').bind("mousedown",{el: this} , startDrag));
            }

		    var grippie = $('div.grippie', $(this).parent())[0];
		    grippie.style.marginRight = (grippie.offsetWidth - $(this)[0].offsetWidth) +'px';

		});
	};

})(jQuery);





// define our CodeMirror mode (atom/html)
// highlights Atom {KEYWORDS}
CodeMirror.defineMode('atom/html', function(config, parserConfig){
  var atomOverlay = {
    token: function(stream, state){
      var isAtomVar = false;
      if(stream.match('{')){
        while((ch = stream.next()) != null && ch === ch.toUpperCase())
          if(ch === '}'){
            if(/^{[A-Z,_]+}$/.test(stream.current())) isAtomVar = true;
            break;
          }

        if(isAtomVar) return 'atom-var';
      }
      while(stream.next() != null && !stream.match('{', false)){}
      return null;
    }
  };
  return CodeMirror.overlayParser(CodeMirror.getMode(config, parserConfig.backdrop || 'text/html'), atomOverlay);
});






jQuery(document).ready(function($){


  var editors = new Array(),

      widget_controls = function(widget){

        // template selector (using links, looks nicer than select inputs)
        $('.template-selector a.select', widget).click(function(){
          var button = $(this),
              selector = $(this).parents('.template-selector'),
              selected = $(this).attr('rel');

          $('input.select', selector).val(selected).change();
          $('a', selector).removeClass('active');
          button.addClass('active');
          return false;
        });

        // hidden input field (used for creating the select-links above)
        // not to be confused with input[type=select]
        $('.template-selector input.select', widget).change(function(){
          var data = $(this).val(),
              selector = $(this).parents('.template-selector');

          $('a.select[rel="' + data + '"]', selector).addClass('active');

          if(data != 'template'){
            $('.user-template', widget).animate({
              opacity: 'hide',
              height: 'hide',
              marginTop: 'hide',
              marginBottom: 'hide',
              paddingTop: 'hide',
              paddingBottom: 'hide'
            }, 150);
          }else{
            $('.user-template', widget).animate({
              opacity: 'show',
              height: 'show',
              marginTop: 'show',
              marginBottom: 'show',
              paddingTop: 'show',
              paddingBottom: 'show'
            }, 150);

            // refresh codemirror editors, if any
            for(var i = 0; i < editors.length; i++)
              editors[i].refresh();

          }

        }).change();

        // visibility options
        $('input.button-visibility', widget).click(function(e){

          e.preventDefault();

          var control      = $(this),
              status       = $('input.visibility', widget),
              options      = $('.visibility-options', widget),
              widget_id    = status.data('widget'),
              nonce        = status.data('nonce');

          if(parseInt(status.val()) !== 1){

            status.val(1);

            // only make the ajax request if we didn't do it once already (we're keeping contents of the previous one)
            if($('input', options).length > 0){
              options.show();
              control.val(atom_config.label_visibility_hide);

            }else{
              $.ajax({
                type: 'post',
                url: ajaxurl,
                data: {
                  action: 'widget_visibility_options_fields',
                  widget_id: widget_id,
                  _ajax_nonce: nonce
                },
                beforeSend: function(){
                  control.val(atom_config.label_loading).attr('disabled','disabled');
                },
                error: function(err){
                  alert(err);
                },
                success: function(data){
                  options.append(data);
                  control.val(atom_config.label_visibility_hide).removeAttr('disabled');
                }
              });
            }

          }else{
            status.val(0);
            options.hide();
            control.val(atom_config.label_visibility_show);

          }

          return false;
        });

      },


      atom_interface = function(block){

        // update check link
        $('#update-check').click(function(event){
          event.preventDefault();
          $.ajax({
            type: 'GET',
            url: ajaxurl,
            context: this,
            data: {
              action: 'force_update_check',
              _ajax_nonce: $(this).data('nonce')
            },
            beforeSend: function(){
              $(this).text(atom_config.label_checking);
            },
            success: function(data){
              $(this).replaceWith(data);
            }
          });
        });

        $('textarea.resizable:not(.processed)', block).Resizer();

        // code editors (codemirror)
        $('textarea.code.editor', block).each(function(i, el){
          editors.push(CodeMirror.fromTextArea(document.getElementById($(this).attr('id')), {
            lineNumbers: true,
            matchBrackets: true,
            mode: $(this).data('mode'),
            onChange: function(inst){
              inst.save();
            }
         }));
        });

        // form dependencies (disable/enable them based on the rules attribute check)
        $('[followRules]', block).setupDependencies();

        // (un)select-all
        $('.toggle-select-all', block).toggle(function() {
          $(this).select();
        }, function() {
          $(this).unselect();
        });


        // latest news rss
        $('.rss-meta-box', block).each(function(){
          $.ajax({
            type: 'GET',
            url: ajaxurl,
            data: {
              action: 'rss_meta_box',
              feed: $(this).data('feed'),
              items: $(this).data('items'),
              _ajax_nonce: $(this).data('nonce')
            },
            context: this,
            success: function(data){
              $(this).html(data);
              $('ul', this).animate({ opacity: 'show', height: 'show' }, 200).show();
            }
          });
        });

        // color pickers
        $('.color-selector', block).ColorPicker({
          onShow: function(colorpicker){
            $(colorpicker).css({ opacity: 0, marginTop: -10 }).show().animate({ opacity: 1, marginTop: 0 }, 160);
            $(this).ColorPickerSetColor($(this).find('input').val());
            return false;
          },
          onHide: function(colorpicker) {
            $(colorpicker).fadeOut(160);
            return false;
          },
          onChange: function(hsb, hex, rgb, element) {
            $('.preview', element).css('background-color', '#' + hex);
            $('input', element).val(hex).trigger('change');
          }
        });

        // image upload buttons -- old stuff @todo: use wp swf uploader
        $('a.upload', block).each(function(){
          var button = $(this),
              button_id = $(this).attr('id'),
              nonce = $(this).data('nonce'),
              option_name = $(this).parents('div').find('input:hidden').attr('name');

          new AjaxUpload(button_id, {
            action: ajaxurl,
            name: option_name, // file upload name
            data: { // Additional data to send
              action: 'process_upload',
              _ajax_nonce: nonce,
              option: option_name
            },
            autoSubmit: true,
            responseType: 'json',   // @note: ajaxUpload doesn't handle HTML nicely, so we have to pass the image source only, and handle HTML ourselves
            onChange: function(file, extension){},
            onSubmit: function(file, extension){
              button.text(atom_config.label_uploading);
              this.disable(); // If you want to allow uploading only 1 file at time, you can disable upload button
              interval = window.setInterval(function(){
                var text = button.text();
                if(text.length < 13)
                  button.text(text + '.');
                else
                  button.text(atom_config.label_uploading);
              }, 200);
            },
            onComplete: function(file, response){
              window.clearInterval(interval);
              this.enable(); // enable upload button

              // we have a error
              if(response.error != ''){
                $('div.error.upload').remove(); // remove the old error messages, if they exists
                $('#theme-settings-form').prepend('<div class="error upload"><p>' + response.error + '</p></div>');
                button.text(atom_config.label_try_another);
                $('html').animate({scrollTop:0}, 333);

              }else{
                $('div.error.upload').remove();

                $('img', button.parent()).animate({ opacity: 0, top: -100 }, 200, function(){
                  $(this).attr('src', response.url).animate({ opacity: 1, top: 0 }, 200);
                });

                $('a.reset_upload', button.parent()).fadeIn(150);
                button.text(atom_config.label_change_image);
                $('input[name="' + option_name + '"]').val(response.url).trigger('change');

              }
            }
          });
        });

        // remove uploaded image button
        $('a.reset_upload', block).click(function(){
          var button = $(this),
              button_id = $(this).attr('id'),
              nonce = $(this).data('nonce'),
              option_name = $(this).parents('div').find('input:hidden').attr('name');

          $('#image-' + option_name).animate({ opacity: 0, top: -100 }, 200);
          button.fadeOut(150);
          $('a.upload', button.parent()).text(atom_config.label_upload_image);
          $('input[name="' + option_name + '"]').val('').trigger('change');
          $('div.error.upload').remove();

          return false;
        });


      };


  $(document).bind('atom_ready', function(){

    // set up generic atom controls
    atom_interface($('.atom-block'));

    // set up our widget controls on the currently active/inactive widgets
    widget_controls($('#widgets-right .widget, #wp_inactive_widgets .widget'));

    // style splitter widget
    $("div[id*='atom-splitter-']").each(function(){
      $(this).addClass('atom-widget-splitter').find('.widget-control-actions .alignright').remove();
    })

    // cool javascript error handler for the design panel -- need to add this somehow as a debug message for the front-end too ;)
    $('#atom-design-panel-status').each(function(){

      var status = $(this);

      // check after 10 seconds (maybe we should extend this?)
      setTimeout(function(){
        if($('#atom-design-panel').is(':visible')){
          status.remove();

        }else{
          status.addClass('error').html('<p>' + atom_config.label_design_panel_error + '</p>');

        }
      }, 10 * 1000);

    });

    // set up widget controls on widgets that are going to be dropped around
    // this also fixes WP's widget-save bug -- 2nd attempt, without livequery (though the previous one was working too)
    $('#widgets-right').ajaxComplete(function(event, XMLHttpRequest, ajaxOptions){

      // determine which ajax request is this (we're after "save-widget")
      var request = {}, pairs = ajaxOptions.data.split('&'), i, split;

      for(i in pairs){
        split = pairs[i].split('=');
        request[decodeURIComponent(split[0])] = decodeURIComponent(split[1]);
      }

      // only proceed if this was a widget-save request
      if(request.action && (request.action === 'save-widget')){

        // locate the widget block
        var widget = $('input.widget-id[value="' + request['widget-id'] + '"]').parents('.widget');

        // trigger manual save, if this was the save request and if we didn't get the form html response
        if(!XMLHttpRequest.responseText){
          wpWidgets.save(widget, 0, 1, 0);

        // we got an response, so we hook our controls on the new elements
        }else{
          widget_controls(widget);
          atom_interface(widget);

        }

      }

    });

  }).trigger('atom_ready');


  // featured posts handler
  $('td.featured a.feature').click(function(event){
    event.preventDefault();
    var pos = $(this).attr('id').lastIndexOf('-');

    $.ajax({
      url: ajaxurl,
      type: 'GET',
      context: this,
      data: ({
        action: 'process_featured',
        id: $(this).attr('id').substr(++pos),
        isOn: $(this).hasClass('on') ? 1 : 0,
        what: $(this).attr('rel'),
        _ajax_nonce: $(this).data('nonce')
      }),
      beforeSend: function() {
        $(this).removeClass('on off').addClass('loading');
      },

      error: function(request){
        $(this).removeClass('loading').addClass('error');
      },

      success: function(data){
        $(this).removeClass('loading').addClass(data);
      }

    });
  });


  // simple ajax tabbed interface for the theme settings tabs
  $('#theme-settings .atom-tabs .nav a').click(function(event){

    var tabs = $(this).parents('.atom-tabs'),
        target = $(this).attr('href'),
        content = $('.tab-content', tabs);

    event.preventDefault();

    target = decodeURI(RegExp('section=(.+?)(&|$)').exec(target)[1]) || target.split('#')[1];

    $('.nav li', tabs).removeClass('active');

    $(this).parent('li').addClass('active');

    $.ajax({
      type: 'GET',
      url: ajaxurl,
      context: this,

      data: {
        action: 'get_tab',
        section: target,
        _ajax_nonce: tabs.data('nonce')
      },

      beforeSend: function() {
        content.addClass('loading');
      },

      // normal page loading on error
      error: function(){
        window.location.href = $(this).attr('href');
      },

      success: function(data){
        content.removeClass('loading').html(data);
        atom_interface(content);
        $.cookie(atom_config.id + '-settings' , target, { path: '/' });
      }
    });

    return false;
  });

  // override active tab, if a tab ID is present in the hash
  $("#theme-settings .atom-tabs .nav a").each(function(){
    if(window.location.hash == $(this).attr('href'))
      $(this).trigger('click');
  });


  // live theme preview
  pm.bind('themepreview-load', function(){

    // make design preview iframe resizable, and remember user-set height
    $('#themepreview').Resizer({
      onEndDrag: function(iframe){
        $.cookie(iframe.attr('id') + '-height' , iframe.height(), { path: '/' });
      }
    });

    // live preview: background color
    $('input[name="background_color"]').change(function(){
      pm({
        target: window.frames['themepreview'],
        type: 'background_color', // $(this).attr('name')
        data: $(this).val()
      });
    });

    // live preview: logo
    $('input[name="logo"]').change(function(){
      pm({
        target: window.frames['themepreview'],
        type: 'logo',
        data: $(this).val() || 'remove'
      });
    });

    // live preview: background-image
    $('input[name="background_image"]').change(function(){
      pm({
        target: window.frames['themepreview'],
        type: 'background_image',
        data: $(this).val() || 'remove'
      });
    });

    // live preview: favicon
    $('input[name="favicon"]').change(function(){
      pm({
        target: window.frames['themepreview'],
        type: 'favicon',
        data: $(this).val() || 'remove'
      });
    });

    // show design panel
    $('#atom-design-panel').animate({
      opacity: 'show',
      height: 'show',
      marginTop: 'show',
      marginBottom: 'show',
      paddingTop: 'show',
      paddingBottom: 'show'
    }, 333);

    // remove design panel error message,
    // which in some cases might be there because the iframe took more than 10 seconds to load...
    $('#atom-design-panel-status').remove();

  });

});