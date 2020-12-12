const generateID = require("../generateID.js");

/**
 * Base class for all widgets
 * @type {Input}
 */
L.ALS.Widgets.BaseWidget = L.Class.extend({
	/**
	 * Constructs this widget.
	 * @param type {string} Type of input
	 * @param id {string} ID of this input. You can select this object using this ID.
	 * @param label {string} Label for this input
	 * @param objectToControl {object} Just pass "this".
	 * @param callback {string} Name of a method of your object that will be called when widget's value changes
	 * @param events {string[]} Array containing event's names to bind to the provided callback
	 * @param attributes {object} Attributes of an input, such as min, max, etc in format `{attributeName1: attributeValue1, attributeName2: attributeValue2, ...}`
	 */
	initialize: function (type, id, label, objectToControl = undefined, callback = "", events = [], attributes = {}) {
		this.objectToControl = objectToControl;
		this.events = events;
		this._inputID = "adv-lyr_sys_input" + generateID();

		this.type = type;
		this.id = id;
		this.label = label;
		this.callback = callback;
		this.attributes = attributes;
		this.value = "";
		this.container = this.toHtmlElement();
	},

	/**
	 * Builds this widget, i.e. creates container and puts label and input here.
	 *
	 * Default implementation is:
	 * ```JavaScript
	 * let container = this.createContainer();
	 * container.appendChild(this.createLabel());
	 * container.appendChild(this._createInput());
	 * return container;
	 * ```
	 *
	 * @return {HTMLDivElement} HTML representation of this widget
	 */
	toHtmlElement: function () {
		let container = this.createContainer();
		container.appendChild(this.createLabel());
		container.appendChild(this._createInput());
		return container;
	},

	/**
	 * Creates container for this widget
	 * @return {HTMLDivElement} Container for this widget
	 */
	createContainer: function () {
		let container = document.createElement("div");
		container.className = "adv-lyr-sys-widget-row";
		return container;
	},

	/**
	 * Creates label for this widget
	 * @return {HTMLLabelElement} Label
	 */
	createLabel: function () {
		this.labelWidget = document.createElement("label");
		this.labelWidget.className = "adv-lyr-sys-label";
		this.labelWidget.htmlFor = this._inputID;
		this.setLabelText(this.label);
		return this.labelWidget;
	},

	/**
	 * Creates input element. You can also create non-input elements here.
	 * @return {HTMLElement}
	 */
	createInputElement: function () {
		let input = document.createElement("input");
		input.setAttribute("type", this.type);
		return input;
	},

	/**
	 * Creates input element. If you're creating different element, override createInputElement() instead of this.
	 * @return {HTMLElement} Input element
	 * @protected
	 */
	_createInput: function () {
		this.input = this.createInputElement();
		this.input.id = this._inputID;
		this.input.setAttribute("data-id", this.id);

		for (let event of this.events)
			this.input.addEventListener(event, (event) => {
				if (!this.onChange(event))
					this.input.classList.add("invalid-input");
				else
					this.input.classList.remove("invalid-input");

				if (this.objectToControl !== undefined && this.callback !== "")
					this.objectToControl[this.callback](this);
			});

		this.setAttributes(this.attributes);

		let value;
		if (this.value !== "")
			value = this.value;
		else if (this.attributes.value !== undefined)
			value = this.attributes.value;

		this.input.value = value;
		return this.input;
	},

	/**
	 * Sets attributes of an input, such as min, max, etc in format `{attributeName1: attributeValue1, attributeName2: attributeValue2, ...}`
	 * @param attributes Object containing attributes
	 */
	setAttributes: function (attributes) {
		for (let attr in attributes) {
			if (attributes.hasOwnProperty(attr))
				this.input.setAttribute(attr, attributes[attr]);
		}
	},

	/**
	 * Being called when user changes this widget. Override it to add your functionality like validation.
	 *
	 * Default implementation just returns true.
	 *
	 * @param event Event fired by input
	 * @return {boolean} If true, the attached callback will be called. If false, attached callback won't be called.
	 */
	onChange: function (event) {
		return true;
	},

	getId: function () {
		return this.id;
	},

	getValue: function () {
		return this.input.value;
	},

	setValue: function (value) {
		this.input.value = value;
	},

	setEnabled: function (isEnabled) {
		this.input.disabled = !isEnabled;
	},

	getEnabled: function () {
		return (this.input.disabled !== "true");
	},

	getContainer: function () {
		return this.container;
	},

	getLabelText: function () {
		if (this.label !== undefined)
			return this.labelWidget.innerText.slice(0, this.labelWidget.innerText.length - 2);
	},

	setLabelText: function (text) {
		this.labelWidget.innerText = text + ":";
	},

	serialize: function () {
		return {
			type: this.type,
			id: this.id,
			label: this.label,
			callback: this.callback,
			attributes: this.attributes,
			value: this.value,
		}
	},

	deserialize: function (serializedObject, objectToControl) {
		for (let attr in serializedObject)
			if (serializedObject.hasOwnProperty(attr))
				this[attr] = serializedObject[attr];
	}

});