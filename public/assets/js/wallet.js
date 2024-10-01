
// add funds to wallet----------------------------------------------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('addFundsForm').addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent the form from submitting

        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());

        console.log('Form Data:', data); // Log the converted form data

        try {
            const response = await fetch('/profile/add-funds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            console.log('Result:', result);

            if (result.success) {
                const options = {
                    key: result.keyId,
                    amount: data.amount * 100, // amount in paise
                    currency: 'INR',
                    name: 'AMian',
                    description: 'Add Funds',
                    order_id: result.orderId,
                    handler: async function (response) {
                        console.log("Razorpay response:", response);

                        const verifyResponse = await fetch('/profile/verify-payment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                orderId: result.orderId,
                                paymentId: response.razorpay_payment_id,
                                signature: response.razorpay_signature,
                                amount: data.amount, // Pass the amount here
                                // userId: '<%= user._id %>'
                            }),
                        });

                        const verifyResult = await verifyResponse.json();

                        if (verifyResult.success) {
                            window.location.href = "/profile"; // Redirect to profile or another page
                        } else {
                            alert('Payment verification failed');
                        }
                    },
                    prefill: {
                        name: '<%= user.name %>', // Populate with user's name or other details
                        email: '<%= user.email %>',
                    },
                    theme: {
                        color: '#3399cc',
                    },
                };

                console.log('Razorpay options:', options); // Log the options object

                const razorpay = new Razorpay(options);
                console.log("Razorpay instance created:", razorpay);

                razorpay.open();
            } else {
                alert('Failed to create order');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to initiate payment');
        }
    });
});
//for returning product------------------------------------------------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    // Select all return forms on the page
    const returnForms = document.querySelectorAll('[id^="returnForm-"]');

    returnForms.forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission

            const orderId = this.getAttribute('id').split('-')[1];

            Swal.fire({
                title: 'Are you sure?',
                text: "Do you want to return this product?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, return it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Send the return request via fetch
                    fetch(`/order/${orderId}/return`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire(
                                'Returned!',
                                data.message,
                                'success'
                            ).then(() => {
                                location.reload(); // Reload the page to update the status
                            });
                        } else {
                            Swal.fire(
                                'Error!',
                                data.message,
                                'error'
                            );
                        }
                    })
                    .catch(error => {
                        console.error('Return order error:', error);
                        Swal.fire(
                            'Error!',
                            'Something went wrong. Please try again later.',
                            'error'
                        );
                    });
                }
            });
        });
    });
});
// document.addEventListener('DOMContentLoaded', () => {
//     const retryForms = document.querySelectorAll('.retryPaymentForm'); // Use class selector
//     console.log(retryForms)

//     retryForms.forEach(form => {
//         form.addEventListener('submit', async function (e) {
//             e.preventDefault(); // Prevent the default form submission

//             const orderId = form.dataset.orderId; // Get order ID from data attribute
//             console.log(orderId)

//             try {
//                 // Send a PUT request to retry payment
//                 const response = await fetch(`/order/${orderId}/retry-payment`, {
//                     method: 'PUT',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                 });

//                 const result = await response.json();

//                 if (result.success) {
//                     // Trigger Razorpay payment modal
//                     const options = {
//                         "key": result.razorpayKey, // Razorpay API key
//                         "amount": result.amount, // Payment amount in paise
//                         "currency": "INR",
//                         "name": "AMian",
//                         "description": "Order Payment",
//                         "order_id": result.orderId, // Razorpay order ID
//                         "handler": function (response) {
//                             // Handle successful payment
//                             fetch(`/order/${orderId}/verify-payment`, {
//                                 method: 'POST',
//                                 headers: { 'Content-Type': 'application/json' },
//                                 body: JSON.stringify({
//                                     paymentId: response.razorpay_payment_id,
//                                     orderId: response.razorpay_order_id,
//                                     signature: response.razorpay_signature
//                                 })
//                             })
//                             .then(res => res.json())
//                             .then(data => {
//                                 if (data.success) {
//                                     Swal.fire({
//                                         title: 'Success',
//                                         text: 'Payment successful!',
//                                         icon: 'success',
//                                         confirmButtonText: 'OK',
//                                     }).then(() => {
//                                         window.location.reload();
//                                     });
//                                 } else {
//                                     Swal.fire({
//                                         title: 'Error',
//                                         text: 'Payment verification failed.',
//                                         icon: 'error',
//                                         confirmButtonText: 'OK',
//                                     });
//                                 }
//                             });
//                         },
//                         "theme": { "color": "#F37254" }
//                     };

//                     const rzp = new Razorpay(options);
//                     rzp.open();
//                 } else {
//                     Swal.fire({
//                         title: 'Error',
//                         text: 'Failed to create Razorpay order. Please try again.',
//                         icon: 'error',
//                         confirmButtonText: 'OK',
//                     });
//                 }
//             } catch (error) {
//                 console.error('Error retrying payment:', error);
//                 Swal.fire({
//                     title: 'Error',
//                     text: 'Something went wrong. Please try again later.',
//                     icon: 'error',
//                     confirmButtonText: 'OK',
//                 });
//             }
//         });
//     });
// });
document.addEventListener('DOMContentLoaded', () => {
    const retryForms = document.querySelectorAll('.complete-payment-btn'); // Updated class selector
    console.log(retryForms);

    retryForms.forEach(button => {
        button.addEventListener('click', async function (e) {
            e.preventDefault(); // Prevent the default form submission

            const orderId = button.closest('form').dataset.orderId; // Get order ID from data attribute
            console.log(orderId);

            try {
                // Send a PUT request to retry payment
                const response = await fetch(`/order/${orderId}/retry-payment`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const result = await response.json();

                if (result.success) {
                    // Trigger Razorpay payment modal
                    const options = {
                        "key": result.razorpayKey, // Razorpay API key
                        "amount": result.amount, // Payment amount in paise
                        "currency": "INR",
                        "name": "AMian",
                        "description": "Order Payment",
                        "order_id": result.orderId, // Razorpay order ID
                        "handler": function (response) {
                            // Handle successful payment
                            fetch(`/order/${orderId}/verify-payment`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    paymentId: response.razorpay_payment_id,
                                    orderId: response.razorpay_order_id,
                                    signature: response.razorpay_signature
                                })
                            })
                            .then(res => res.json())
                            .then(data => {
                                if (data.success) {
                                    Swal.fire({
                                        title: 'Success',
                                        text: 'Payment successful!',
                                        icon: 'success',
                                        confirmButtonText: 'OK',
                                    }).then(() => {
                                        window.location.reload();
                                    });
                                } else {
                                    Swal.fire({
                                        title: 'Error',
                                        text: 'Payment verification failed.',
                                        icon: 'error',
                                        confirmButtonText: 'OK',
                                    });
                                }
                            });
                        },
                        "theme": { "color": "#F37254" }
                    };

                    const rzp = new Razorpay(options);
                    rzp.open();
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: 'Failed to create Razorpay order. Please try again.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                }
            } catch (error) {
                console.error('Error retrying payment:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Something went wrong. Please try again later.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        });
    });
});

document.getElementById('download-pdf').addEventListener('click', function() {
    var invoiceElement = document.getElementById('invoice-section');
    html2pdf()
        .from(invoiceElement)
        .set({
            margin: 1,
            filename: 'invoice_' + document.getElementById('order-number').textContent.trim() + '.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait' }
        })
        .save();
});