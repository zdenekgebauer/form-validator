'use strict';

document.addEventListener('DOMContentLoaded', function(event) {

	var form = document.querySelector('form'),
		validator = new FormValidator(form, true),
		results = form.querySelector('.results');

	// block submit in demo
	form.addEventListener('submit', function(event) {
		event.preventDefault();
	});

	// validation on submit
	form.addEventListener(validator.EVENT_FORM_VALIDATION, function(event) {
		results.classList.remove('valid');
		results.classList.remove('invalid');
		if (event.detail.valid) {
			results.innerHTML = 'OK';
			results.classList.add('valid');
		} else {
			var html = '';
			Array.prototype.forEach.call(event.detail.messages, function(message) {
				html += message + '<br />';
			});
			results.innerHTML = html;
			results.classList.add('invalid');
		}
	});


	// display input validation status
	form.addEventListener(validator.EVENT_VALIDATION, function(event) {
		var input = event.target ? event.target : event.srcElement,
			span = form.querySelector('[data-validation-info="' + input.name + '"]');
		if (span !== null) {
			span.classList.remove('valid');
			span.classList.remove('invalid');
			if (input.validity.valid) {
				span.classList.add('valid');
				span.title = '';
			} else {
				span.classList.add('invalid');
				span.title = input.validationMessage;
			}

		}
	});

});
