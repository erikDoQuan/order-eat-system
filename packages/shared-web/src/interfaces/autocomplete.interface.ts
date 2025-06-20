/*
 * @Author: <Tin Tran> (tindl88@gmail.com)
 * @Created: 2025-01-01 15:35:56
 */

// Ref: https://www.w3schools.com/tags/att_input_autocomplete.asp

export type AutocompleteTypes =
  // Default values
  | 'on' // Enable browser's autocomplete functionality
  | 'off' // Disable browser's autocomplete functionality

  // Personal information fields
  | 'name' // Full name
  | 'honorific-prefix' // Title or prefix (e.g., "Mr.", "Mrs.", "Dr.")
  | 'given-name' // First name
  | 'additional-name' // Middle name
  | 'family-name' // Last name
  | 'honorific-suffix' // Suffix (e.g., "Jr.", "Sr.", "III")
  | 'nickname' // Nickname or preferred name

  // Credentials fields
  | 'username' // Username for an account
  | 'new-password' // New password - prevents password managers from auto-filling
  | 'current-password' // Current password - allows password managers to auto-fill
  | 'one-time-code' // One-time verification code

  // Contact information fields
  | 'organization-title' // Job title
  | 'organization' // Company or organization name
  | 'street-address' // Full street address
  | 'address-line1' // Address line 1
  | 'address-line2' // Address line 2
  | 'address-line3' // Address line 3
  | 'address-level4' // Finest level administrative division (e.g., neighborhood)
  | 'address-level3' // Third administrative level (e.g., suburb)
  | 'address-level2' // Second administrative level (e.g., city)
  | 'address-level1' // First administrative level (e.g., state or province)
  | 'country' // Country code
  | 'country-name' // Country name
  | 'postal-code' // Postal or ZIP code

  // Contact methods
  | 'email' // Email address
  | 'tel' // Full telephone number
  | 'tel-country-code' // Country code part of telephone
  | 'tel-national' // National number part of telephone
  | 'tel-area-code' // Area code part of telephone
  | 'tel-local' // Local number part of telephone

  // Payment information
  | 'cc-name' // Full name as shown on credit card
  | 'cc-given-name' // First name as shown on credit card
  | 'cc-additional-name' // Middle name as shown on credit card
  | 'cc-family-name' // Last name as shown on credit card
  | 'cc-number' // Credit card number
  | 'cc-exp' // Credit card expiration date
  | 'cc-exp-month' // Month of credit card expiration
  | 'cc-exp-year' // Year of credit card expiration
  | 'cc-csc' // Credit card security code
  | 'cc-type' // Credit card type

  // Date fields
  | 'bday' // Full birthday date
  | 'bday-day' // Day of birthday
  | 'bday-month' // Month of birthday
  | 'bday-year' // Year of birthday

  // Other fields
  | 'sex' // Gender identity
  | 'url' // URL / Website address
  | 'photo'; // Photo URL
