'use strict';

document.addEventListener('DOMContentLoaded', function() {

	var form = document.querySelector('form'),
		validator = new FormValidator(form, true), // eslint-disable-line no-undef
		results = form.querySelector('.results'),
		textarea = form.querySelector('textarea'),
		buttonValidate = document.getElementById('validateTextarea'),
		selCountry = form.querySelector('#fCountry'),
		inputZip = form.querySelector('#fZip'),
		buttonAddText = document.getElementById('addText'),
		checkCond = form.querySelector('input[id="fReqCheck"]');

	// block submit in demo
	form.addEventListener('submit', function(event) {
		event.preventDefault();
	});

	// validation on submit
	form.addEventListener(validator.EVENT_FORM_VALIDATION, function(event) {
		if (event.detail.valid) {
			results.innerHTML = 'OK';
		} else {
			var html = '<p>Errors:</p>';
			Array.prototype.forEach.call(event.detail.messages, function(message) {
				html += '<p>' + message + '</p>';
			});
			results.innerHTML = html;
		}
	});

	// display input validation status
	form.addEventListener(validator.EVENT_VALIDATION, function(event) {
		var input = event.target ? event.target : event.srcElement,
			span = form.querySelector('[data-validation-info="' + input.name + '"]');
		if (span !== null) {
			span.innerHTML = (input.validity.valid ? 'OK' : input.validationMessage);
		}
	});

	// manually validate single input
	buttonValidate.addEventListener('mousedown', function() {
		alert(validator.validateInput(textarea) ? 'textarea is valid' : 'textarea is not valid');
	});

	// set required fields dynamically
	checkCond.addEventListener('change', function() {
		var inputs = form.querySelectorAll('input[data-required-cond]');
		Array.prototype.forEach.call (inputs, function (node) {
			node.required = checkCond.checked;
		});
	});

	// set pattern dynamically
	selCountry.addEventListener('change', function() {
		switch(this.value) {
		case 'cs':
			inputZip.required = true;
			inputZip.pattern = '[1-9]{5}';
			break;
		case 'hu':
			inputZip.required = true;
			inputZip.pattern = '[1-9]{4}';
			break;
		default:
			inputZip.required = false;
			inputZip.removeAttribute('pattern');
		}
		validator.validateInput(inputZip);

	}, false);

	// validate inserted fields
	var counterInput = 1;
	buttonAddText.addEventListener('mousedown', function() {
		document.getElementById('newTextHolder').innerHTML += '<p><input type="text" name="new_text' + counterInput
			+ '" required /> <span data-validation-info="new_text' + counterInput+ '"></span>';
		validator.setOnChangeValidation();
		counterInput++;
	});

});
