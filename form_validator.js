'use strict';

/**
 * @param {DOM node} form
 * @param {Boolean} validateOnChange
 * @return {FormValidator}
 */
var FormValidator = function (form, validateOnChange) {
	/**
	 * @var {String} name of single element validation event
	 */
	this.EVENT_VALIDATION = 'VALIDATION_ELEMENT';
	/**
	 * @var {String} name of form validation event
	 */
	this.EVENT_FORM_VALIDATION = 'VALIDATION_FORM';

	var inputsSelector = 'input:not([type="hidden"]):not([type="submit"]):not([type="reset"]):not(:disabled):not([readonly]),textarea:not(:disabled):not([readonly]),select:not(:disabled)';

	/**
	 * @param {Event} event
	 * @return {Boolean}
	 */
	this.validateForm = function (event) {
		var isValid = true, messages = [], inputs = form.querySelectorAll(inputsSelector), i, len = inputs.length, inputNames = [];
		for (i = 0; i < len; i++) {
			if (!this.validateInput(inputs[i])) {
				isValid = false;
				if (inputNames.indexOf(inputs[i].name) < 0) {
					messages.push(inputs[i].validationMessage);
				}
				inputNames.push(inputs[i].name);
			};
		}
		var validationEvent = new CustomEvent(this.EVENT_FORM_VALIDATION, {
			detail: {
				valid: isValid,
				messages: messages
			},
			bubbles: true,
			cancelable: true
		});
		form.dispatchEvent(validationEvent);
		if (!isValid) {
			event.preventDefault();
		}
		return isValid;
	};

	/**
	 * @param {DOM node} input
	 * @returns {Boolean}
	 */
	this.validateInput = function (input) {
		var result = true;
		if (typeof input.willValidate !== 'undefined') {
			input.setCustomValidity('');
			input.checkValidity();
			result = input.validity.valid;
			if (!result && input.title !== '') {
				input.setCustomValidity(input.title);
			}
			if (result) {
				extraValidation(input);
				result = input.validity.valid;
			}
		} else {
			legacyValidation(input);
			result = input.validity.valid;
		}

		var event = new CustomEvent(this.EVENT_VALIDATION, {
			bubbles: true,
			cancelable: true
		});
		input.dispatchEvent(event);
		return result;
	};

	var handleInputChange = function (event) {
		this.validateInput(event.target ? event.target : event.srcElement);
	};

	/**
	 * force validation on change for all fields in form
	 */
	this.setOnChangeValidation = function() {
		var inputs = form.querySelectorAll(inputsSelector), i, len = inputs.length;
		for (i = 0; i < len; i++) {
			inputs[i].addEventListener('input', handleInputChange.bind(this));
			inputs[i].addEventListener('blur', handleInputChange.bind(this));
			inputs[i].addEventListener('change', handleInputChange.bind(this)); // input file
		}
	};

	/**
	 * @param {DOMnode} input
	 */
	var legacyValidation = function(input) {
		var value = input.value,
		type = input.getAttribute('type'),
		checkbox = (type === 'checkbox' || type === 'radio'),
		regexp = null,
		minlength = parseInt(input.getAttribute('minlength')),
		validationRule = input.getAttribute('data-validation-rule');

		input.validity = {};
		input.validity.valid = true;
		input.validity.customError = false;
		input.validity.valueMissing = false;
		input.validity.patternMismatch = false;
		input.validity.rangeUnderFlow = false;
		input.validity.rangeOverflow = false;
		input.validationMessage = '';
		if (input.getAttribute('required') !== null && (value === '' || checkbox && !input.checked))   {
			input.validity.valid = false;
			input.validity.valueMissing = true;
			input.validationMessage = (input.title === '' ? 'This field is required' : input.title);
			return;
		}

		if (input.getAttribute('min') !== null) {
			if (parseFloat(value) < parseFloat(input.getAttribute('min'))) {
				input.validity.valid = false;
				input.validity.rangeUnderFlow = true;
				input.validationMessage = (input.title === '' ? 'Value is too low' : input.title);
				return;
			}
		}
		if (input.getAttribute('max') !== null) {
			if (parseFloat(value) > parseFloat(input.getAttribute('max'))) {
				input.validity.valid = false;
				input.validity.rangeOverFlow = true;
				input.validationMessage = (input.title === '' ? 'Value is too high' : input.title);
				return;
			}
		}

		if (validationRule !== null && value !== '') {
			regexp = regexpByRule(validationRule);
		}

		if (regexp !== null && !regexp.test(value)) {
			input.validity.valid = false;
			input.validity.patternMismatch = true;
			input.validationMessage = (input.title === '' ? 'Incorect format' : input.title);
			return;
		}

		if (minlength >  0 && value.length < minlength) {
			input.validity.valid = false;
			input.validationMessage = (input.title === '' ? 'Value is too short' : input.title);
			return;
		}

	};

	/**
	 * @param {DOMnode} input
	 */
	var extraValidation = function(input) {
		var value = input.value,
			type = input.type,
			regexp = null,
			minlength = parseInt(input.getAttribute('minlength')),
			validationRule = input.getAttribute('data-validation-rule');

		if (minlength >  0 && value.length < minlength) {
			input.setCustomValidity(input.title === '' ? 'Value is too short' : input.title);
			return;
		}

		if (validationRule !== null && value !== '') {
			regexp = regexpByRule(validationRule);
		}

		if (regexp !== null && !regexp.test(value)) {
			input.setCustomValidity((input.title === '' ? 'Incorect format' : input.title));
			return;
		}

		if (type === 'file') {
			var maxFilesize = parseInt(input.dataset.validationMaxFilesize);
			var files = input.files;
			if (files.length > 0 && files[0].size > maxFilesize) {
				input.setCustomValidity(input.title === '' ? 'File is too large' : input.title);
				return;
			}
		}
	};

	form.noValidate = true;
	form.addEventListener('submit', this.validateForm.bind(this));
	if (validateOnChange) {
		this.setOnChangeValidation();
	}

	var regexpByRule = function(validationRule) {
		switch (validationRule) {
		case 'email':
			return new RegExp('^[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+@[-!#$%&\'*+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+$');
		case 'phone':
			return new RegExp('^[0-9 ]{9,15}$');
		}
		return null;
	};

};

// MSIE polyfill
(function () {
	function CustomEvent(event, params) {
		params = params || {bubbles: false, cancelable: false, detail: undefined};
		var evt = document.createEvent('CustomEvent');
		evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
		return evt;
	};
	CustomEvent.prototype = window.Event.prototype;
	window.CustomEvent = CustomEvent;
})();