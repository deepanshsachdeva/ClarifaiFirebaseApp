'use strict';

// DEPENDENCIES

// Cloud Storage
const gc_storage_client = require('@google-cloud/storage')();


// CLOUD FUNCTION

/**
 * 
 * @param {*} request 
 * @param {*} response 
 */
exports.handleGcbUploads = (request, response) => {

	console.log(' ☀️ REQUEST BODY');
	console.log(request.body);

	// The following variables Fetched from the Incoming Request Body.

	// The name of the bucket to create
	const bucket_name_to_create = request.body.bucket_name;

	// The file name of the image to save in the Bucket
	const file_name_to_save_in_bucket = request.body.file_name;

	// The URL to fetch the image from
	const url_to_fetch_image_from = request.body.image_url;


	// Options sent while uploading the file to Google Cloud Storage
	const gc_storage_upload_options = {
		destination: file_name_to_save_in_bucket,
		resumable: true,
		public: true // the uploaded file should be public
	};

	// Get Promise which either gets or creates the bucket with the name
	const getBucketPromise = getBucket(bucket_name_to_create);

	// Resolve Get Bucket Promise
	getBucketPromise.then((bucket_to_upload_to) => {
	
		// upload image to Bucket using the URL received in Request body
		bucket_to_upload_to.upload(url_to_fetch_image_from, gc_storage_upload_options)
			.then((upload_data) => {

				console.log(' 😄 FILE UPLOADED SUCCESSFULLY');

				const response_data = {
					public_link: `http://storage.googleapis.com/${bucket_name_to_create}/${file_name_to_save_in_bucket}`
				};
				
				// return response with public link
				response.status(200).send(response_data);
					
			}).catch((error) => {

				console.log(' ❗️ ERROR ❗️ ');
				console.log(error);

				response.status(400).send(`Error while uploading image to bucket : ${error}`);

			});
	
	}).catch((error) => {

		console.log(' ❗️ ERROR ❗️ ');
		console.log(error);

		response.status(400).send(`Error while creating bucket : ${error}`);

	});	
  
};

/**
 * 
 * @param {*} bucket_name 
 */
const getBucket = (bucket_name) => {

	return new Promise((resolve, reject) => {

		// find Bucket with existing name
		gc_storage_client.bucket(bucket_name).get()
			
			.then((existing_bucket_data) => {
		
				// if found, resolve with Bucket instance
				resolve(existing_bucket_data[0]);
			
			}).catch((error) => {
				
				console.log(' ⚠️ Bucket does not exist with the given name');

				// create a new Bucket with name
				gc_storage_client.createBucket(bucket_name)
					
					.then((new_bucket_data) => {

						console.log(` 😃 Created a Bucket on GCS with the name ${bucket_name}`);

						// resolve with new Bucket instance
						resolve(new_bucket_data[0]);

					}).catch((error) => {

						reject(error);

					});

			});

	});

};

exports.event = (event, callback) => {
  callback();
};