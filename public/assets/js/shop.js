(function ($) {
    'use strict';
    /*Product Details*/
    var productDetails = function () {
        $('.product-image-slider').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            fade: false,
            asNavFor: '.slider-nav-thumbnails',
        });

        $('.slider-nav-thumbnails').slick({
            slidesToShow: 5,
            slidesToScroll: 1,
            asNavFor: '.product-image-slider',
            dots: false,
            focusOnSelect: true,
            prevArrow: '<button type="button" class="slick-prev"><i class="fi-rs-angle-left"></i></button>',
            nextArrow: '<button type="button" class="slick-next"><i class="fi-rs-angle-right"></i></button>'
        });

        // Remove active class from all thumbnail slides
        $('.slider-nav-thumbnails .slick-slide').removeClass('slick-active');

        // Set active class to first thumbnail slides
        $('.slider-nav-thumbnails .slick-slide').eq(0).addClass('slick-active');

        // On before slide change match active thumbnail to current slide
        $('.product-image-slider').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            var mySlideNumber = nextSlide;
            $('.slider-nav-thumbnails .slick-slide').removeClass('slick-active');
            $('.slider-nav-thumbnails .slick-slide').eq(mySlideNumber).addClass('slick-active');
        });

        $('.product-image-slider').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            var img = $(slick.$slides[nextSlide]).find("img");
            $('.zoomWindowContainer,.zoomContainer').remove();
            $(img).elevateZoom({
                zoomType: "inner",
                cursor: "crosshair",
                zoomWindowFadeIn: 500,
                zoomWindowFadeOut: 750
            });
        });
        
        //Elevate Zoom
        if ( $(".product-image-slider").length ) {
            $('.product-image-slider .slick-active img').elevateZoom({
                zoomType: "inner",
                cursor: "crosshair",
                zoomWindowFadeIn: 500,
                zoomWindowFadeOut: 750
            });
        }
        // Function to change main image when a thumbnail is clicked
        window.changeImage = function (imageSrc, slideIndex) {
            $('#main-image').attr('src', imageSrc);
            $('.zoomWindowContainer, .zoomContainer').remove(); // Remove zoom container on image change
        
            // Change image and go to the slide
            $('.product-image-slider').slick('slickGoTo', slideIndex);
        
            // Reset translate3d
            $('.slick-track').css('transform', 'translate3d(0px, 0px, 0px)');
        
            $('#main-image').elevateZoom({
                zoomType: "inner",
                cursor: "crosshair",
                zoomWindowFadeIn: 500,
                zoomWindowFadeOut: 750
            });
        };
    
        //Filter color/Size
        $('.list-filter').each(function () {
            $(this).find('a').on('click', function (event) {
                event.preventDefault();
                $(this).parent().siblings().removeClass('active');
                $(this).parent().toggleClass('active');
                $(this).parents('.attr-detail').find('.current-size').text($(this).text());
                $(this).parents('.attr-detail').find('.current-color').text($(this).attr('data-color'));
            });
        });


        //Qty Up-Down
        $('.detail-qty').each(function () {
            var qtyval = parseInt($(this).find('.qty-val').text(), 10);
            $('.qty-up').on('click', function (event) {
                event.preventDefault();
                qtyval = qtyval + 1;
                $(this).prev().text(qtyval);
            });
            $('.qty-down').on('click', function (event) {
                event.preventDefault();
                qtyval = qtyval - 1;
                if (qtyval > 1) {
                    $(this).next().text(qtyval);
                } else {
                    qtyval = 1;
                    $(this).next().text(qtyval);
                }
            });
        });

        $('.dropdown-menu .cart_list').on('click', function (event) {
            event.stopPropagation();
        });
    };
    /* WOW active */
    new WOW().init();

    //Load functions
    $(document).ready(function () {
        productDetails();
    });

})(jQuery);



