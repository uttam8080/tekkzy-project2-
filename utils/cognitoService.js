const { 
    CognitoIdentityProviderClient, 
    SignUpCommand, 
    InitiateAuthCommand, 
    ConfirmSignUpCommand,
    ForgotPasswordCommand,
    ConfirmForgotPasswordCommand,
    GlobalSignOutCommand,
    GetUserCommand,
    AdminUpdateUserAttributesCommand
} = require("@aws-sdk/client-cognito-identity-provider");

// Initialize the Cognito Provider Client
const client = new CognitoIdentityProviderClient({ 
    region: process.env.AWS_REGION 
});

const clientId = process.env.COGNITO_CLIENT_ID;
// If you are using a client secret, you need to compute the SecretHash. 
// For web apps, usually create a User Pool Client WITHOUT a client secret.

exports.signUp = async (email, password, attributes = []) => {
    const userAttributes = attributes.map(attr => ({
        Name: attr.name,
        Value: attr.value
    }));

    // Add email to attributes always
    userAttributes.push({ Name: 'email', Value: email });

    const command = new SignUpCommand({
        ClientId: clientId,
        Username: email,
        Password: password,
        UserAttributes: userAttributes,
    });

    return await client.send(command);
};

exports.confirmSignUp = async (email, code) => {
    const command = new ConfirmSignUpCommand({
        ClientId: clientId,
        Username: email,
        ConfirmationCode: code,
    });

    return await client.send(command);
};

exports.signIn = async (email, password) => {
    const command = new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: clientId,
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
        },
    });

    return await client.send(command);
};

exports.forgotPassword = async (email) => {
    const command = new ForgotPasswordCommand({
        ClientId: clientId,
        Username: email,
    });

    return await client.send(command);
};

exports.confirmForgotPassword = async (email, code, newPassword) => {
    const command = new ConfirmForgotPasswordCommand({
        ClientId: clientId,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword,
    });

    return await client.send(command);
};

exports.getUser = async (accessToken) => {
    const command = new GetUserCommand({
        AccessToken: accessToken,
    });

    return await client.send(command);
};

exports.signOut = async (accessToken) => {
    const command = new GlobalSignOutCommand({
        AccessToken: accessToken,
    });

    return await client.send(command);
};
