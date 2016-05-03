### My first serverless application

I'm an avid NBA fan so part of my day (especially during the playoffs) is devoted to avoiding any mention of last night's NBA scores. One of the big problems associated with this is waiting to watch a game and then it being a blowout by 20, 30 points. Those games are way too boring and generally not worth watching.

I saw a talk on AWS Lambda at the [AWS Loft](https://awsloft.london) in London and wanted to try it out so I built this small serverless app. The architecture looks a bit like:

- Route 53 for DNS Management of wasitclose.co.uk ($0.50 / month)
- S3 for hosting the static site ($0.03 / month)
- API Gateway to provide an endpoint for Lambda (Free for first million requests)
- Lambda to do the actual logic to fetch the scores ($0.000001 / 100ms execution time)
- DynamoDB to cache the responses (~$1.00 / month )

Sure I could have used heroku + node and it would have been free but I can think of a lot of small use cases for Lambda so I wanted to learn more about it.

The app is incredibly simple but it was still remarkably easy to set up and get all these tools working together. API Gateway, Lambda and Dynamodb are all managed by Cloudformation whereas the rest is currently manually managed. 

To get this up and running I used the Serverless Framework - https://github.com/serverless/serverless. This does a lot of the heavy lifting for you, particularly in relation to the cloudformation stuff, and the documentation is great.

If you want to understand how Serverless applications work I would start with the [Serverless Starter](https://github.com/serverless/serverless-starter) repo or [Serverless GraphQL](https://github.com/serverless/serverless-graphql), or poke around in this repo.

The code that is actually executed in the lambda is in [https://github.com/Ianfeather/serverless-nba-scores/blob/master/nba-scores/restApi/lib/index.js](https://github.com/Ianfeather/serverless-nba-scores/blob/master/nba-scores/restApi/lib/index.js)

The end result is at http://wasitclose.co.uk.
