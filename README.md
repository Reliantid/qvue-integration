# Quidel QVue Mobile App Integration

The QVue mobile app allows third party apps the ability to directly use the testing capabilities of the QVue app. Using this interface, your app can instruct the QVue app to perform a QuickVue At-Home OTC test, and retrieve the test results.

## Getting Started

Before you begin the actual integration process, you must first contact Quidel to register an Integration account. You will need to provide the following information to register your app:

- App or Company Name
- Contact Email Address
- QuickVue At-Home Test Type

Quidel will provide you an **Integration Key**, which you will use to authorize your API access. If your app intends to inetgrate with multiple QuickVue At-Home Test types (COVID-19, COVID-19 + Influenza, etc.), you will be provided a different **Integration Key** for each specific test type.

## Integration Steps

Integrating your Android, iOS, React Native, etc. app with the QVue app can be accomplished with just a few steps.

![Integtration App Flow](/readme_images/interface_flow.png "QVue Integration Flow")
_Integration Flow Diagram_

##### Step 1 - Request Test Access Key

When your app is ready to perform a test run in the QVue app, you must first request a **Test Access Key** by making an API call. You must always request a new Test Access Key for **every** test run you perform.

```
POST /integration/test/accessKey
```

The HTTP request header should contain the an `integration-key` field to authorize the request. You should have already obtained the value for the `integration-key`(**Integration Key**) in the previous **Getting Started** section.

```
{
  "Content-Type": "application/json",
  "integration-key": "KG6gG80Ntn-nIB-k4UDj4CCOAFF-te4Gr6dRe6IF",
   ...
}
```

_Request Test Access Key - HTTP Header example_

The HTTP request body payload has the following fields:

`externalRefId` - (required) an identifier string used to reference this test result in **_YOUR_** system.

`externalReturnUrl` - (optional) a web url or app deep link to be opened by the QVue app at the end of the test run or when the user exits the test run before completing. Ideally this url will be a deep link that returns focus to **_YOUR_** application.

```
{
  "externalRefId": "id_1234567890",
  "externalReturnUrl": "quveinterfacetester://resume_from_test",
}
```

_Request Test Access Key - HTTP Body example_

In this example, my app supports a deep link with the scheme `quveinterfacetester`. The QVue app will open this link when the test run completes, or the user aborts the test run before completion.

##### Step 2 - Recieve the Test Access Key

The HTTP Response from the `/integration/test/accessKey` API call will be a JSON object containing the following fields:

`key` - The `key` if the identifier for the test about to be performed. You app can use this `key` to check the test results.

`applink` - The "applink" is a Firebase Dynamic (Deep) Link url. Your app should open this link to launch the QVue app.

```
{
    "key": "28oX8O-53PlX9r0YazEf6diIiFhBW9UQt5Uum_AY",
    "applink": "https://qvuerun.page.link/V47ST7xFk8yfUKTG6"
}
```

_Request Test Access Key - HTTP Response example_

##### Step 3 - Open the QVue Dynamic Deep Link

When your app is ready to start the testing process, your app should "open" the Firebase Dynamic Link specificed in the `applink` field of the `/integration/test/accessKey` response. The Dynamic Link will open the QVue app, and directly place the app user at the start of the testing process.

If the QVue app is not already installed, the dynamic deep link will redirect the user to the respective App/Play Stores to first install the app. Once the QVue app is installed, the QVue app will start and the app user will be placed at the start of the testing process.

**_Remember:_** You must obtain a new `key` and `applink` before starting a test run. Each `key` and `applink` is directly assoicated with an individual test run. You should never reuse a `key` or `applink` for multiple tests.

##### Step 4 - Check the Test Results

If your app supports deep linking, and you specified a return deep link in the `externalReturnUrl` of the Test Access Key HTTP request, the QVue app will attempt to open the deep link when the test run completes. Assuming your app is configured correctly to support the deep link, your app will be returned to the forground.

You can use the `key` identifier for the test to obtain the test results.

```
GET /integration/test/results/{key}
```

Calling this API endpoint will return the completion status and results of a test. You may choose to store the `key` in your system, and use it at a later time to access the test results. This `key` never expires.

The contents of the HTTP Response body may vary based on how far the app user proceeds in the testing process.

| Field Name    | Description                                                                                                                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status`      | The current status of the test result, e.g. `unknown`,`complete`,`prepared`,`submitted`,`processing`                                                                                                  |
| `result`      | Array of results, one entry per assay. Typically an array with a single result. If the test `status` = `complete` and the `result` is an empty array ([]), then the test may be considered "invalid". |
| `supportCode` | The unique identifier for the test result. The app user can use this as a searchable reference to the test result.                                                                                    |
| `errorCode`   | The error code generated during the test analysis. `0` indicates no error.                                                                                                                            |

NOTE: `supportCode` and `errorCode` may not be present if the app user does not complete the test run.

For example, this request:

```
GET /integration/test/results/GIUsHIacrkDbY7RxUVAto_MZOa1KiLlSkVdJS-Fv
```

has the following response:

```
{
  "status": "complete",
  "supportCode": "QFW6MN92QBQKP9N0KCJ2M",
  "result": [
    {
      "name": "covid",
      "value": false
    }
  ],
  "errorCode": 0
}
```

## Integration Examples

This repository contains a few example app projects, located in the `/examples` directory. There are separate app project examples for Android (Java), iOS (Swift), and React Native. These projects contain sample code on how to get a Test Access Key, initiate the deep link to run the test, and query the API to get the test result.
