function main(metadataService, dataService, cacheService, $q) {

	// Uncomment the "(ver 1.3.0)" lines to turn on the styled content
	
	// Business logic initialization event handlers
	var workspaceInitialization = function (appMetadata) {
		/* Workspace configuration */
		// The metadataService.configureWorkspace line configures the client-side business logic and styling for the workspace
		//  Uncomment the metadataService.configureWorkspace line to turn on the styled version
		// (ver 1.3.0) metadataService.configureWorkspace({design: handlers.getReservationWorkspaceDesign()});	               
		metadataService.hideNavigation(
			pageNames.CustomerRentals, 
			pageNames.ReservationDiscounts, 
			pageNames.DiscountDetails, 
			pageNames.ReservationCharges
		);
		
		/** Page configurations **/
		metadataService.configureControl(pageNames.ActiveReservations, controlNames.CustomerImage, { imageStyle: 'circular' });
		metadataService.configurePage(pageNames.ReservationDetails, { onDataLoaded: handlers.reservationDetailsLoaded });
		// The metadataService.configurePage line configures the client-side business logic and styling for the page
		//  Uncomment the metadataService.configurePage line to turn on the styled version
		// (ver 1.3.0) metadataService.configurePage('Reservation-details', {design: handlers.getReservationDetailsDesign()});			
		metadataService.configureControl(pageNames.AllCustomers, controlNames.CustomerRecId, { hidden: true });
		metadataService.configureControl(pageNames.AllCustomers, controlNames.CustomerImage, { imageStyle: 'circular' });
		metadataService.addLink(pageNames.CustomerDetails, pageNames.CustomerRentals, controlNames.CustomerRentals, 'Rentals', true);
		metadataService.configureControl(pageNames.CustomerDetails, controlNames.CustomerImage, { imageStyle: 'circular' });
		metadataService.configureControl(pageNames.AllVehicles, controlNames.VehicleRecId, { hidden: true });

		/** Action configurations **/
		// (With KB 3216943, these lookups are now configrued in static metadata. Configuration via business logic is optional) 
		// metadataService.configureLookup('Add-Reservation', 'FMRental_Customer', { lookupPage: 'All-Customers', valueField: 'FMCustomer_RecId', displayField: 'FMCustomer_FullName', showLookupPage: true });			
		// metadataService.configureLookup('Add-Reservation', 'FMRental_Vehicle', { lookupPage: 'All-Vehicles', valueField: 'FMVehicle_RecId', displayField: 'FMVehicle_FullDescription', showLookupPage: true });
		metadataService.configureAction(actionNames.ReservationEdit, {isIdempotent: true});
		metadataService.configureControl(actionNames.CustomerEdit, controlNames.CustomerCellPhone, { hidden: true });
		metadataService.configureControl(actionNames.CustomerEdit, controlNames.CustomerLicense, {extType: "Barcode"});
		metadataService.configureAction(actionNames.CustomerEdit, {isIdempotent: true});
		// (ver 1.3.0) metadataService.configureAction(actionNames.CustomerEdit, { onSubmit: validateEntity(entities.FMCustomer.entityName, actionNames.CustomerEdit) });
		metadataService.configureControl(actionNames.CustomerPhotoUpdate, controlNames.CustomerPhotoUpload, { boundField: entities.FMCustomer.Image.propertyName });
		metadataService.configureControl(actionNames.CustomerLicenseUpdate, controlNames.CustomerLicenseUpload, { boundField: entities.FMCustomer.LicenseImage.propertyName });
		// (ver 1.3.0) metadataService.configureAction(actionNames.CustomerNew, { onSubmit: validateEntity(entities.FMCustomer.entityName, actionNames.CustomerNew) });
		metadataService.configureAction(actionNames.CustomerNew, { onComplete: handlers.newCustomerClosed });
		metadataService.configureControl(actionNames.CustomerNew, controlNames.CustomerAddress2, { hidden: true });
		metadataService.configureControl(actionNames.CustomerNew, controlNames.CustomerLicense, {extType: "Barcode"});
		
		// Initialize all actions on Reservation Details to be hidden initially.
		metadataService.configureAction(actionNames.ReservationEdit, { hidden: true });
		metadataService.configureAction(actionNames.ReservationComplete, { hidden: true });
		metadataService.configureAction(actionNames.ReservationChargeAdd, { hidden: true });
		metadataService.configureAction(actionNames.ReservationDelete, { hidden: true });
		metadataService.configureAction(actionNames.ReservationStart, { hidden: true });
	};
	var pageInitialization = function (pageMetadata, context) {
		/** Page state-based configurations **/
		/* Reservation details */
		if (pageMetadata.Name === pageNames.ReservationDetails) {
			metadataService.configurePage(pageNames.ReservationDetails, { onDataLoaded: handlers.configureReservationDetails_RentalStatusBehavior });
		}
	};
	var actionInitialization = function (taskMetadata, context, taskData) {
		if (taskMetadata.Name === actionNames.ReservationNew) {
			taskData.setDefaultControlValue(controlNames.ReservationStartDate, new Date());
		}
		else if (taskMetadata.Name === actionNames.ReservationComplete) {
			handlers.configureCompleteRental_MileageBehavior(context, taskData);				
		}
	};    
	// Tables and fields:
	var entities = {
		// Storing entity and field names for the potion of the FM data model used by the business logic
		// This just makes it easy to reference the names while writing business logic
		// We hope to have a tool in future updates which can generate automatically from the mobile workspace metadata
		FMRental : {
			entityName : "FMRental",
			Comments : {propertyName: "Comments"},
			Customer : {propertyName: "Customer"},
			EndDate : {propertyName: "EndDate"},
			EndMileage : {propertyName: "EndMileage"},
			RecId : {propertyName: "RecId"},
			RentalId : {propertyName: "RentalId"},
			StartDate : {propertyName: "StartDate"},
			State : {propertyName: "State"},
			Vehicle : {propertyName: "Vehicle"},
			VehicleRatePerday : {propertyName: "VehicleRatePerday"},
			VehicleRatePerWeek : {propertyName: "VehicleRatePerWeek"},
			VehicleRateTotal : {propertyName: "VehicleRateTotal"}
		},
		FMCustomer : {
			entityName : "FMCustomer",
			CellPhone : {propertyName: "CellPhone"},
			DriverLicense : {propertyName: "DriverLicense"},
			Email : {propertyName: "Email"},
			FirstName : {propertyName: "FirstName"},
			LastName : {propertyName: "LastName"},
			Image: {propertyName: "Image"},
			LicenseImage : {propertyName: "LicenseImage"}
		},
		FMVehicle : {
			entityName : "FMVehicle",
			Description : {propertyName: "Description"},
			Mileage : {propertyName: "Mileage"},
			MPG : {propertyName: "MPG"},
			Status : {propertyName: "Status"},
			VehicleId : {propertyName: "VehicleId"},
			VehicleModel : {propertyName: "VehicleModel"},
			VIN : {propertyName: "VIN"}
		},
		FMVehicleModel : {
			entityName : "FMVehicleModel",
			Image : {propertyName: "Image"},
		},
		FMRentalCharge : {
			ChargeType : {propertyName: "ChargeType"},
			DefaultDescription : {propertyName: "DefaultDescription"},
			ExtendedAmount : {propertyName: "ExtendedAmount"},
			PerUnitAmount : {propertyName: "PerUnitAmount"},
			Quantity : {propertyName: "Quantity"},
			RentalId : {propertyName: "RentalId"}
		}
	};
	// Pages:
	var pageNames = {
		AllReservations: "All-Reservations",
		ReservationDetails: "Reservation-details",
		AllCustomers: "All-Customers",
		CustomerDetails: "Customer-details",
		CustomerRentals: "Customer-rentals",
		AllVehicles: "All-Vehicles",
		ActiveReservations:  "All-Active-Reservations",
		ReservationDiscounts: "Reservation-discounts",
		DiscountDetails: "Discount-details",
		ReservationCharges:"Rental-charges",
	};
	// Actions:
	var actionNames = {
		ReservationNew: "Add-Reservation",
		ReservationComplete: "Complete-rental",
		ReservationStart: "Start-rental",
		ReservationEdit: "Edit-Reservation",
		ReservationDelete: "Delete-reservation",
		ReservationChargeAdd: "Add-charge",
		CustomerEdit: "Update-Customer-Details",
		CustomerPhotoUpdate:  "Update-picture",
		CustomerLicenseUpdate:  "Update-license-picture",
		CustomerNew: "New-customer",
		CustomerDelete: "Delete-Customer-1",
	};
	// Controls:
	var controlNames = {
		ReservationList: "RentalsGrid",
		ReservationId: "FMRental_RentalId",
		ReservationStartDate: "FMRental_StartDate",
		ReservationEndDate: "FMRental_EndDate",
		ReservationState: "FMRental_State",
		CustomerList: "FMCustomers",
		CustomerRecId: "FMCustomer_RecId",
		CustomerFirstName: "FMCustomer_FirstName",
		CustomerLastName: "FMCustomer_LastName",
		CustomerFullName: "FMCustomer_FullName",
		CustomerCellPhone: "FMCustomer_CellPhone",
		CustomerEmail: "FMCustomer_Email",	
		CustomerAddress1: "FMAddressTable_AddressLine1Copy2",
		CustomerAddress2: "FMAddressTable_AddressLine2Copy2",
		CustomerLicense: "FMCustomer_DriverLicense",
		CustomerImage: "FMCustomer_Image",
		CustomerPhotoUpload: "FMCustomer_UploadPhoto",
		CustomerLicenseUpload: "FMCustomer_UploadLicense",
		CustomerRentals: "FMCustomer_RentalsNavigation",
		VehicleList: "FMVehicles",
		VehicleRecId: "FMVehicle_RecId",
		VehicleImage: "FMVehicleModel_Image",
		VehicleDescription: "FMVehicle_FullDescription",
		VehicleVIN: "FMVehicle_VIN",
		VehicleMileage: "FMVehicle_Mileage",
		VehicleRatePerDay: "FMRental_VehicleRatePerDay",
		VehicleRateTotal: "FMRental_VehicleRateTotal",
		ReservationChargeList: "FMRentalCharge",
		ReservationChargeDescription: "FMRentalCharge_Description",
		ReservationChargeType: "FMRentalCharge_ChargeType",
		ReservationChargePerUnitAmount: "FMRentalCharge_PerUnitAmount",
		ReservationChargeQuantity: "FMRentalCharge_Quantity",
		ReservationTotal: "FMRentalCharge_Quantity",
	};
	// Entity data change handlers
	var validateEntity = function(entityName, actionName){

		if(entityName == entities.FMCustomer.entityName){
			// Determine which fields to validate based on the action used to change the data			
			var validateFirst, validateLast, validatePhone, validateEmail, validateLicense;
			if(actionName == actionNames.CustomerNew){
				validateFirst = validateLast = validatePhone = validateEmail = validateLicense = true;
			}
			else if(actionName == actionNames.CustomerEdit){
				validateLicense = validateEmail = true;
			}
			// Return the onSubmit handler
			return function (dataWrapper, submitArgs){
				var first = dataWrapper.getControlValue(controlNames.CustomerFirstName);
				var last = dataWrapper.getControlValue(controlNames.CustomerLastName);
				var license = dataWrapper.getControlValue(controlNames.CustomerLicense);
				var phone = dataWrapper.getControlValue(controlNames.CustomerCellPhone);
				var email = dataWrapper.getControlValue(controlNames.CustomerEmail);			

				// Check to see if control exists, and if so, valiate that it is not empty
				if(validateFirst && !first){
					submitArgs.addMessage("A first name must be provided for the customer.", messageCode.error);
					submitArgs.cancel();
				}
				if(validateLast && !last){
					submitArgs.addMessage("A last name must be provided for the customer.", messageCode.error);
					submitArgs.cancel();
				}
				if(validateLicense && !license){
					submitArgs.addMessage("A driver's license number must be provided for the customer.", messageCode.error);
					submitArgs.cancel();
				}
				if((validatePhone && !phone) && (validateEmail && !email)){
					submitArgs.addMessage("You must provide either a phone number or email address for the customer.", messageCode.error);
					submitArgs.cancel();
				}
				else {
					if(validatePhone && phone){
						!validateField.phone(phone, submitArgs) && submitArgs.cancel();
					}
					if(validateEmail && email){					
						if(validateField.email(email, submitArgs)){
							// Perform first-chance check against local data to see if the email is already in use
							// This check may pass during onSubmit, but server may fail the check when it compares against the wider data set 
							/* dataService.findEntityData API requires version 1.3.0 
							var customer = dataService.findEntityData(names.FMCustomer.entityName, names.FMCustomer.Email.propertyName, email, true);
							if(customer != null && customer.getPropertyValue(names.FMCustomer.Email.propertyName) == email){
								submitArgs.addMessage("This email address is in use by another customer. Please provide a different email address.");
								submitArgs.cancel();
							}
							*/		
						}
						else {
							submitArgs.cancel();
						}
					};
				};
			}
		}
	};
	// Business logic event handlers
	var handlers = {
		// Design for Reservation details page
		getReservationDetailsDesign: function () { 
			return {
				// Page root container
				"flexFlow":"column nowrap",
				"items":[
					// Upper third of page, contains 4 rows
					{
						"flexFlow":"column nowrap",
						"background":"theme",
						"color":"light",
						"fontSize":"small",
						"border": "none",
						"padding":"small",
						"items":[
							// Row 1/4 with customer image and name
							{
								"flexFlow":"row nowrap",
								"alignItems":"center",
								"justifyItems":"center",
								"labelStyle":"hidden",
								"fontSize":"large",
								"fontWeight":"bold",
								"items":[
									{
										// Customer image
										"name":"FMCustomer_Image",
										"imageStyle":"circular",
										height:3,
										width:3
									},
									{
										// Customer name
										name: "FMCustomer_FullName",
										padding: "none"
									}
								]
							},
							// Row 2/4 with vehicle description
							{
								"justifyItems":"center",
								"items":[
									{
										"name":"FMVehicle_FullDescription",
										"fontSize":"medium",
										"labelStyle":"hidden"
									}
								]
							},
							// Row 3/4 with reservation's detail fields
							{
								"flexFlow":"row nowrap",
								"labelStyle":"inline",
								"items":[
									{
										// Column 1
										"flexSize":"1",
										"flexFlow":"column nowrap",
										"alignItems":"flex-start",
										"items":[
											{
												// Status
												"name":"FMRental_State",
												"label":"Status"
											},
											// Start date
											"FMRental_StartDate",
										]
									},
									{
										// Column 2
										"flexSize":"1",
										"flexFlow":"column nowrap",
										"alignItems":"flex-end",
										"items":[
											{
												// Rental Id
												"name":"FMRental_RentalId",
												"label":"Id"
											},
											// Dnd date
											"FMRental_EndDate"
										]
									}
								]
							},
							{
								// Row 4/4 with the actions
								"flexFlow":"row nowrap",
								"justifyItems": "space-around",
								"fontSize":"small",
								"items":
								[
									{
										"type":"Navigation",
										label: "Complete",
										style: "button",
										icon: "checkmark",
										"background": "lightGreen",
										target:"Complete-rental",
									},
									{
										"type":"Navigation",
										label: "Delete",
										style: "button",
										icon: "trash-b",
										"background": "negative",
										target:"Delete-reservation",
									},
									{
										"type":"Navigation",
										label: "Edit",
										style: "button",
										icon: "edit",
										"background": "neutral",
										target:"Edit-Reservation",
									}
								]
							}
						]
					},
					{
						// Middle thrid of page, contains list
						"flexSize":"1",
						"fontWeight":"bold",
						"allowScroll": true,
						"items":[
							{
								// List with rental charges
								"name":"FMRentalCharge",
								"alignItems":"stretch",
								"itemBorder": true,
								"color":"theme",
								"design":{
									// Override of default list design
									"flexFlow":"row nowrap",
									"justifyItems":"space-between",
									"labelStyle":"hidden",
									border: "none",
									"items":[
										"FMRentalCharge_ChargeType",
										{
											name:"FMRentalCharge_PerUnitAmount",
											"fontWeight":"normal",
										}
									]
								}
							}
						]
					},
					{
						// Navigation to action for adding charge lines - floating under the scrollable lines list
						"type":"Navigation",
						label: "Add charge",
						"icon":"plus",
						target:"Add-charge",
						"fontWeight":"bold",
					},
					{
						// Lower third of page
						"flexFlow":"row nowrap",
						border:"solid",
						labelStyle:"inline",
						"fontWeight": "normal",
						items:[
							{
								// Total of vehicle rate for reservation period
								name:"FMRental_VehicleRateTotal",
								label:"Vehicle",
								"flexSize":"1"
							},
							{
								// Total of vehicle rate and retal charges
								name:"CalculatedTotal",
								label:"Sub-total",
								"flexSize":"1"
							}
						]
					}

				]
			}
		},
		// Design for Reservation Management workspace
		getReservationWorkspaceDesign: function () { 
			return {
				flexFlow:"column nowrap",
				items: [
					// uppper half, black bg, content height - show tiles to pages
					{
						"flexFlow":"row nowrap",
						"background":"dark",
						"color":"light",
						"fontSize":"large",
						"border": "none",
						"justifyItems": "space-around",
						"items":
						[
							{
								"type":"Navigation",
								label: "Customers",
								style: "button",
								showCount: true,
								target:"All-Customers",
								excludeContext: true,
							},
							{
								"type":"Navigation",
								label: "Reservations",
								style: "button",
								showCount: true,
								target:"All-Reservations",
								excludeContext: true,
							},
							{
								"type":"Navigation",
								label: "Vehicles",
								style: "button",
								showCount: true,
								target:"All-Vehicles",
								excludeContext: true,
							}
						]
					},
					// lower half - grow or shrink
					{
						"flexSize":"1",
						"allowScroll": true,
						items:
						[
							// Part to include all active reservationa
							{
								"type":"Part",
								target: "All-Active-Reservations",
								design:
								{
									// page
									"flexFlow":"column nowrap",
									"items":
									[
										{
											"name":"RentalsGrid",
											"flexSize":"1",
											"hideSearchBar": true,
											"itemBorder": true,
											"padding":"small",
											"design":
											{
												"flexFlow":"column nowrap",
												"justifyItems": "flex-start",
												"border":"none",
												"items":
												[
													// name and total
													{
														"flexFlow":"row nowrap",
														"flexSize":"0",
														"justifyItems":"space-between",
														"labelStyle":"hidden",
														"items":
														[
															"FMCustomer_FullName",
															"FMRental_VehicleRateTotal"
														]
													},
													// image and vehicle
													{
														"flexFlow":"row nowrap",
														"flexSize":"0",
														"justifyItems":"flex-start",
														"alignItems":"center",
														"labelStyle":"hidden",
														"fontWeight":"700",
														"items":
														[
															{
																"name":"FMCustomer_Image",
																"imageStyle":"circular",
																height:3,
																width:3,
															},
															{
																"name": "FMVehicle_FullDescription",
																"fontWeight":"100",
															}
														]
													},
													// dates
													{
														"flexFlow":"row nowrap",
														"flexSize":"0",
														"justifyItems":"space-between",
														"labelStyle":"inline",
														"items":
														[
															"FMRental_StartDate",
															"FMRental_EndDate"
														]
													}
												]
											}
										}
									]
								}
							}
						],
					},
					// Bottom part fixed - show link to create reservation
					{
						"type":"Navigation",
						icon: "plus",
						label: "Create reservation",
						target:"Add-Reservation",
					},
				],
			}
		},
		// Handler for Reservation Details action data loaded
		reservationDetailsLoaded: function (pageInstance, dataWrapper) {
			var vin = dataWrapper.getControlValue(controlNames.VehicleVIN);
			var vehicleDes = dataWrapper.getControlValue(controlNames.VehicleDescription);
			if (vin) {
				dataWrapper.setControlValue(controlNames.VehicleDescription, vehicleDes + "--" + vin);
			};
		},	
		// Handler for New customer action closing
		newCustomerClosed: function(navigation) {
			navigation.params.pageId = metadataService.findPage("Customer-details").Id;
		},		
		// Update the visibility of Actions on the Reservation details Page based on the state of the Reservation
		configureReservationDetails_RentalStatusBehavior: function (pageInstance, dataWrapper) {
			var rentalState = dataWrapper.getControlValue(controlNames.ReservationState);
			if (rentalState === "1" || rentalState == "0" /*Ready for pickup or New*/) {
				pageInstance.getAction(actionNames.ReservationDelete).hidden = false;
				pageInstance.getAction(actionNames.ReservationEdit).hidden = false;
				pageInstance.getAction(actionNames.ReservationChargeAdd).hidden = false;
				pageInstance.getAction(actionNames.ReservationStart).hidden = false;
			}
			else if (rentalState === "2" /*In progress*/) {
				pageInstance.getAction(actionNames.ReservationComplete).hidden = false;
			}
			else if (rentalState === "3" /*Complete*/) {
				pageInstance.getAction(actionNames.ReservationDelete).hidden = false;
			}
		},
		// Set the default value on the mileage field, based on the previous mileage
		configureCompleteRental_MileageBehavior: function (context, taskData){
			if (context.pageContext) {
				var entityType, entityId = context.pageContext.split(':');
				if (contextParts && contextParts.length === 2) {

					var entityType = contextParts[0];
					var entityId = contextParts[1];
					if (entityType && entityId) {
						
						var entityDataWrapper = dataService.getEntityData(entityType, entityId);
						if (entityDataWrapper) {
							
							var vehicleMileage = entityDataWrapper.getPropertyValue('FMVehicle/Mileage');
							if (vehicleMileage && vehicleMileage.$ref) {
								taskData.setDefaultControlValue('FMRental_EndMileage', parseInt(vehicleMileage.value) + 1);
							}
						}
					}
				}
			}
		},
	};	
	// Helpers for validating data types
	var validateField = {
		email: function(email, submitArgs){
			var emailRegEx = /^[a-zA-Z][\.\w]*@\w[-\.\w]*\w\.[a-z]*/;
			if(!emailRegEx.exec(email)){
				submitArgs.addMessage("Please enter a valid email address.", messageCode.error);
				return false;
			}	
			return true;
		},
		phone: function(phone, submitArgs){		
			var phoneRegEx = /^\({0,1}\d{3}\){0,1}(-|\s){0,1}\d{3}(-|\s){0,1}\d{4}$/;
			if(!phoneRegEx.exec(phone)){
				submitArgs.addMessage("Please enter a 10-digit phone number in the format (###) ###-#### or ##########.", messageCode.error);
				return false;				
			}
			return true;
		}
	};

	var messageCode = {error: 1};

	return {
        appInit: workspaceInitialization,
		pageInit: pageInitialization,
		taskInit: actionInitialization
	};
}
