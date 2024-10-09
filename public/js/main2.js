
//old
// document.addEventListener('DOMContentLoaded', function () {
//     var cropper;
//     var imageToCropEdit = document.getElementById('imageToCropEdit');
//     var inputEditImage = document.getElementById('inputEditImage');
//     var croppedEditImagesContainer = document.getElementById('croppedEditImagesContainer');
//     var croppedEditImageURLsInput = document.getElementById('croppedEditImageURLs');
//     var filesEditArray = [];
//     var croppedEditImages = [];
//     var croppedEditBlobs = [];  // Store blobs to send to the server

//     var cropModalElementEdit = document.getElementById('cropModalEdit');
//     var cropModalEdit = new bootstrap.Modal(cropModalElementEdit);

//     inputEditImage.addEventListener('change', function (event) {
//         filesEditArray = Array.from(event.target.files);
//         if (filesEditArray.length > 0) {
//             processNextEditImage();
//         }
//     });

//     function processNextEditImage() {
//         if (filesEditArray.length === 0) {
//             return;
//         }
//         var file = filesEditArray.shift();
//         var reader = new FileReader();
//         reader.onload = function (event) {
//             imageToCropEdit.src = reader.result;
//             cropModalEdit.show();
//         };
//         reader.readAsDataURL(file);
//     }

//     cropModalElementEdit.addEventListener('shown.bs.modal', function () {
//         cropper = new Cropper(imageToCropEdit, {
//             viewMode: 3,
//             autoCropArea: 0.65,
//             responsive: true,
//             cropBoxResizable: true,
//         });
//     });

//     cropModalElementEdit.addEventListener('hidden.bs.modal', function () {
//         if (cropper) {
//             cropper.destroy();
//             cropper = null;
//         }
//         if (filesEditArray.length > 0) {
//             processNextEditImage();
//         }
//     });

//     document.getElementById('cropEditImage').addEventListener('click', function () {
//         if (cropper) {
//             var canvas = cropper.getCroppedCanvas({
//                 width: 800,
//                 height: 800,
//                 imageSmoothingQuality: 'high'
//             });
//             canvas.toBlob(function (blob) {
//                 var url = URL.createObjectURL(blob);
//                 croppedEditImages.push(url); // Add the new cropped image URL to the array
//                 croppedEditBlobs.push(blob); // Store the blob to send to the server

//                 // Display the cropped image
//                 var imgElement = document.createElement('img');
//                 imgElement.src = url;
//                 imgElement.style.maxWidth = '150px'; // Set desired maximum width
//                 imgElement.style.height = '200px';    // Maintain aspect ratio
//                 imgElement.style.margin = '10px';
//                 croppedEditImagesContainer.appendChild(imgElement);

//                 // Update the hidden input with cropped image URLs
//                 croppedEditImageURLsInput.value = JSON.stringify(croppedEditImages);

//                 cropModalEdit.hide();
//             });
//         }
//     });

//     document.getElementById('cancelEditCrop').addEventListener('click', function () {
//         cropModalEdit.hide();
//     });

//     document.getElementById('editProductForm').addEventListener('submit', function (event) {
//         // Prevent default form submission
//         event.preventDefault();

//         // Create a new FormData object
//         var formData = new FormData(this);

//         // Append each cropped image blob to the FormData
//         croppedEditBlobs.forEach(function (blob, index) {
//             formData.append('files', blob, 'croppedEditImage' + index + '.png');
//         });

//         // Submit the form data via an AJAX request or other method
//         fetch(`/admin/editproduct/${productId}`, {
//             method: 'PUT',
//             body: formData
//         }).then(response => response.json())
//           .then(data => {
//               if (data.success) {
//                   window.location.href = '/admin/productslist'; // Redirect on success
//               } else {
//                   alert('Failed to update product. Please try again.');
//               }
//           })
//           .catch(error => {
//               console.error(error);
//               // Handle error
//           });
//     });
// });
//edit product
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('editProductForm');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const productId = form.dataset.productId; // Get product ID from data attribute
        const formData = new FormData(form);
        croppedEditBlobs.forEach((blob, index) => {
            console.log(`Blob size for croppedImage-${index}: ${blob.size} bytes`);
            formData.append(`croppedImage-${index}`, blob, `croppedImage-${index}.png`);
        });
         // Log FormData entries for debugging
         console.log('FormData contents:');
         formData.forEach((value, key) => {
             console.log(`${key}:`, value);
         });

        // // Convert FormData to an object
        // const formObject = Object.fromEntries(formData.entries());
