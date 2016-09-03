'use strict';

/**
 * @param {Object} form DOM element representing form
 * @param {boolean} validateOnChange [validateOnChange=false] true=validate each field on change
 * @return {FormValidator} validator instance
 */
var FormValidator = function (form, validateOnChange) { // eslint-disable-line no-unused-vars
	/**
	 * @var {String} name of single element validation event
	 */
	this.EVENT_VALIDATION = 'VALIDATION_ELEMENT';
	/**
	 * @var {String} name of form validation event
	 */
	this.EVENT_FORM_VALIDATION = 'VALIDATION_FORM';

	// eslint-disable-next-line max-len
	var inputsSelector = 'input:not([type="hidden"]):not([type="submit"]):not([type="reset"]):not(:disabled):not([readonly]),textarea:not(:disabled):not([readonly]),select:not(:disabled)';

	/**
	 * @param {Object} event form submit event
	 * @return {boolean} false if form is not valid
	 */
	this.validateForm = function (event) {
		var isValid = true, messages = [], inputs = form.querySelectorAll(inputsSelector), i, len = inputs.length,
			inputNames = [];
		for (i = 0; i < len; i++) {
			if (!this.validateInput(inputs[i])) {
				isValid = false;
				if (inputNames.indexOf(inputs[i].name) < 0) {
					messages.push(inputs[i].validationMessage);
				}
				inputNames.push(inputs[i].name);
			}
		}
		//noinspection JSCheckFunctionSignatures
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
	 * @param {Object} input DOM element representing input
	 * @returns {boolean} false if input is not valid
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

		//noinspection JSCheckFunctionSignatures
		var event = new CustomEvent(this.EVENT_VALIDATION, {
			bubbles: true,
			cancelable: true
		});
		input.dispatchEvent(event);
		return result;
	};

	var handleInputChange = function (event) {
		//noinspection JSPotentiallyInvalidUsageOfThis
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
	 * @param {Object} input DOM element representing input
	 */
	var legacyValidation = function(input) {
		var value = input.value,
			type = input.getAttribute('type'),
			checkbox = (type === 'checkbox' || type === 'radio');

		input.validity = {};
		input.validity.valid = true;
		input.validity.customError = false;
		input.validity.valueMissing = false;
		input.validity.patternMismatch = false;
		input.validity.rangeUnderFlow = false;
		input.validity.rangeOverflow = false;
		input.validationMessage = '';
		if (input.getAttribute('required') && (value === '' || checkbox && !input.checked)) {
			input.validity.valid = false;
			input.validity.valueMissing = true;
			input.validationMessage = (input.title === '' ? 'This field is required' : input.title);
			return;
		}

		legacyValidationRange(input);
		legacyValidationRule(input);
		legacyValidationLength(input);
	};

	/**
	 * @param {Object} input DOM element representing input
	 */
	var legacyValidationRange = function(input) {
		if (input.getAttribute('min') && parseFloat(input.value) < parseFloat(input.getAttribute('min'))) {
			input.validity.valid = false;
			input.validity.rangeUnderFlow = true;
			input.validationMessage = (input.title === '' ? 'Value is too low' : input.title);
		}
		if (input.getAttribute('max') && parseFloat(input.value) > parseFloat(input.getAttribute('max'))) {
			input.validity.valid = false;
			input.validity.rangeOverFlow = true;
			input.validationMessage = (input.title === '' ? 'Value is too high' : input.title);
		}
	};

	/**
	 * @param {Object} input DOM element representing input
	 */
	var legacyValidationRule = function(input) {
		var validationRule = input.getAttribute('data-validation-rule');
		if (validationRule && input.value !== '') {
			var regexp = regexpByRule(validationRule);
			if (regexp instanceof RegExp && !regexp.test(input.value)) {
				input.validity.valid = false;
				input.validity.patternMismatch = true;
				input.validationMessage = (input.title === '' ? 'Incorrect format' : input.title);
			}
		}
	};

	/**
	 * @param {Object} input DOM element representing input
	 */
	var legacyValidationLength = function(input) {
		var minlength = parseInt(input.getAttribute('minlength'));

		if (minlength > 0 && input.value.length < minlength) {
			input.validity.valid = false;
			input.validationMessage = (input.title === '' ? 'Value is too short' : input.title);
		}
	};

	/**
	 * @param {Object} input DOM element representing input
	 */
	var extraValidation = function(input) {
		extraValidationRange(input);
		extraValidationRule(input);

		if (input.type === 'file') {
			extraValidationFile(input);
		}
	};

	/**
	 * @param {Object} input DOM element representing input
	 */
	var extraValidationRange = function(input) {
		var minlength = parseInt(input.getAttribute('minlength'));
		if (minlength > 0 && input.value.length < minlength) {
			input.setCustomValidity(input.title === '' ? 'Value is too short' : input.title);
		}
	};

	/**
	 * @param {Object} input DOM element representing input
	 */
	var extraValidationRule = function(input) {
		var validationRule = input.getAttribute('data-validation-rule');
		if (validationRule && input.value !== '') {
			var regexp = regexpByRule(validationRule);
			if (regexp instanceof RegExp && !regexp.test(input.value)) {
				input.setCustomValidity((input.title === '' ? 'Incorrect format' : input.title));
			}
		}
	};

	/**
	 * @param {Object} inputFile DOM element representing input
	 * @returns void
	 */
	var extraValidationFile = function(inputFile) {
		var maxFilesize = parseInt(inputFile.dataset.validationMaxFilesize), files = inputFile.files;
		if (files.length > 0 && files[0].size > maxFilesize) {
			inputFile.setCustomValidity(inputFile.title === '' ? 'File is too large' : inputFile.title);
		}
	};

	form.noValidate = true;
	form.addEventListener('submit', this.validateForm.bind(this));
	if (validateOnChange) {
		this.setOnChangeValidation();
	}

	//noinspection FunctionWithMultipleReturnPointsJS
	var regexpByRule = function(validationRule) {
		var regexp = null;
		switch (validationRule) {
		case 'email':
			// eslint-disable-next-line max-len
			regexp = new RegExp('^[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+@[-!#$%&\'*+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+$');
			break;
		case 'phone':
			regexp = new RegExp('^[0-9 ]{9,15}$');
			break;
		}
		return regexp;
	};

};

// MSIE polyfill
(function () {
	function CustomEvent(event, params) {
		params = params || {bubbles: false, cancelable: false, detail: undefined};
		var evt = document.createEvent('CustomEvent');
		evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
		return evt;
	}
	CustomEvent.prototype = window.Event.prototype;
	window.CustomEvent = CustomEvent;
})();