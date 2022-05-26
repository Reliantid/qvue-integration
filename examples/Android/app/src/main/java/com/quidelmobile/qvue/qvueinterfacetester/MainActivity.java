package com.quidelmobile.qvue.qvueinterfacetester;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;

import org.json.JSONObject;
import org.json.JSONTokener;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.Buffer;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executor;

public class MainActivity extends AppCompatActivity {

    private String _apiBase;

    EditText editTextIntegrationKey;
    EditText editTextTestReferenceID;
    EditText editTextReturnDeepLink;

    TextView textViewAccessKey;
    TextView textViewIntegrationDeepLink;
    TextView textViewTestResult;

    Button buttonRequestAccessKey;
    Button buttonPerformTest;
    Button buttonQueryResult;

    ProgressBar progressBarRequestAccessKey;
    ProgressBar progressBarQueryResult;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        _apiBase = getString(R.string.api_base);

        editTextIntegrationKey = (EditText) findViewById(R.id.editTextIntegrationKey);
        editTextTestReferenceID = (EditText) findViewById(R.id.editTextTestReferenceID);
        editTextReturnDeepLink = (EditText) findViewById(R.id.editTextReturnDeepLink);

        textViewAccessKey = (TextView) findViewById(R.id.textViewAccessKey);
        textViewIntegrationDeepLink = (TextView) findViewById(R.id.textViewIntegrationDeepLink);
        textViewTestResult = (TextView) findViewById(R.id.textViewTestResult);

        buttonRequestAccessKey = (Button)findViewById(R.id.buttonRequestAccessKey);
        buttonPerformTest = (Button)findViewById(R.id.buttonPerformTest);
        buttonQueryResult = (Button)findViewById(R.id.buttonQueryResult);

        progressBarRequestAccessKey = (ProgressBar)findViewById(R.id.progressBarRequestAccessKey);
        progressBarQueryResult = (ProgressBar)findViewById(R.id.progressBarQueryResult);
    }

    public void onRequestAccessKey(View view) {
        progressBarRequestAccessKey.setVisibility(View.VISIBLE);
        buttonPerformTest.setEnabled(false);
        buttonQueryResult.setEnabled(false);

        // reset the output access key and deep link text views
        textViewAccessKey.setText("");
        textViewIntegrationDeepLink.setText("");

        Thread requestThread = new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    URL url = new URL(_apiBase + "/integration/test/accessKey");
                    HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
                    urlConnection.setRequestMethod("POST");
                    urlConnection.setRequestProperty("Content-Type", "application/json");
                    urlConnection.setRequestProperty("Accept", "application/json");

                    // Set a HTTP header property ("integration-key") containing the QVue Integration Key you received for your integration to the QVue app
                    String integrationKey = editTextIntegrationKey.getText().toString();
                    if (!integrationKey.isEmpty()) {
                        urlConnection.setRequestProperty("integration-key", integrationKey);
                    }

                    // Set the parameters for the HTTP body
                    urlConnection.setDoOutput(true);
                    JSONObject json = new JSONObject();
                    String testReferenceID = editTextTestReferenceID.getText().toString();
                    if (!testReferenceID.isEmpty()) {
                        json.put("externalRefId", testReferenceID);
                    }
                    String returnDeepLink = editTextReturnDeepLink.getText().toString();
                    if (!returnDeepLink.isEmpty()) {
                        json.put("externalReturnUrl", returnDeepLink);
                    }
                    String jsonString = json.toString();
                    OutputStream outStream = urlConnection.getOutputStream();
                    byte [] body = jsonString.getBytes(StandardCharsets.UTF_8);
                    outStream.write(body, 0, body.length);
                    outStream.close();

                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(urlConnection.getInputStream(), StandardCharsets.UTF_8))) {
                        StringBuilder response = new StringBuilder();
                        String responseLine = null;
                        while ((responseLine = reader.readLine()) != null) {
                            response.append(responseLine.trim());
                        }

                        // extract the values from the response
                        JSONObject jsonResponse = (JSONObject) new JSONTokener(response.toString()).nextValue();
                        String key = jsonResponse.getString("key");
                        String applink = jsonResponse.getString("applink");

                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                textViewAccessKey.setText(key);
                                textViewIntegrationDeepLink.setText(applink);

                                progressBarRequestAccessKey.setVisibility(View.INVISIBLE);
                                buttonPerformTest.setEnabled(true);
                                buttonQueryResult.setEnabled(true);
                            }
                        });

                    }

                    urlConnection.disconnect();
                } catch (Exception ex) {
                    System.console().printf("Exception:: %s", ex.getMessage());
                    progressBarRequestAccessKey.setVisibility(View.INVISIBLE);
                    buttonPerformTest.setEnabled(true);
                    buttonQueryResult.setEnabled(true);

                }
            }
        });

        requestThread.start();
    }

    public void onPerformTest(View view) {
        String deepLink = textViewIntegrationDeepLink.getText().toString();

        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setData(Uri.parse(deepLink));
        startActivity(intent);
    }

    public void onQueryTestResult(View view) {
        progressBarQueryResult.setVisibility(View.VISIBLE);

        TextView textViewTestResult = (TextView) findViewById(R.id.textViewTestResult);
        textViewTestResult.setText("");
        TextView textViewAccessKey = (TextView) findViewById(R.id.textViewAccessKey);
        String accessKey = textViewAccessKey.getText().toString();

        Thread requestThread = new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    URL url = new URL(_apiBase + "/integration/test/results/" + accessKey);
                    HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
                    urlConnection.setRequestMethod("GET");
                    urlConnection.setRequestProperty("Accept", "application/json");

                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(urlConnection.getInputStream(), StandardCharsets.UTF_8))) {
                        StringBuilder response = new StringBuilder();
                        String responseLine = null;
                        while ((responseLine = reader.readLine()) != null) {
                            response.append(responseLine.trim());
                        }

                        // extract the values from the response
                        JSONObject jsonResponse = (JSONObject) new JSONTokener(response.toString()).nextValue();
                        String jsonText = jsonResponse.toString();

                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                textViewTestResult.setText(jsonText);

                                progressBarQueryResult.setVisibility(View.INVISIBLE);
                            }
                        });

                    }

                    urlConnection.disconnect();
                } catch (Exception ex) {
                    System.console().printf("Exception:: %s", ex.getMessage());
                    progressBarQueryResult.setVisibility(View.INVISIBLE);
                }
            }
        });

        requestThread.start();
    }
}