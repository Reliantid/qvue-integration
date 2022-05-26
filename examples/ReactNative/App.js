/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect } from 'react'
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Image,
  View,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'

const DEFAULT_API_BASE = 'https://quidel-staging.reliantid.com'
const DEFAULT_INTEGRATION_KEY = 'KG6gG80Ntn-nIB-k4UDj4CCOAFF-te4Gr6dRe6IF'
const DEFAULT_TEST_REFERNCE_ID = '1234567890'
const DEFAULT_RETURN_DEEP_LINK = 'quveinterfacetester://resume_from_test'

const Button = ({ disabled, title, onPress }) => {
  return (
    <TouchableOpacity disabled={disabled} activeOpacity={0.7} onPress={onPress}>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.button}>
          <Text style={styles.buttonText}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const Indicator = ({ visible }) => {
  if (!visible) {
    return null
  }

  return <ActivityIndicator />
}

const App = () => {
  const [integrationKey, setIntegrationKey] = useState('')
  const [testReferenceID, setTestReferenceID] = useState('')
  const [returnDeepLink, setReturnDeepLink] = useState('')
  const [testAccessKey, setTestAccessKey] = useState('')
  const [integrationDeepLink, setIntegrationDeepLink] = useState('')
  const [queryResult, setQueryResult] = useState('')
  const [isRequestingAccessKey, setIsRequestingAccessKey] = useState(false)
  const [isQueryingResult, setIsQueryingResult] = useState(false)

  const onRequestTestAccessKey = () => {
    setIsRequestingAccessKey(true)

    const url = DEFAULT_API_BASE + '/integration/test/accessKey'

    const body = {
      externalRefId: testReferenceID,
    }
    if (!!returnDeepLink.trim()) {
      body['externalReturnUrl'] = returnDeepLink.trim()
    }

    fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'integration-key': integrationKey || '',
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((json) => {
        setTestAccessKey(json.key || '')
        setIntegrationDeepLink(json.applink || '')
      })
      .catch((error) => {
        console.log('Request Test Access Key Error:: ', error)
      })
      .finally(() => {
        setIsRequestingAccessKey(false)
      })
  }

  const onPerformTest = () => {
    Linking.openURL(integrationDeepLink).catch((error) => {
      console.log('Open App Linke Error:: error')
    })
  }

  const onQueryResult = () => {
    setIsQueryingResult(true)

    const url = DEFAULT_API_BASE + '/integration/test/results/' + testAccessKey

    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then((json) => {
        setQueryResult(JSON.stringify(json || ''))
      })
      .catch((error) => {
        console.log('Query Test Result Error:: ', error)
      })
      .finally(() => {
        setIsQueryingResult(false)
      })
  }

  useEffect(() => {
    setIntegrationKey(DEFAULT_INTEGRATION_KEY)
    setTestReferenceID(DEFAULT_TEST_REFERNCE_ID)
    setReturnDeepLink(DEFAULT_RETURN_DEEP_LINK)
  }, [])

  return (
    <SafeAreaView style={styles.fullscreen}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={{}}>
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <Image source={require('./assets/q.png')} style={styles.image} />
          <Text style={styles.titleText}>QVue Interface Tester</Text>
        </View>
        <View style={{ padding: 20 }}>
          <Text style={[styles.stepText]}>1. Request Test Access Key</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.labelText}>Integration API Key</Text>
            <TextInput
              placeholder="Integration API Key"
              style={styles.editText}
              value={integrationKey}
              autoComplete="off"
              autoCorrect={false}
              onChange={(text) => setIntegrationKey(text)}
            />
            <Text style={styles.labelText}>Test Reference ID</Text>
            <TextInput
              placeholder="Test Reference ID"
              style={styles.editText}
              value={testReferenceID}
              autoComplete="off"
              autoCorrect={false}
              onChange={(text) => setReturnDeepLink(text)}
            />
            <Text style={styles.labelText}>Return Deep Link (optional)</Text>
            <TextInput
              placeholder="Return Deep Link (optional)"
              style={styles.editText}
              value={returnDeepLink}
              autoComplete="off"
              autoCorrect={false}
              onChange={(text) => setTestReferenceID(text)}
            />
            <View style={{ marginVertical: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Button
                  disabled={isRequestingAccessKey}
                  title="1. Request Access"
                  style={styles.button}
                  onPress={onRequestTestAccessKey}
                />
                <View style={{ marginLeft: 20 }}>
                  <Indicator visible={isRequestingAccessKey} />
                </View>
              </View>
            </View>
          </View>
          <View style={styles.separator} />
          <Text style={[styles.stepText]}>2. Request Test Access Key</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.labelText}>Test Access Key</Text>
            <TextInput
              editable={false}
              multiline={true}
              style={[styles.editText, { textAlignVertical: 'top' }]}
              value={testAccessKey}
            />
            <Text style={styles.labelText}>Integration Deep Link</Text>
            <TextInput
              editable={false}
              multiline={true}
              style={[styles.editText, { textAlignVertical: 'top' }]}
              value={integrationDeepLink}
            />
            <View style={{ marginVertical: 10 }}>
              <Button
                disabled={isRequestingAccessKey}
                title="2. Perform Test"
                style={styles.button}
                onPress={onPerformTest}
              />
            </View>
          </View>
          <View style={styles.separator} />
          <Text style={[styles.stepText]}>3. Check Test Result</Text>
          <View style={styles.inputContainer}>
            <View style={{ marginVertical: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Button
                  disabled={isRequestingAccessKey || isQueryingResult}
                  title="3. Query Result"
                  style={styles.button}
                  onPress={onQueryResult}
                />
                <View style={{ marginLeft: 20 }}>
                  <Indicator visible={isQueryingResult} />
                </View>
              </View>
            </View>
            <TextInput
              editable={false}
              multiline={true}
              style={styles.resultText}
              value={queryResult}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    tintColor: '#6066B0',
  },
  titleText: {
    paddingVertical: 8,
    fontSize: 20,
    color: 'black',
  },
  stepText: {
    fontSize: 18,
    paddingVertical: 4,
    color: 'black',
  },
  inputContainer: {
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 10,
  },
  labelText: {
    fontSize: 16,
    color: 'black',
  },
  editText: {
    fontSize: 16,
    lineHeight: 20,
    marginVertical: 8,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#78909C',
    color: 'black',
  },
  resultText: {
    fontSize: 16,
    lineHeight: 20,
    marginVertical: 8,
    paddingVertical: 6,
    paddingHorizontal: 6,
    textAlignVertical: 'top',
    color: 'black',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0066FF',
    borderRadius: 8,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 9,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
  },
  separator: {
    borderBottomColor: '#ABB2B9',
    borderBottomWidth: 2,
    marginVertical: 20,
    marginHorizontal: 10,
  },
})

export default App
