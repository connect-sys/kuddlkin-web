import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  IndianRupee 
} from 'lucide-react';
import { toast } from 'react-hot-toast';


// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

interface PaymentGatewayProps {
  bookingId: string;
  amount: number;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentFailure: (error: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  bookingId,
  amount,
  onPaymentSuccess,
  onPaymentFailure
}) => {
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      toast.error('Payment gateway failed to load');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const createPaymentOrder = async () => {
    try {
      const response = await fetch('https://kuddl-backend.princerajputana5.workers.dev/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          amount: amount * 100, // Convert to paise
          currency: 'INR'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to create payment order');
      }
    } catch (error) {
      console.error('Create payment order error:', error);
      throw error;
    }
  };

  const verifyPayment = async (paymentData: any) => {
    try {
      const response = await fetch('https://kuddl-backend.princerajputana5.workers.dev/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();
      
      if (data.success) {
        return data;
      } else {
        throw new Error(data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Verify payment error:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast.error('Payment gateway is still loading. Please try again.');
      return;
    }

    setLoading(true);

    try {
      // Create payment order
      const orderData = await createPaymentOrder();

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Kuddl',
        description: 'Service Booking Payment',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentOrderId: orderData.paymentOrderId
            };

            const verificationResult = await verifyPayment(verificationData);
            
            if (verificationResult.success) {
              toast.success('Payment successful!');
              onPaymentSuccess(response.razorpay_payment_id);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
            onPaymentFailure(error instanceof Error ? error.message : 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast.error('Payment cancelled');
            onPaymentFailure('Payment cancelled by user');
          }
        },
        prefill: {
          name: 'Customer',
          email: 'customer@kuddl.com',
          contact: '9999999999'
        },
        notes: {
          booking_id: bookingId
        },
        theme: {
          color: '#f97316' // Orange color matching Kuddl theme
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        toast.error('Payment failed: ' + response.error.description);
        onPaymentFailure(response.error.description);
        setLoading(false);
      });

      rzp.open();
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initiate payment');
      onPaymentFailure(error instanceof Error ? error.message : 'Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CreditCard className="w-6 h-6 text-orange-500" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Amount Display */}
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900">
            <IndianRupee className="w-6 h-6" />
            {amount.toFixed(2)}
          </div>
          <p className="text-sm text-gray-600 mt-1">Total Amount</p>
        </div>

        {/* Security Features */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Shield className="w-4 h-4" />
            <span>256-bit SSL Encryption</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>PCI DSS Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Shield className="w-4 h-4" />
            <span>100% Secure Payment</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Accepted Payment Methods:</p>
          <div className="flex flex-wrap gap-2">
            <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              Credit Card
            </div>
            <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              Debit Card
            </div>
            <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              Net Banking
            </div>
            <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              UPI
            </div>
            <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              Wallets
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={loading || !razorpayLoaded}
          className="w-full bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white font-semibold py-3 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : !razorpayLoaded ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading Payment Gateway...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Pay ₹{amount.toFixed(2)}
            </>
          )}
        </Button>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center">
          By proceeding with payment, you agree to our{' '}
          <a href="/terms" className="text-orange-600 hover:text-orange-700">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-orange-600 hover:text-orange-700">
            Privacy Policy
          </a>
        </p>

        {/* Powered by Razorpay */}
        <div className="text-center pt-2 border-t">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-semibold">Razorpay</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentGateway;
