import { Component, Injectable, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidator, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { delay, Observable, of } from 'rxjs';


@Injectable({providedIn: 'root'})
export class AsyncRandomlyRejectValidator implements AsyncValidator {
  constructor() {}
  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return of(Math.random() > .5 ? {rejected : true} : null).pipe(delay(1000))
  }
}


export function antiRileyValidator(control: AbstractControl): ValidationErrors | null {
  const firstName = control.get('firstName');
  const fn = firstName?.value?.toLowerCase();
  const lastName = control.get('lastName');
  const ln = lastName?.value?.toLowerCase()
  console.log(fn, ln)
  return fn == "riley" && ln == "clark" ? { riley : true} : null;
};

@Component({
  selector: 'app-payment-page',
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.css']
})
export class PaymentPageComponent {

  
  constructor(
    private formBuilder: FormBuilder,
    private asyncRandomlyRejectValidator: AsyncRandomlyRejectValidator,
  ){

  }

  public paymentForm = this.formBuilder.group({
    firstName : ['' , [Validators.required, Validators.maxLength(5)]],
    lastName : ['', Validators.required],
    address : this.formBuilder.group({
      streetAddress: ['', Validators.required],
      streetAddressC: [''],
      city: ['', Validators.required],
      state: ['', [Validators.required, Validators.pattern(/CA|WA/)]],
      country: ['', [Validators.required, Validators.pattern(/USA|US|United States/i)]],
      zipcode: ['', Validators.required],
    }),
    card: this.formBuilder.group({
      cardNumber: ['', {validators: [Validators.required], asyncValidators: [this.asyncRandomlyRejectValidator.validate.bind(this.asyncRandomlyRejectValidator)]}],
      expiration: ['', Validators.required],
      cvv: ['', Validators.required],
      cardzip: ['', Validators.required],
      cardcountry: ['', Validators.required],
    })
  }, {validators: [antiRileyValidator]})

  isFirstNameInvalid(): boolean{
    const firstNameControl = this.paymentForm?.get('firstName');

    return !(firstNameControl == null) && firstNameControl.invalid && (firstNameControl.dirty || firstNameControl.touched)
  }

  isFirstNameEmpty(): boolean{
    const firstNameControl = this.paymentForm?.get('firstName');
    if(!firstNameControl){
      return false;
    }
    return firstNameControl.hasError('required')
  }

  isFirstNameLengthIncorrect(): boolean{
    const firstNameControl = this.paymentForm?.get('firstName');
    if(!firstNameControl){
      return false;
    }
    return firstNameControl.hasError('maxlength')
  }

  isRiley(): boolean{
    return this.paymentForm.hasError("riley");
  }

  isCardRandomlyRejected() {
    return this.paymentForm.get("card")?.get("cardNumber")?.hasError("rejected");
  }

}