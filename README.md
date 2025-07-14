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
<img width="601" height="601" alt="gym_automation" src="https://github.com/user-attachments/assets/6ea20ebd-c5cf-4e7f-a08b-1bfe801b4aac" />

## Deployment Steps

1.  **Clone the Repository:**
    ```
    git clone https://github.com/MalikMamaev95/gym_automation.git
    cd gym_automation
    ```

2.  **Deploy Backend Infrastructure:**
    Create S3 Bucket for Lambda code:
    ```
    aws s3 mb s3://gym-logger-lambda-bucket --region eu-north-1 
    aws s3 cp gym-logger-lambda.zip s3://gym-logger-lambda-bucket/gym-logger-lambda.zip --region eu-north-1
    ```
    Deploy Backend stack:
    ```
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
    Note down the `ApiGatewayInvokeUrl` from the describe command output.
    ```
    aws cloudformation describe-stacks --stack-name GymLoggerBackendStack
    ```

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
    Note down the `UserPoolId`, `UserPoolClientId`, and `IdentityPoolId` from the describe command output.
    ```
    aws cloudformation describe-stacks --stack-name GymLoggerCognitoStack
    ```

4.  **Configure Frontend `aws-exports.js`:**
    Navigate to the `gymlogger-frontend/src` directory.
    Create `aws-exports.js` and update the placeholders with the actual values from the outputs.
    ```
    const awsExports = {
        Auth: {
            Cognito: {
                // From Cognito_template.json Outputs
                userPoolId: 'PLACEHOLDER',
                userPoolClientId: 'PLACEHOLDER',
                identityPoolId: 'PLACEHOLDER',
                region: 'eu-north-1',
            }
        },
        API: {
            REST: {
                GymLoggerApi: {
                    // From Backend_template.json Outputs
                    endpoint: 'PLACEHOLDER',
                    region: 'eu-north-1',
                }
            }
        }
    };

    export default awsExports;
    ```

5.  **Build and Deploy Frontend:**
    Navigate to the `gym-automation` directory.
    ```
    aws cloudformation deploy \
    --template-file frontend_template.json \
    --stack-name GymLoggerFrontendStack \
    --capabilities CAPABILITY_NAMED_IAM \
    --region eu-north-1
    --parameter-overrides \ 
    EnvironmentName=Prod \
    ApiGatewayRestApiId=PLACEHOLDER \
    ApiGatewayRegion=eu-north-1 \
    ApiGatewayStageName=Prod
    ```
    Note down the CloudFront Distribution URL and the ID:
    ```
    aws cloudformation describe-stacks --stack-name GymLoggerFrontendStack
    ```

    Navigate to the `gymlogger-frontend` directory.
    ```
    cd gymlogger-frontend
    npm install 
    npm run build
    ```
    Deploy and sync the application to the S3 bucket:
    ```
    aws s3 rm s3://gym-logger-frontend/ --recursive
    aws s3 sync dist/ s3://gym-logger-frontend/ --delete
    aws cloudfront create-invalidation --distribution-id PLACEHOLDER --paths "/*"
    ```

6.  **Test the Application:**
    Go to the CloudFront Distribution URL in the output and test the application.

## Troubleshooting

* **"The client is not authorized to perform this operation when logging in the application."**
To fix it:
- Check if the `CognitoAuthorizedPolicy` is attached to `Sandbox-GymLoggerAuthenticatedRole` in IAM.
- Ensure the `Resource` for `execute-api:Invoke` is set to `"*"`.

* **"CORS Error."**
```
Access to fetch at 'https://hves0tnelk.execute-api.eu-north-1.amazonaws.com/Prod/entries/0bd4b499-4197-43d4-88f0-150f5f8bb5ec?type=weightlifting' from origin 'https://d1ov8gkrubqum7.cloudfront.net' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The 'Access-Control-Allow-Origin' header has a value 'https://d3mb9gin18nwyg.cloudfront.net' that is not equal to the supplied origin. Have the server send the header with a valid value.
```
To fix it:
- Go to the API in the API Gateway Console.
- Go to the Resources tab.
- Select the `/entries/{userId}` and `/entries/{userId}/{id}` resources and enable CORS.
- Check all Access-Control-Allow-Methods
- Input `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token` in Access-Control-Allow-Headers
- Input the Cloudfrount Distribution URL in Access-Control-Allow-Origin
- Save
  
## What I Learned / Demonstrated
* Design and implement a fully serverless application architecture on AWS.
* Utilize Infrastructure as Code (IaC) principles with AWS CloudFormation for reproducible deployments.
* Develop frontend applications with React and integrate them with backend APIs.
* Work with core AWS services including Lambda, DynamoDB, API Gateway, and S3.
* Manage API security and authentication.
* Troubleshoot and debug issues in a distributed cloud environment.
* Implement data storage solutions with NoSQL databases like DynamoDB.

## Future Enhancements
* Implement analytics and progress visualization of the fitness data.
