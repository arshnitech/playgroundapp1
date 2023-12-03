const msal = require('@azure/msal-node');
const jwt = require('jsonwebtoken');
/* Credentials */

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL Node configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
 */
const msalConfig = {
    auth: {
      
        clientId: '702',
        authority: 'https://login.microsoftonline.com/4,
     
        clientSecret:'L3a'
    }
};

/**
 * With client credentials flows permissions need to be granted in the portal by a tenant administrator.
 * The scope is always in the format '<resource>/.default'. For more, visit:
 * https://learn.microsoft.com/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
 */
 const tokenRequest = {
    scopes: [
        'https://graph.microsoft.com/.default' // Include default permissions
        //'User.ReadWrite', // Add specific permissions as needed
        //'User.ManageIdentities.All',
        // Add other required specific scopes here
       // 'https://graph.microsoft.com/v1.0/me'
    ]//.join(' ') // Separate scopes with space
};


const apiConfig = {
    uri: 'https://graph.microsoft.com/v1.0/users/'
};

/**
 * Initialize a confidential client application. For more info, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/initialize-confidential-client-application.md
 */
const cca = new msal.ConfidentialClientApplication(msalConfig);

/**
 * Acquires token with client credentials.
 * @param {object} tokenRequest
 */
/*async function getToken(tokenRequest) {
   console.log("Enter getToken method");
    return cca.acquireTokenByClientCredential(tokenRequest);
}*/

 async function getToken() {
    console.log("Entered getToken method from app.js update method");
    try {
        const tokenResponse =  await cca.acquireTokenByClientCredential({
            scopes: tokenRequest.scopes,
        });
 
        if (tokenResponse && tokenResponse.accessToken) {
            console.log("tokenResponse accesstoken is printing at the end " + tokenResponse.accessToken)

            

const token = tokenResponse.accessToken; // Replace with your actual access token

const decodedToken = jwt.decode(token);
console.log(decodedToken);
if (decodedToken && decodedToken.exp) {
    const expiryTimestamp = decodedToken.exp;
    const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds

    const expiresIn = expiryTimestamp - currentTimestamp;
    console.log('Token expires in:', expiresIn, 'seconds');
  } else {
    console.log('Invalid token or expiry not found.');
  }           


return (tokenResponse.accessToken).toString();
           
        } else {
          throw new Error("Token not found or invalid.");
        }
    } catch (error) {
        console.error("Error fetching token:", error);
        throw error;
    }
   
}


module.exports = {
    apiConfig: apiConfig,
    tokenRequest: tokenRequest,
    getToken: getToken
    
};