// Append cropped blobs to FormData
// croppedEditBlobs.forEach((blob, index) => {
//     formData.append(`croppedImage-${index}`, blob, `croppedImage-${index}.png`);
// });
        try {
            const response = await fetch(`/admin/editproduct/${productId}`, {
                method: 'PUT',
               body:formData
                // headers: {
                //     'Content-Type': 'application/json',
                // },
            });
 // Log the entire response object
 console.log('Response object:', response);

 // Check if the request was successful
 if (response.ok) {
     // Parse the response if it's JSON (or log text if not JSON)
     const responseData = await response.json();
     console.log('Response Data:', responseData);
 } else {
     console.error(`Error: ${response.status} - ${response.statusText}`);
     const errorText = await response.text(); // If the server sends error details as text
     console.error('Error details:', errorText);
 }

            const result = await response.json();

            if (result.status === 'success') {
                Swal.fire({
                    title: 'Success',
                    text: result.message,
                    icon: 'success',
                    confirmButtonText: 'OK',
                }).then(() => {
                    window.location.href = '/admin/productslist'; // Redirect after successful update
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: result.message,
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        } catch (error) {
            console.error('Error updating product:', error);
            Swal.fire({
                title: 'Error',
                text: 'Something went wrong. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    });
});

let croppedEditBlobs = [];

let removedImages = []
//new
document.addEventListener('DOMContentLoaded', function () {
    var cropper;
    var imageToCropEdit = document.getElementById('imageToCropEdit');
    var inputEditImage = document.getElementById('inputEditImage');
    var filesEditArray = [];
    // var croppedEditBlobs = []; // Store blobs to send to the server
    var activeImageWrapper = null; // Track the current image-wrapper being edited

    var cropModalElementEdit = document.getElementById('cropModalEdit');
    var cropModalEdit = new bootstrap.Modal(cropModalElementEdit);

    // Handle file input for new images
    inputEditImage.addEventListener('change', function (event) {
        filesEditArray = Array.from(event.target.files);
        if (filesEditArray.length > 0) {
            processNextEditImage();
        }
    });

    // Process each selected image for cropping
    function processNextEditImage() {
        if (filesEditArray.length === 0) {
            return;
        }
        var file = filesEditArray.shift();
        var reader = new FileReader();
        reader.onload = function (event) {
            imageToCropEdit.src = reader.result;
            cropModalEdit.show();
        };
        reader.readAsDataURL(file);
    }

    // Initialize cropper when the modal is shown
    cropModalElementEdit.addEventListener('shown.bs.modal', function () {
        cropper = new Cropper(imageToCropEdit, {
            viewMode: 3,
            autoCropArea: 0.65,
            responsive: true,
            cropBoxResizable: true,
        });
    });

    // Destroy cropper when the modal is hidden
    cropModalElementEdit.addEventListener('hidden.bs.modal', function () {
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        if (filesEditArray.length > 0) {
            processNextEditImage();
        }
    });

    // Handle the cropping action
    document.getElementById('cropEditImage').addEventListener('click', function () {
        if (cropper) {
            var canvas = cropper.getCroppedCanvas({
                width: 800,
                height: 800,
                imageSmoothingQuality: 'high'
            });
            canvas.toBlob(function (blob) {
                // if (blob.size === 0) {
                //     console.error('The blob is empty. There might be an issue with the cropping.');
                //     return;
                // }
                
                croppedEditBlobs.push(blob);

                // Create a new cropped image URL from the blob
                var croppedImageURL = URL.createObjectURL(blob);

                // Replace the current image inside the active wrapper with the cropped image
                if (activeImageWrapper) {
                    var imgElement = activeImageWrapper.querySelector('img');
                    imgElement.src = croppedImageURL; // Set the new cropped image src
                    imgElement.setAttribute('data-image', croppedImageURL); // Update the data attribute if needed
                }
   // Update the hidden input with cropped image URLs
   
                cropModalEdit.hide(); // Hide the crop modal
            });
        }
    });

    // Add functionality to existing close buttons to open the crop modal for that image
    document.querySelectorAll('.image-wrapper .close-icon').forEach(function (button) {
        button.addEventListener('click', function () {
            activeImageWrapper = button.closest('.image-wrapper'); // Set the active wrapper being edited
           

            // Optionally, if you want to clear the image src on clicking close
            var imgElement = activeImageWrapper.querySelector('img');
            const imgSrc = imgElement.getAttribute('data-image');
            console.log('imgsrc',imgSrc)
            removedImages.push(imgSrc);
            // Update the hidden input field with the removed image URLs as a JSON string
        document.getElementById('removedImages').value = JSON.stringify(removedImages);
            imgElement.src = ''; // Clear the current image src
            imgElement.setAttribute('data-image', ''); // Clear the data-image attribute
        });
    });
});





//creating new category----------------------------------------------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#category-form').addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent form from submitting normally

        const form = e.target;
        const formData = new FormData(form); // Create FormData object to handle file uploads (image)
        
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData, // Send formData for multipart data (includes image)
            });

            const result = await response.json();

            if (result.status === 'success') {
                swal.fire({
                    title: 'Success',
                    text: result.message,
                    icon: 'success',
                    confirmButtonText: 'OK',
                    customClass: {
                        title: 'swal-title-success',
                    }
                }).then(() => {
                    window.location.href = '/admin/addcategories'; // Redirect after successful category creation
                });
            } else {
                swal.fire({
                    title: 'Error',
                    text: result.message,  // Display validation errors or other error messages
                    icon: 'error',
                    confirmButtonText: 'OK',
                    customClass: {
                        title: 'swal-title-error',
                    }
                });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            swal.fire({
                title: 'Error',
                text: 'Something went wrong. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#edit-category-form').addEventListener('submit', async function (e) {
      e.preventDefault();

      const form = e.target;
      const formData = new FormData(form); // Use FormData to handle file upload and other form fields

      try {
        const response = await fetch(form.action, {
          method: 'PUT', // Use PUT method for updating the category
          body: formData, // Send form data (including the file)
        });

        const result = await response.json();

        if (result.status === 'success') {
          swal.fire({
            title: 'Success',
            text: result.message,
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            window.location.href = '/admin/addcategories'; // Redirect after success
          });
        } else {
          swal.fire({
            title: 'Error',
            text: result.message || 'An error occurred while updating the category.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        swal.fire({
          title: 'Error',
          text: 'Something went wrong. Please try again later.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    });
  });



// for creating new offer------------------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#my-form-offer').addEventListener('submit', async function (e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const formObject = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formObject),
            });

            const result = await response.json();

            if (result.status === 'success') {
                swal.fire({
                    title: 'Success',
                    text: result.message,
                    icon: 'success',
                    confirmButtonText: 'OK',
                    customClass: {
                        title: 'swal-title-success',
                    }
                }).then(() => {
                    window.location.href = '/admin/offer'; // Redirect after successful offer creation
                });
            } else {
                swal.fire({
                    title: 'Error',
                    text: result.message,  // Display validation errors
                    icon: 'error',
                    confirmButtonText: 'OK',
                    customClass: {
                        title: 'swal-title-error',
                    }
                });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            swal.fire({
                title: 'Error',
                text: 'Something went wrong. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const applicableToSelect = document.getElementById('applicableTo');
    const productSelect = document.getElementById('productSelect');
    const categorySelect = document.getElementById('categorySelect');

    applicableToSelect.addEventListener('change', function() {
        const value = applicableToSelect.value;
        if (value === 'product') {
            productSelect.style.display = 'block';
            categorySelect.style.display = 'none';
        } else if (value === 'category') {
            productSelect.style.display = 'none';
            categorySelect.style.display = 'block';
        } else {
            productSelect.style.display = 'none';
            categorySelect.style.display = 'none';
        }
    });
});

//for block and unblock offers---------------------------------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    const blockButtons = document.querySelectorAll('.block-offer-btn');
    const unblockButtons = document.querySelectorAll('.unblock-offer-btn');

    blockButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent form default behavior
            const offerId = this.dataset.id;

            Swal.fire({
                title: 'Are you sure?',
                text: "Do you really want to block this offer?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, block it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Make an AJAX request to block the offer
                    fetch(`/admin/block-offer/${offerId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire('Blocked!', 'Offer has been blocked.', 'success').then(() => {
                                window.location.href = '/admin/offer';  // Redirect to offer list
                            });
                        } else {
                            Swal.fire('Error!', data.message || 'Failed to block offer.', 'error');
                        }
                    })
                    .catch(error => {
                        Swal.fire('Error!', 'There was an error blocking the offer.', 'error');
                        console.error('Error:', error);
                    });
                }
            });
        });
    });

    unblockButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent form default behavior
            const offerId = this.dataset.id;

            Swal.fire({
                title: 'Are you sure?',
                text: "Do you want to unblock this offer?",
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, unblock it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Make an AJAX request to unblock the offer
                    fetch(`/admin/unblock-offer/${offerId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire('Unblocked!', 'Offer has been unblocked.', 'success').then(() => {
                                window.location.href = '/admin/offer';  // Redirect to offer list
                            });
                        } else {
                            Swal.fire('Error!', data.message || 'Failed to unblock offer.', 'error');
                        }
                    })
                    .catch(error => {
                        Swal.fire('Error!', 'There was an error unblocking the offer.', 'error');
                        console.error('Error:', error);
                    });
                }
            });
        });
    });
});

