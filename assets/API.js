const DIRECT_API_LUIS = "https://westus.api.cognitive.microsoft.com/luis/prediction/v3.0/apps/04a6b73e-624a-4b4a-b333-743a5c41f1d8/slots/staging/predict?subscription-key=1ec28eb72f0348ee8be3dac05b8f1a0a&verbose=true&show-all-intents=true&log=true&query=";
const TRANS_API = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=en"
const TRANS_HEADER = {
    'Ocp-Apim-Subscription-Key': '3775a0d97cd240c58c66788f35de2270',
    'Content-type': 'application/json'
}