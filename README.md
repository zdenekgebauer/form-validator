# Form validator

Simple client side form validation based on Javascript Validation API
(https://html.spec.whatwg.org/multipage/forms.html#client-side-form-validation).
Allows validation form on submit and validation field on change.
Partially mimics validation properties on MSIE 9,10.
Contains additional validations rules for validation email

## Installation  and  customization

See examples in folder demo.
Validation messages can be set as title attribute of each form field.
Form validator do not add any content to page, just dispatch events about validation. These events can be used for
displaying messages to user.

```javascript
var form = document.querySelector('form'),
	validator = new FormValidator(form, true);
// second parametr as true: "validate each input on change", false: "validate on form submit only" 	

// validation on submit form
form.addEventListener(validator.EVENT_FORM_VALIDATION, function(event) {
	if (event.detail.valid) {
		// form is OK
	} else {
		// event.detail.messages contains array of messages from all invalid fields
	}
});

// validation on field change
form.addEventListener(validator.EVENT_VALIDATION, function(event) {
	var input = event.target ? event.target : event.srcElement;	
	// input.validity.valid contains validation status (boolean)
	// input.validationMessage contains validation message;
	if (input.validity.valid) {
		// input is valid
	} else {
	    // alert (input.validationMessage);	
	} 
});
```

## Predefined validation rules
Attribute data-validation-rule is simple replacement of pattern attribute. Form validator contains rules for phone and email:
```html
<input data-validation-rule="email" />
<input data-validation-rule="phone" />
```
More rules can added in method regexpByRule.

## Known issues
Do not work in MSIE 8 or older.

## License
Released under the WTFPL license, http://www.wtfpl.net/about/.