document.addEventListener("DOMContentLoaded", function() {
    const sizeOptions = document.querySelectorAll(".size-option");
    const quantityInput = document.getElementById("quantity-input");
    const sizeInput = document.getElementById("size-input");
    const qtyUp = document.querySelector(".qty-up");
    const qtyDown = document.querySelector(".qty-down");
    const qtyVal = document.querySelector(".qty-val");
    const form = document.getElementById("add-to-cart-form");

    // Size selection
    sizeOptions.forEach(option => {
        option.addEventListener("click", function(event) {
            event.preventDefault();
            sizeOptions.forEach(opt => opt.classList.remove("active"));
            this.classList.add("active");
            sizeInput.value = this.getAttribute("data-size");
        });
    });

    // Quantity increase
    // qtyUp.addEventListener("click", function(event) {
    //     event.preventDefault();
    //     let currentQty = parseInt(qtyVal.textContent);
    //     currentQty += 1;
    //     qtyVal.textContent = currentQty;
    //     quantityInput.value = currentQty;
    // });

    // Quantity decrease
    // qtyDown.addEventListener("click", function(event) {
    //     event.preventDefault();
    //     let currentQty = parseInt(qtyVal.textContent);
    //     if (currentQty > 1) {
    //         currentQty -= 1;
    //         qtyVal.textContent = currentQty;
    //         quantityInput.value = currentQty;
    //     }
    // });
    // Form submission check
    form.addEventListener("submit", function(event) {
        if (sizeInput.value === "") {
            event.preventDefault();
            alert("Please select your size.");
        }
    });
    // function changeImage(src) {
    //     document.getElementById('main-image').src = src;
    //     console.log("Image source clicked: " + src); // Debugging line
    // }
    
});

function showNewAddressForm() {
    document.getElementById('newAddressForm').style.display = 'block';
}

//seletion of shipping address
    function setSelectedAddress() {
        // Get the selected address index
        const selectedRadio = document.querySelector('input[name="selectedAddress"]:checked');
        if (selectedRadio) {
            // Retrieve address data from the selected radio button
            const firstName = selectedRadio.getAttribute('data-firstname');
            const lastName = selectedRadio.getAttribute('data-lastname');
            const address = selectedRadio.getAttribute('data-address');
            const city = selectedRadio.getAttribute('data-city');
            const country = selectedRadio.getAttribute('data-country');
            const postalCode = selectedRadio.getAttribute('data-postalcode');
            const phone = selectedRadio.getAttribute('data-phone');
            const email = selectedRadio.getAttribute('data-email');

            // Update shipping address input fields
            document.querySelector('input[name="shippingAddress[firstName]"]').value = firstName;
            document.querySelector('input[name="shippingAddress[lastName]"]').value = lastName;
            document.querySelector('input[name="shippingAddress[address]"]').value = address;
            document.querySelector('input[name="shippingAddress[city]"]').value = city;
            document.querySelector('input[name="shippingAddress[country]"]').value = country;
            document.querySelector('input[name="shippingAddress[postalCode]"]').value = postalCode;
            document.querySelector('input[name="shippingAddress[phone]"]').value = phone;
            document.querySelector('input[name="shippingAddress[email]"]').value = email;
        }
    }
    //quantity,subtotal and cart subtotal updation
    // $(document).ready(function() {
    //      // Variable to store the previous quantity
    

   
    //     // When quantity is changed
    //     $('.qty-val').on('change', function() {
    //         var itemId = $(this).data('id');
    //         var quantity = $(this).val();
    //         var price = $(this).data('price');
    //         var currentTotalQty = $(this).data('total-qty');
            
    //         console.log(quantity)
    //         console.log(`totalQty is : ${currentTotalQty}`)
            
    
           
    
    //         // Calculate the new subtotal for the item
    //         var subtotal = price * quantity;
    //         $(this).closest('tr').find('.subtotal').text('Rs ' + subtotal);
    
    //         // Send AJAX request to update cart
    //         $.ajax({
    //             url: '/cart/update/' + itemId,
    //             method: 'POST',
    //             data: {
    //                 quantity: quantity
    //             },
    //             success: function(response) {
    //                 if (response.success) {
    //                     // Update the overall subtotal on the page
    //                     // $('.cart-total').text('Rs ' + response.subtotal);
    //                     $('.cart-total, .cart_total_amount span').text('Rs ' + response.subtotal);
    //                     // updateCartTotals(response.cartItems);
    //                     response.products.forEach(product => {
    //                         $(`input.qty-val[data-id="${product.itemId}"]`).data('total-qty', product.totalQty);
    //                     });
    //                 } else {
    //                     // alert(response.message);
    //                     Swal.fire({
    //                         icon: 'error',
    //                         title: 'Oops...',
    //                         text: response.message,
    //                         confirmButtonText: 'OK'
    //                     });
    //                     if (response.message === 'No stock available') {
    //                         $(this).val(currentTotalQty); // Reset to previous quantity
    //                     }
    //             }
    //             },
    //             // error: function(err) {
    //             //     console.log(err);
    //             //     alert('An error occurred while updating the cart.');
    //             // }
    //             error: function(jqXHR, textStatus, errorThrown) {
    //                 console.log('Error:', textStatus, errorThrown);
    //                 alert('An error occurred while updating the cart.');
    //                 // Swal.fire({
    //                 //     icon: 'error',
    //                 //     title: 'Oops...',
    //                 //     text: 'An error occurred while updating the cart.',
    //                 //     confirmButtonText: 'OK'
    //                 // });
    //             }
    //         });
    //     });
    // });
        
    $(document).ready(function() {
        $('.qty-val').on('change', function() {
            var itemId = $(this).data('id');
            var quantity = $(this).val();
            var price = $(this).data('price');
            var currentTotalQty = $(this).data('total-qty');
    
            // Check if the quantity exceeds available stock
            if (currentTotalQty <= 0 && quantity > $(this).data('prev-qty')) {
                Swal.fire({
                    icon: 'error',
                    title: 'No Stock Available',
                    text: 'Cannot increase quantity as there is no stock available.',
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.isConfirmed) {
                        location.reload(); // Reload the page after the OK button is clicked
                    }
                });
                $(this).val($(this).data('prev-qty')); // Reset the quantity input to the previous value
                return;
            }
    
            // Calculate the new subtotal for the item
            var subtotal = price * quantity;
            $(this).closest('tr').find('.subtotal').text('Rs ' + subtotal);
    
            // Send AJAX request to update cart
            $.ajax({
                url: '/cart/update/' + itemId,
                method: 'POST',
                data: {
                    quantity: quantity
                },
                success: function(response) {
                    if (response.success) {
                        // Update the overall subtotal on the page
                        $('.cart-total, .cart_total_amount span').text('Rs ' + response.subtotal);
                        
                        // Update totalQty for each product in the cart
                        response.products.forEach(product => {
                            $(`input.qty-val[data-id="${product.itemId}"]`).data('total-qty', product.totalQty);
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: response.message,
                            confirmButtonText: 'OK'
                        });
                        $(this).val($(this).data('prev-qty')); // Reset the quantity input
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('Error:', textStatus, errorThrown);
                    alert('An error occurred while updating the cart.');
                }
            });
        });
    
        // Store the initial quantity in a custom data attribute
        $('.qty-val').each(function() {
            $(this).data('prev-qty', $(this).val());
        });
    });
    
    // /public/js/submitReview.js

