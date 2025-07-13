# gym_automation
## Introduction
This is my second GitHub project. When tracking my gym, weight and cardio progress I used to use an Excel spreadsheet to keep track of everything. I made a simple automation process using Google Scripts and AWS Lambda that would send data to a DynamoDB database. 

I decided to redo the project with more technical depth and no Excel. This time I will create a standalone application using React and deploy DynamoDB, AWS API Gateway, S3 bucket and Lambda using AWS Cloudformation. (This app is for personal use)

**Technologies Used:**
* **React**
* **AWS Lambda**
* **Amazon DynamoDB**
* **Amazon API Gateway**
* **Amazon S3**
* **AWS CloudFormation**
* **AWS IAM**

## Architecture
The architecture of this project is fully serverless and cost effective. I will be using an Amazon S3 bucket to host the React application as a static website. User interactions will trigger the API Gateway and this will in turn invoke the Lambda functions and these will in turn read/write gym data to and from the DynamoDB database. 

## Diagram
A high-level architecture diagram illustrating the interaction between React frontend, API Gateway, Lambda, and DynamoDB will be added here.

## Deployment Steps

1.  **Clone the Repository:**
    ```
    git clone https://github.com/MalikMamaev95/gym_automation.git
    cd gym_automation
    ```

2.  **Deploy Backend Infrastructure:**
    ```
    aws s3 mb s3://gym-logger-lambda-bucket --region eu-north-1 
    aws s3 cp gym-logger-lambda.zip s3://gym-logger-lambda-bucket/gym-logger-lambda.zip --region eu-north-1
    aws cloudformation deploy \
      --template-file backend_template.json \
      --stack-name GymLoggerBackendStack \
      --capabilities CAPABILITY_NAMED_IAM \
      --region eu-north-1 \
      --parameter-overrides \
        EnvironmentName=Prod \
        LambdaCodeS3Bucket=gym-logger-lambda-bucket \
        LambdaCodeS3Key=gym-logger-lambda.zip
    ```
    Note down the `ApiGatewayInvokeUrl` from the CloudFormation stack outputs.

3.  **Deploy Cognito Infrastructure:**
    ```
    aws cloudformation deploy \
      --template-file cognito_template.json \
      --stack-name GymLoggerCognitoStack \
      --capabilities CAPABILITY_NAMED_IAM \
      --region eu-north-1 \
      --parameter-overrides \
        EnvironmentName=Prod \
        ApiGatewayRestApiId=PLACEHOLDER \
        ApiGatewayRegion=eu-north-1 \
        ApiGatewayStageName=Prod
    ```
    Note down the `UserPoolId`, `UserPoolClientId`, and `IdentityPoolId` from the CloudFormation stack outputs.

4.  **Configure Frontend `aws-exports.js`:**
    Navigate to the `gymlogger-frontend/src` directory.
    Open `aws-exports.js` and update the placeholders with the actual values from the outputs.

5.  **Build and Deploy Frontend:**
    Navigate to the `gym-automation` directory.
    ```
    aws cloudformation deploy \
    --template-file frontend_template.json \
    --stack-name GymLoggerFrontendStack \
    --stack-name GymLoggerFrontendS3Stack \
    --capabilities CAPABILITY_NAMED_IAM \
    --region eu-north-1
    --parameter-overrides \ 
    EnvironmentName=Prod \
    ApiGatewayRestApiId=PLACEHOLDER \
    ApiGatewayRegion=eu-north-1 \
    ApiGatewayStageName=Prod
    ```

    Navigate to the `gymlogger-frontend` directory.
    ```
    cd gymlogger-frontend
    npm install 
    npm run build
    ```
    Deploy the application to the S3 bucket:
    ```
    aws s3 rm s3://gym-logger-frontend/ --recursive

    # Sync files
    aws s3 sync dist/ s3://gym-logger-frontend/ --delete
    ```