//for creating new coupon
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#coupon-form').addEventListener('submit', async function (e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const formObject = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formObject),
            });

            const result = await response.json();

            if (result.status === 'success') {
                swal.fire({
                    title: 'Success',
                    text: result.message,
                    icon: 'success',
                    confirmButtonText: 'OK',
                    customClass: {
                        title: 'swal-title-success',
                    }
                }).then(() => {
                    window.location.href = '/admin/coupon'; // Redirect after successful coupon creation
                });
            } else {
                swal.fire({
                    title: 'Error',
                    text: result.message,  // Display validation errors
                    icon: 'error',
                    confirmButtonText: 'OK',
                    customClass: {
                        title: 'swal-title-error',
                    }
                });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            swal.fire({
                title: 'Error',
                text: 'Something went wrong. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });
});
// for updating coupon---------------------------------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#edit-coupon-form').addEventListener('submit', async function (e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const formObject = Object.fromEntries(formData.entries());
        const couponId = form.dataset.couponId; // Assuming the form has the coupon ID as a dataset attribute
        console.log(form)
        console.log(formData)
        console.log(formObject)
        console.log(couponId)


        try {
            const response = await fetch(`/admin/updatecoupon/${couponId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formObject),
            });

            const result = await response.json();
            console.log(result)

            if (result.status === 'success') {
                swal.fire({
                    title: 'Success',
                    text: result.message,
                    icon: 'success',
                    confirmButtonText: 'OK',
                }).then(() => {
                    window.location.href = '/admin/coupon'; // Redirect after successful update
                });
            } else {
                swal.fire({
                    title: 'Error',
                    text: result.message,
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        } catch (error) {
            console.error('Error updating coupon:', error);
            swal.fire({
                title: 'Error',
                text: 'Something went wrong. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    });
});





//order status change
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#orderStatusForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const formObject = Object.fromEntries(formData.entries());
        const orderId =form.dataset.id;
        console.log(form)
        console.log(formData)
        console.log(formObject)
        console.log(form.action)
        
       console.log('orderId',orderId)

        try {
            const response = await fetch(`/admin/orderstatus/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formObject),
            });

            const result = await response.json();
            console.log('result',result)

            if (result.success) {
                swal.fire({
                    title: 'Success',
                    text: result.message,
                    icon: 'success',
                    confirmButtonText: 'OK',
                    customClass: {
                        title: 'swal-title-success',
                    }
                }).then(() => {
                    window.location.reload(); // Reload the page after updating the status
                });
            } else {
                swal.fire({
                    title: 'Error',
                    text: result.message,  // Display validation errors
                    icon: 'error',
                    confirmButtonText: 'OK',
                    customClass: {
                        title: 'swal-title-error',
                    }
                });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            swal.fire({
                title: 'Error',
                text: 'Something went wrong. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });
});

//generate sales report


let currentPage = 1;

document.getElementById('generateReport').addEventListener('click', async () => {
    await loadOrders(currentPage);
});

async function loadOrders(page = 1) {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const currentDate = new Date().toISOString().split('T')[0]; // Get the current date in 'YYYY-MM-DD' format

    if (!startDate || !endDate) {
        // Use SweetAlert2 instead of alert for validation
        Swal.fire({
            icon: 'warning',
            title: 'Missing Dates',
            text: 'Please select both start and end dates.',
            confirmButtonText: 'OK'
        });
        return;
    }
      // Validate that endDate is greater than or equal to currentDate
      if (endDate > currentDate) {
        Swal.fire({
            icon: 'warning',
            title: 'Invalid End Date',
            text: 'The end date cannot be greater than the current date.',
            confirmButtonText: 'OK',
        });
        return;
    }

    try {
        const response = await fetch('/admin/orders/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ startDate, endDate, page })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const result = await response.json();
        const orders = result.orders;
        

        // Clear existing table rows
        const tableBody = document.getElementById('ordersTableBody');
        tableBody.innerHTML = '';

        const noOrdersFound = document.getElementById('noOrdersFound');
        if (orders.length === 0) {
            noOrdersFound.style.display = 'table-footer-group'; // Show "No orders found" message

            transactionDetails.style.display = 'none'; // Hide transaction details when there are no orders
        } else {
            noOrdersFound.style.display = 'none'; // Hide "No orders found" message
            transactionDetails.style.display = 'block'; // Show transaction details when orders exist

            // Variables for calculating transaction details
            let totalOrders = 0;
            let totalAmount = 0;
            let totalCouponDiscount = 0;
               

            // Populate table with new data
            orders.forEach(order => {
                const totalPrice = order.totalPrice;
        const couponDiscount = order.couponDiscount || 0;

        // Increment total orders count
        totalOrders += 1;

        // Calculate totals
        totalAmount += totalPrice;
        totalCouponDiscount += couponDiscount;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="text-center"><a href="#" class="fw-bold">${order.orderNumber}</a></td>
                    <td>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</td>
                    <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>₹ ${order.totalPrice}</td>
                    <td>₹ ${order.couponDiscount ? order.couponDiscount.toFixed(2) : '0.00'}</td> <!-- Coupon Discount Column -->
                    <td>
                        <span class="badge badge-pill badge-${order.paymentStatus === 'Paid' ? 'soft-success' : 'soft-danger'}">
                            ${order.paymentStatus}
                        </span>
                    </td>
                    <td>${order.paymentMethod}</td>
                    <td><a href="/admin/order/${order._id}" class="btn btn-xs">View details</a></td>
                `;
                tableBody.appendChild(row);
                
            });
            // Calculate total payment (Total amount + coupon discount)
      const totalPayment = totalAmount + totalCouponDiscount;

      // Update transaction details on the page
      document.getElementById('totalOrders').textContent = totalOrders;
      document.getElementById('totalAmount').textContent = `₹ ${totalAmount.toFixed(2)}`;
      document.getElementById('totalCouponDiscount').textContent = `₹ ${totalCouponDiscount.toFixed(2)}`;
      document.getElementById('totalPayment').textContent = `₹ ${totalPayment.toFixed(2)}`;
        }

        // Handle pagination
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        for (let i = 1; i <= result.totalPages; i++) {
            const pageItem = document.createElement('li');
            pageItem.classList.add('page-item');
            if (i === page) {
                pageItem.classList.add('active');
            }
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageItem.addEventListener('click', () => {
                currentPage = i;
                loadOrders(i);
            });
            pagination.appendChild(pageItem);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

  
document.getElementById('downloadTransactionDetails').addEventListener('click', function() {
    // Create jsPDF instance
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Capture the sales report table
    let table = document.getElementById('ordersTableBody').innerHTML;
    let transactionDetails = document.getElementById('transactionDetailsContainer').innerHTML;

    // Add title
    doc.setFontSize(16);
    doc.text('Sales Report', 10, 10);

    // Add table content
    doc.setFontSize(12);
    let rows = table.split('</tr>');
    let startY = 20;

    // Loop through each row of the table
    rows.forEach((row, index) => {
        let cols = row.split('</td>');
        cols.forEach((col, i) => {
            doc.text(col.replace(/<[^>]+>/g, '').trim(), 10 + i * 30, startY + index * 10); // Adjust the position and spacing
        });
    });

    // Add Transaction Details
    doc.text('Transaction Details:', 10, startY + rows.length * 10 + 10);
    let transactionRows = transactionDetails.split('<li>');
    transactionRows.forEach((row, i) => {
        doc.text(row.replace(/<[^>]+>/g, '').trim(), 10, startY + rows.length * 10 + 20 + i * 10);
    });

    // Save the PDF
    doc.save('transaction_details.pdf');
});