document.addEventListener("DOMContentLoaded", function () {
    const reviewForm = document.getElementById("reviewForm");
  
    reviewForm.addEventListener("submit", async function (e) {
      e.preventDefault(); // Prevent the form from submitting traditionally
  
      // Get form data
      const formData = new FormData(reviewForm);
      const data = Object.fromEntries(formData.entries());
  
      try {
        // Send form data via fetch
        const response = await fetch('/submit-review', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
  
        const result = await response.json();
  
        if (response.status === 201) {
          // Show success message using SweetAlert
          Swal.fire({
            icon: 'success',
            title: 'Review Submitted',
            text: result.message,
          }).then(() => {
            window.location.reload(); // Reload the page to show the updated review count
          });
        } else {
          // Show error message using SweetAlert
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: result.message,
          });
        }
      } catch (error) {
        // Handle any unexpected errors
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Something went wrong. Please try again later.',
        });
      }
    });
  });
  
        
    

   
    
    document.addEventListener('DOMContentLoaded', () => {
        // Your existing delete confirmation logic
        document.querySelectorAll('.delete-address-form button').forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const form = event.target.closest('form');
                const index = event.target.getAttribute('data-index');
                const addressItem = form.closest('.address-item'); // Get the address item to remove
    
                Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!',
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Make the AJAX request to delete the address
                        fetch(`/profile/delete-address/${index}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                
                            },
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                Swal.fire({
                                    title: 'Deleted!',
                                    text: data.message,
                                    icon: 'success',
                                    confirmButtonColor: '#3085d6',
                                    confirmButtonText: 'OK'
                                }).then(() => {
                                    // Optionally, remove the deleted address from the DOM
                                    addressItem.remove();
                                });
                            } else {
                                Swal.fire({
                                    title: 'Error!',
                                    text: data.message,
                                    icon: 'error',
                                    confirmButtonColor: '#3085d6',
                                    confirmButtonText: 'OK'
                                });
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            Swal.fire({
                                title: 'Error!',
                                text: 'Something went wrong!',
                                icon: 'error',
                                confirmButtonColor: '#3085d6',
                                confirmButtonText: 'OK'
                            });
                        });
                    }
                });
            });
        });
    });
    document.getElementById('search-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        const query = document.getElementById('search-query').value.trim();
        const encodedQuery = encodeURIComponent(query);
        // window.location.href = `/search?query=${encodedQuery}`;
        window.location.href = `/products?search=${encodedQuery}`;
    });
    // negative value management in cart
    document.querySelectorAll('.qty-val').forEach(function (input) {
        input.addEventListener('change', function (event) {
            const quantity = parseInt(event.target.value);
            if (quantity < 1) {
                event.target.value = 1;
                // alert("Quantity cannot be less than 1");
                 // Using SweetAlert instead of alert
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Quantity',
                text: 'Quantity cannot be less than 1',
                confirmButtonText: 'OK'
            });
            }
        });
    });
    
   

    
    
    document.getElementById('checkoutForm').onsubmit = async function(e) {
        e.preventDefault(); // Prevent the form from submitting
    
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        const couponSelect = document.getElementById('couponSelect');
    const couponDiscount = parseFloat(couponSelect.options[couponSelect.selectedIndex].getAttribute('data-discount')) || 0;
    const initialTotal = parseFloat(document.querySelector('.product-subtotal .text-brand').textContent.replace('Rs ', ''));
    const discountAmount = initialTotal * (couponDiscount / 100);
    const finalTotal = initialTotal - discountAmount;

    // Update hidden total price input
    document.getElementById('finalTotalPrice').value = finalTotal.toFixed(2);
     // Check if payment method is COD and total price exceeds Rs 1000
     if (data.paymentMethod === 'COD' && finalTotal > 1000) {
        Swal.fire({
            title: 'COD Not Allowed',
            text: 'Cash on Delivery is not allowed for orders above Rs 1000.',
            icon: 'error',
            confirmButtonText: 'OK',
        });
        return; // Stop further processing
    }
    
        try {
            // Step 1: Create an order on the server and get Razorpay details
            const response = await fetch('/placeorder', {
                method: 'POST',
                body: new URLSearchParams(data),
            });
            const result = await response.json();
            console.log("resultin frontend:", result);
            if (data.paymentMethod === "Wallet" && result.success) {
                // Wallet payment was successful
                Swal.fire({
                    title: 'Payment Successful',
                    text: result.message,
                    icon: 'success',
                    confirmButtonText: 'OK',
                }).then(() => {
                    window.location.href = "/orderconfirmation";
                });
            } else if (data.paymentMethod === "Wallet" && !result.success) {
                // Wallet payment failed due to insufficient funds
                Swal.fire({
                    title: 'Insufficient Funds',
                    text: result.message,
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
    
            else if (result.razorpayOrderId) {
                // Step 2: Initialize Razorpay payment options
                const options = {
                    key: result.razorpayKeyId, // Your Razorpay key ID
                    amount: result.totalPrice * 100, // Amount in paise
                    currency: "INR",
                    name: "AMian",
                    description: "Order Payment",
                    order_id: result.razorpayOrderId, // Razorpay Order ID
                    handler: async function(response) {
                        // Step 3: Verify the payment with the backend
                        try {
                            const verifyResponse = await fetch('/verify-payment', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    orderId: result.razorpayOrderId,
                                    paymentId: response.razorpay_payment_id,
                                    signature: response.razorpay_signature,
                                    order: result.order
                                }),
                            });
    
                            const verifyResult = await verifyResponse.json();
                            console.log('verifyResult', verifyResult);
    
                            if (verifyResult.success) {
                                // Payment verified successfully
                                window.location.href = "/orderconfirmation";
                            } else {
                                // Payment verification failed
                                await handlePaymentFailure(result.razorpayOrderId, result.order);
                            }
    
                        } catch (error) {
                            console.error('Payment verification failed:', error);
                            await handlePaymentFailure(result.razorpayOrderId, result.order);
                        }
                    },
                    prefill: {
                        name: data['shippingAddress[firstName]'] + ' ' + data['shippingAddress[lastName]'],
                        email: data['shippingAddress[email]'],
                        contact: data['shippingAddress[phone]']
                    },
                    theme: {
                        color: "#3399cc"
                    },
                    modal: {
                        ondismiss: async function() {
                            // Handle payment failure by updating the status to "Failed"
                            await handlePaymentFailure(result.razorpayOrderId, result.order);
                        }
                    }
                };
    
                // Step 4: Open the Razorpay payment modal
                const razorpay = new Razorpay(options);
                razorpay.open();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to initiate payment');
        }
    };
    
    // Function to handle payment failure
    async function handlePaymentFailure(orderId, order) {
        try {
            const failureResponse = await fetch('/update-payment-failure', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: orderId,
                    order: order
                }),
            });
    
            const failureResult = await failureResponse.json();
            if (failureResult.success) {
                Swal.fire({
                    title: 'Payment Failed',
                    text: 'Payment was not completed. Redirecting to your profile.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                }).then(() => {
                    // Redirect to profile after clicking "OK"
                    window.location.href = "/profile";
                });
            } else {
                console.error('Failed to update payment status:', failureResult.message);
            }
        } catch (error) {
            console.error('Failed to handle payment failure:', error);
        }
    }
    
   
    document.addEventListener('DOMContentLoaded', function() {
        const couponSelect = document.getElementById('couponSelect');
        const totalElement = document.querySelector('.product-subtotal .text-brand');
        const hiddenTotalInput = document.querySelector('input[name="totalPrice"]');
        const couponDiscountElement = document.getElementById('couponDiscount');
        const couponRow = document.getElementById('couponRow');
        
    
        // Get the initial total from the page
        let initialTotal = parseFloat(totalElement.textContent.replace('Rs ', ''));
    
        couponSelect.addEventListener('change', function() {
            const selectedCoupon = this.value;
            const couponDiscount = parseFloat(this.options[this.selectedIndex].getAttribute('data-discount'));
            

    
            if (selectedCoupon) {
                // Calculate the discount and new total
                const discountAmount = initialTotal * (couponDiscount / 100);
                const discountedTotal = initialTotal - discountAmount;
    
                // Update the total price in the DOM
                totalElement.textContent = 'Rs ' + discountedTotal.toFixed(2);
    
                // Update the hidden input value
                hiddenTotalInput.value = discountedTotal.toFixed(2);
    
                // Display the discount amount
                couponDiscountElement.textContent = ' -Rs ' + discountAmount.toFixed(2);
                couponRow.style.display = '';
                
            } else {
                // If no coupon is selected, reset to the original total
                totalElement.textContent = 'Rs ' + initialTotal.toFixed(2);
                hiddenTotalInput.value = initialTotal.toFixed(2);
    
                // Clear discount display
                couponDiscountElement.textContent = '';
                couponRow.style.display = 'none';
                
            }
        });
    
    });
     // Event listener for retry payment buttons
    
    
    
    document.addEventListener('DOMContentLoaded', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const activeTab = urlParams.get('tab') || 'dashboard';
    
        const tabLinks = document.querySelectorAll('.nav-link');
        tabLinks.forEach(link => {
          if (link.getAttribute('href').includes(activeTab)) {
            link.classList.add('active');
            document.querySelector(link.getAttribute('href')).classList.add('active', 'show');
          } else {
            link.classList.remove('active');
            document.querySelector(link.getAttribute('href')).classList.remove('active', 'show');
          }
        });
      });
      document.addEventListener("DOMContentLoaded", function() {
        const ordersTab = document.getElementById('orders-tab');
        ordersTab.addEventListener('click', function() {
          fetch('/orders?page=1&limit=4') // Adjust page and limit as needed
            .then(response => response.text())
            .then(html => {
              document.querySelector('.dashboard-content').innerHTML = html;
            });
        });
      });
    // Function to change the main image source
    // function changeImage(imageSrc, index) {
    //     console.log('image',imageSrc)
    //     const mainImage = document.getElementById('main-image');
    
    //     // Check if the image source is being updated correctly
    //     if (mainImage) {
    //         mainImage.src = imageSrc;  // Update the src of the main image
    
    //         // Remove any previous zoom settings (if using ElevateZoom or similar libraries)
    //         $('.zoomWindowContainer, .zoomContainer').remove();
    
    //         // Re-initialize the zoom on the new image if required
    //         $(mainImage).elevateZoom({
    //             zoomType: "inner",
    //             cursor: "crosshair",
    //             zoomWindowFadeIn: 500,
    //             zoomWindowFadeOut: 750
    //         });
    
    //         // Move the slick slider to the corresponding thumbnail using index
    //         $('.product-image-slider').slick('slickGoTo', index);
    //     }
    // }