6.  **Manual Post-Deployment Configurations (Important):**

    * **Cloudfront Setup:**
        * Create a CloudFront distribution.
            - Origin Domain: gym-logger-frontend.s3-website.eu-north-1.amazonaws.com
            - Name: PLACEHOLDER
            - Viewer Protocol Policy: Redirect HTTP to HTTPS
            - Origin Request Policy: CORS-S3Origin
            - Default Root Object: index.html 
    * **API Gateway CloudWatch Logs Role:**
        * Go to AWS API Gateway console -> Account -> Settings.
        * Configure "CloudWatch log role ARN" to `arn:aws:iam::YOUR_AWS_ACCOUNT_ID:role/aws-service-role/apigateway.amazonaws.com/AWSServiceRoleForAPIGateway`. (This is a one-time account-level setup per region).
    * **Cognito User Pool Client Callback/Logout URLs:**
        * Go to AWS Cognito console -> User Pools -> Your User Pool -> App integration -> App clients -> Your App Client.
        * Add your CloudFront HTTPS URL (e.g., `https://d3mb9gin18nwyg.cloudfront.net`) to "Allowed callback URLs" and "Allowed sign-out URLs". Keep `http://localhost:5173` for local development.

7.  **Test the Application:**
    Open your CloudFront endpoint URL (e.g., `https://d3mb9gin18nwyg.cloudfront.net`) on a browser. Clear browser cache and cookies before testing.


## Troubleshooting
Here are common issues you might encounter during deployment or operation, and their solutions:

* **"Attributes did not conform to the schema: custom:userId: Attribute does not exist in the schema."**
    * **Cause:** Cognito User Pool schema is missing the `custom:userId` attribute.
    * **Fix:** Ensure your `cognito_template.json` has `custom:userId` defined in the `Schema` property of `AWS::Cognito::UserPool`. If it does, force a CloudFormation update of `GymLoggerCognitoStack` and verify the `GymLoggerUserPoolClient` has read/write permissions for this attribute.

* **"Access to fetch at ... has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present..."**
    * **Cause:** The browser is blocking the request because the API Gateway response (especially error responses like 403/502) does not include the `Access-Control-Allow-Origin` header.
    * **Fix:** Ensure your `backend_template.json` includes `AWS::ApiGateway::GatewayResponse` resources for `DEFAULT_4XX` and `DEFAULT_5XX` with the correct CORS headers. Also, ensure your API Gateway methods' `IntegrationResponses` and `MethodResponses` are configured for CORS (as updated in the template).

* **`403 Forbidden` / "The client is not authorized to perform this operation."**
    * **Cause:** The authenticated user's IAM role (assumed via Cognito Identity Pool) does not have `execute-api:Invoke` permissions on the API Gateway resource.
    * **Fix:** Verify the `CognitoAuthorizedPolicy` attached to `Sandbox-GymLoggerAuthenticatedRole` in IAM. Ensure the `Resource` for `execute-api:Invoke` is correctly set (e.g., `"*"` or `arn:aws:execute-api:REGION:ACCOUNT_ID:REST_API_ID/*/*`). Also, confirm the Identity Pool's Trust Policy correctly allows `cognito-identity.amazonaws.com` to assume the role. Clear browser cache and re-login after changes.

* **`502 Bad Gateway` / `Runtime.ImportModuleError` (in Lambda logs)**
    * **Cause:** Your Lambda function failed to load a required Node.js module (e.g., `uuid` or `aws-sdk`). For Node.js 18.x+, `aws-sdk` v2 is no longer bundled.
    * **Fix:**
        1.  **Upgrade to AWS SDK v3:** Update `lambda_code/package.json` to include `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb`.
        2.  **Update `lambda_code/index.js`** to use AWS SDK v3 syntax (`DynamoDBClient`, `DynamoDBDocumentClient.from(client)`, `dynamoDb.send(new PutCommand(params))`, etc.).
        3.  **Re-install dependencies:** `npm install` in `lambda_code`.
        4.  **Re-zip:** `zip -r gym-logger-lambda.zip .` (from *inside* `lambda_code` directory to ensure `index.js` and `node_modules` are at the root of the zip).
        5.  **Re-upload `gym-logger-lambda.zip` to S3** and update your Lambda function in the console or via CloudFormation.

## What I Learned / Demonstrated
* Design and implement a fully serverless application architecture on AWS.
* Utilize Infrastructure as Code (IaC) principles with AWS CloudFormation for reproducible deployments.
* Develop frontend applications with React and integrate them with backend APIs.
* Work with core AWS services including Lambda, DynamoDB, API Gateway, and S3.
* Manage API security and authentication (as the project evolves).
* Troubleshoot and debug issues in a distributed cloud environment.
* Implement data storage solutions with NoSQL databases like DynamoDB.

## Future Enhancements
* Implement analytics and progress visualization of the fitness data.