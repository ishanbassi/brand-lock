import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-payment',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  standalone: true,
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {
  public amount: number = 0;
  public orderId: string = '';
  // Razorpay options
  options: any = {
    key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay key
    amount: 0, // Amount in paise
    currency: 'INR',
    name: 'Brand Lock',
    description: 'Trademark Payment',
    image: '',
    order_id: '', // Order ID from backend
    handler: (response: any) => {
      this.onPaymentSuccess(response);
    },
    prefill: {
      name: '',
      email: '',
      contact: ''
    },
    notes: {},
    theme: {
      color: '#3399cc'
    }
  };

  // Call this to start payment
  payWithRazorpay(orderId: string, amount: number) {
    this.options.order_id = orderId;
    this.options.amount = amount * 100; // Convert to paise
    const rzp = new (window as any).Razorpay(this.options);
    rzp.on('payment.failed', (response: any) => {
      this.onPaymentFailure(response);
    });
    rzp.open();
  }

  onPaymentSuccess(response: any) {
    // Handle payment success (send details to backend, show message, etc.)
    alert('Payment Successful! Payment ID: ' + response.razorpay_payment_id);
  }

  onPaymentFailure(response: any) {
    // Handle payment failure
    alert('Payment Failed!');
  }
}
