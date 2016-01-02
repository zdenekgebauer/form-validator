'use strict';

document.addEventListener('DOMContentLoaded', function(event) {

	var form = document.querySelector('form'),
		validator = new FormValidator(form, true),
		results = form.querySelector('.results'),
		textarea = form.querySelector('textarea'),
		buttonValidate = document.getElementById('validateTextarea'),
		selCountry = form.querySelector('#fCountry'),
		inputZip = form.querySelector('#fZip'),
		buttonAddText = document.getElementById('addText');

	var checkCompany = form.querySelector('input[id="fCompany"]');

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
	checkCompany.addEventListener('change', function() {
		var inputs = form.querySelectorAll('input[data-required-company]');
		Array.prototype.forEach.call (inputs, function (node) {
			node.required = checkCompany.checked;
		});
	});

	// set pattern dyanmically
	selCountry.addEventListener('change', function() {
		switch(selCountry.value) {
			case 'cs':
				inputZip.required = true;
				inputZip.pattern = "[1-9]{5}";
				break;
			case 'hu':
				inputZip.required = true;
				inputZip.pattern = "[1-9]{4}";
				break;
			default:
				inputZip.required = false;
				inputZip.removeAttribute('pattern');
		}
		validator.validateInput(inputZip);

	}, false);

	// validate inserted fields
	buttonAddText.addEventListener('mousedown', function() {
		document.getElementById('newTextHolder').innerHTML = '<label for="fNewText">New text:</label> <input type="text" name="new_text" id="fNewText" required /> <span data-validation-info="new_text"></span>';
		validator.setOnChangeValidation();
	});

});
