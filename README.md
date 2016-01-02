# Form validator

Simple client side form validation based on Javascript Validation API
(https://html.spec.whatwg.org/multipage/forms.html#client-side-form-validation).
Allows validation form on submit and validation field on change.
Partially mimics validation properties on MSIE 9,10.
Contains additional validations rules for validation email

## Instalation  and  customization

See examples in folder demo.
Validation messages can be set as title attribute of each form field.
Form validator do not add any content to page, just distpatch events about validation. These events can be used for
displaieng messages to user.

```php
var form = document.querySelector('form'),
	validator = new FormValidator(form, true);

// validation on submit
form.addEventListener(validator.EVENT_FORM_VALIDATION, function(event) {
	if (event.detail.valid) {
		//
	} else {
		// event.detail.messages contains array of messages from all invalid fields
	}
});

// validation on field change
form.addEventListener(validator.EVENT_VALIDATION, function(event) {
	var input = event.target ? event.target : event.srcElement;
	// input.validity.valid contains validation status (boolean)
	// input.validationMessage contains validation message;
});
```

## Known issues
Do not work in MSIE 8 or older.

## License

Released under the WTFPL license, http://www.wtfpl.net/about/.



