const axios = require('axios');

/**
 * Calls the endpoint with authorization bearer token.
 * @param {string} endpoint
 * @param {string} accessToken
 */
async function callApi(endpoint, accessToken) {

    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };
    console.log("Token received successfully  " + options.accessToken ); 
    console.log('request made to web API at: ' + new Date().toString());
    console.log('Endpoint from fetch is : ' + endpoint); 
    try {
        const response = await axios.get(endpoint, options);
                return response.data;
    } catch (error) {
        console.log(error)
        return error;
    }
};

async function updateAzurePasswordApi(endpoint,cloudpassword,accesstoken)
{

    const payload = {
        passwordProfile: {
          password: cloudpassword,
          forceChangePasswordNextSignIn: false // Set this to true if you want the user to change the password at next sign-in
        }
      };
      const options = {
        headers: {
            'Authorization': `Bearer ${accesstoken}`,
            'Content-Type': 'application/json'
        }
    };
     console.log("Endpoint is " + endpoint);
     console.log("Access token  " + accesstoken); 
      try {
        const response = await axios.patch(endpoint, payload, { options });
    
        if (response.status === 204) {
          console.log(`Password updated successfully for user ${username}`);
          return true;
        } else {
          console.error(`Failed to update password for user ${username}`);
          return false;
        }
      } catch (error) {
        console.error('Error updating password:', error.message);
        return false;
      }

};

module.exports = {
    callApi: callApi,
    updateAzurePasswordApi: updateAzurePasswordApi
};